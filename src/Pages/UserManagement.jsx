import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../CSS/admin.css';

// Move UserModal and FormField outside the component to prevent re-creation on every render
const UserModal = ({ isOpen, onClose, title, onSubmit, submitText, children, actionLoading }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        zIndex: 2001
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>{title}</h2>
        </div>
        <form onSubmit={onSubmit} autoComplete="off">
          {children}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={actionLoading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#0078D4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: actionLoading ? 'not-allowed' : 'pointer',
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              {actionLoading ? 'Processing...' : submitText}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, name, type = 'text', value, onChange, error, required = false, options = null }) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#495057' }}>
      {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
    </label>
    {options ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '10px',
          border: `2px solid ${error ? '#dc3545' : '#e9ecef'}`,
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none'
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '10px',
          border: `2px solid ${error ? '#dc3545' : '#e9ecef'}`,
          borderRadius: '8px',
          fontSize: '14px',
          outline: 'none'
        }}
      />
    )}
    {error && (
      <span style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' }}>
        {error}
      </span>
    )}
  </div>
);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://13.214.122.184:8000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!showEditModal && !formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setActionLoading(true);
      // Combine first and last name for backend
      const submitData = { ...formData, name: formData.firstName + ' ' + formData.lastName };
      delete submitData.firstName;
      delete submitData.lastName;
      await axios.post('http://13.214.122.184:8000/api/users', submitData);
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setActionLoading(true);
      // Combine first and last name for backend
      const updateData = { ...formData, name: formData.firstName + ' ' + formData.lastName };
      delete updateData.firstName;
      delete updateData.lastName;
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }
      await axios.put(`http://13.214.122.184:8000/api/users/${selectedUser._id}`, updateData);
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      await axios.delete(`http://13.214.122.184:8000/api/users/${selectedUser._id}`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    // Split name into first and last for editing
    let firstName = '', lastName = '';
    if (user.name) {
      const parts = user.name.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    setFormData({
      firstName,
      lastName,
      email: user.email || '',
      password: '',
      role: user.role || 'user',
      phone: user.phone || '',
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'user',
      phone: '',
      status: 'active'
    });
    setFormErrors({});
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });



  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#0078D4', marginBottom: '20px' }}></i>
          <p style={{ fontSize: '18px', color: '#6c757d' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      {/* Enhanced User Management Header */}
<div style={{
  background: 'linear-gradient(135deg, rgba(0, 120, 212, 1) 0%, rgba(0, 90, 158, 0.9) 100%)',
  borderRadius: '20px',
  padding: '40px 35px',
  marginBottom: '35px',
  boxShadow: '0 15px 35px rgba(0, 120, 212, 0.5)',
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Background Pattern */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.4
  }}></div>

  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
    gap: '20px'
  }}>
    {/* Left Content */}
    <div style={{ flex: 1, minWidth: '300px' }}>
      <div style={{ marginBottom: '15px' }}>
        <span style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '6px 15px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          User Management
        </span>
      </div>

      <h1 style={{
        fontSize: '3rem',
        color: 'white',
        margin: '0 0 10px 0',
        fontWeight: '800',
        textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        lineHeight: '1.1'
      }}>
        <span style={{
          background: 'linear-gradient(45deg, #90EE90, #32CD32)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontWeight: '900'
        }}>
          User
        </span>{' '}
        Management
      </h1>

      <p style={{
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '1.2rem',
        margin: '0 0 15px 0',
        fontWeight: '400',
        lineHeight: '1.4'
      }}>
        Manage system users and their permissions
        <br />
        <span style={{
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '5px'
        }}>
          <span style={{
            fontSize: '0.9rem',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            👁️ View
          </span>
          <span style={{
            fontSize: '0.9rem',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            🛠️ Edit
          </span>
          <span style={{
            fontSize: '0.9rem',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            ❌ Remove
          </span>
        </span>
      </p>
    </div>

    {/* Right Actions */}
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'flex-end'
    }}>
      <Link
        to="/Adminpage"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '25px',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)'
          
        }}
      >
        <i className="fas fa-arrow-left"></i>
        Back to Dashboard
      </Link>

      <button
        onClick={openAddModal}
        style={{
          display: 'inline-flex',        
          alignItems: 'center',      
          justifyContent: 'center',         
          gap: '8px',                    
          padding: '12px 70px',
          background: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          borderRadius: '25px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          fontWeight: '600',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',    
          textAlign: 'center'    
        }}
      >
        <i className="fas fa-plus"></i>
        Add User
      </button>
    </div>
  </div>
</div>


      {/* Filters */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              minWidth: '120px'
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
           
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {/* Users Table */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Name</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                <th style={{ padding: '15px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Phone</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Role</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, idx) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '15px', fontWeight: '600' }}>{user.name}</td>
                  <td style={{ padding: '15px', color: '#6c757d' }}>{user.email}</td>
                  <td style={{ padding: '15px', color: '#6c757d' }}>{user.phone}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: user.role === 'admin' ? '#d4edda' : user.role === 'moderator' ? '#fff3cd' : '#e2e3e5',
                      color: user.role === 'admin' ? '#155724' : user.role === 'moderator' ? '#856404' : '#495057'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: user.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: user.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(user)}
                        style={{
                          background: '#0078D4',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              <i className="fas fa-users" style={{ fontSize: '48px', marginBottom: '15px', color: '#dee2e6' }}></i>
              <h4>No Users Found</h4>
              <p>No users match your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <UserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        onSubmit={handleAddUser}
        submitText="Add User"
      >
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          error={formErrors.firstName}
          required
        />
        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          error={formErrors.lastName}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={formErrors.password}
          required
        />
        <FormField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          error={formErrors.phone}
          required
        />
        <FormField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
            
          ]}
        />
        <FormField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        />
      </UserModal>

      {/* Edit User Modal */}
      <UserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        onSubmit={handleEditUser}
        submitText="Update User"
      >
        <FormField
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          error={formErrors.firstName}
          required
        />
        <FormField
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          error={formErrors.lastName}
          required
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={formErrors.email}
          required
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          error={formErrors.password}
        />
        <FormField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          error={formErrors.phone}
          required
        />
        <FormField
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={[
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' },
            
          ]}
        />
        <FormField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
        />
      </UserModal>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px #f8d7da44'
            }}>
              <img
                src={require('../images/admin/Cancelled.png')}
                alt="Cancelled"
                style={{ width: '38px', height: '38px', objectFit: 'contain', display: 'block' }}
              />
            </div>
            
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Confirm Delete</h3>
            <p style={{ color: '#6c757d', marginBottom: '25px' }}>
              Are you sure you want to delete user "{selectedUser?.name}"? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
