import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../CSS/admindrivers.css';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalMode, setModalMode] = useState('edit'); // 'edit', 'delete'

  // Form state for editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    license: '',
    experience: '',
    status: 'active'
  });

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/driver');
      setDrivers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError('Failed to fetch drivers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter drivers based on search and status
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle modal actions
  const handleDeleteDriver = (driver) => {
    console.log('Delete driver function called:', driver);
    try {
      setSelectedDriver(driver);
      setModalMode('delete');
      setShowModal(true);
      console.log('Delete modal should now be open');
    } catch (error) {
      console.error('Error in handleDeleteDriver:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with mode:', modalMode);
    
    try {
      setLoading(true);
      
      if (modalMode === 'edit') {
        console.log('Updating driver with data:', formData);
        const response = await axios.put(`http://localhost:8000/api/driver/${selectedDriver._id}`, formData);
        console.log('Update response:', response.data);
        alert('Driver updated successfully!');
      } else if (modalMode === 'delete') {
        console.log('Deleting driver with ID:', selectedDriver._id);
        const response = await axios.delete(`http://localhost:8000/api/driver/${selectedDriver._id}`);
        console.log('Delete response:', response.data);
        alert('Driver deleted successfully!');
      }
      
      setShowModal(false);
      setSelectedDriver(null);
      fetchDrivers(); // Refresh the list
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      console.error('Error response:', err.response?.data);
      alert(`Error ${modalMode === 'edit' ? 'updating' : 'deleting'} driver. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (driverId, newStatus) => {
    console.log('Status change function called:', driverId, newStatus);
    try {
      const response = await axios.put(`http://localhost:8000/api/driver/${driverId}`, { 
        status: newStatus 
      });
      console.log('Status update response:', response.data);
      
      // Update the local state immediately
      setDrivers(prevDrivers => 
        prevDrivers.map(driver => 
          driver._id === driverId 
            ? { ...driver, status: newStatus }
            : driver
        )
      );
      
      alert(`Driver status updated to ${newStatus}!`);
      console.log('Status updated successfully');
    } catch (err) {
      console.error('Error updating driver status:', err);
      console.error('Error response:', err.response?.data);
      alert('Error updating driver status. Please try again.');
      
      // Refresh the list to restore the original state
      fetchDrivers();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDriver(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      license: '',
      experience: '',
      status: 'active'
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Enhanced Sidebar */}
      <div id="nav-bar" className="nav-bar" 
           style={{ 
             backgroundColor: '#2c3e50',
             boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
             transition: 'all 0.3s ease',
             width: '280px',
             position: 'fixed',
             left: 0,
             top: 0,
             height: '100vh',
             zIndex: 1000,
             overflowY: 'auto'
           }}>
        
        <div id="nav-header" style={{ padding: '20px', borderBottom: '1px solid #34495e' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              background: '#0078D4', 
              borderRadius: '50%',
              margin: '0 auto 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-users" style={{ color: 'white', fontSize: '24px' }}></i>
            </div>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "1.5rem", display: 'block' }}>
              Driver Management
            </span>
            <small style={{ color: '#bdc3c7', fontSize: '12px' }}>Car Booking System</small>
          </div>
        </div>

        <div id="nav-content" style={{ padding: '20px 0' }}>
          {[
            { icon: "fas fa-tachometer-alt", label: "Dashboard", path: "/Adminpage" },
            { icon: "fas fa-car", label: "Vehicles", path: "/AdminVehicles" },
            { icon: "fas fa-users", label: "Drivers", path: "/AdminDrivers", active: true },
            { icon: "fas fa-calendar-alt", label: "Bookings", path: "/AdminBookings" },
            { icon: "fas fa-chart-bar", label: "Reports", path: "/AdminReports" },
            { icon: "fas fa-cog", label: "Settings", path: "/AdminSettings" }
          ].map((item, index) => (
            <a
              key={index}
              href={item.path}
              className={`nav-item ${item.active ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                color: item.active ? '#0078D4' : '#ecf0f1',
                textDecoration: 'none',
                borderLeft: item.active ? '4px solid #0078D4' : '4px solid transparent',
                backgroundColor: item.active ? '#34495e' : 'transparent',
                transition: 'all 0.3s ease',
                margin: '5px 0'
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.target.style.backgroundColor = '#34495e';
                  e.target.style.color = '#0078D4';
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#ecf0f1';
                }
              }}
            >
              <i className={item.icon} style={{ marginRight: '15px', fontSize: '18px' }}></i>
              <span style={{ fontWeight: item.active ? '600' : '500' }}>{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: '280px', 
        width: 'calc(100% - 280px)', 
        padding: '30px',
        background: '#f8f9fa',
        minHeight: '100vh'
      }}>
        {/* Enhanced Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          color: 'white',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ 
              width: '50px',
              height: '50px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '15px'
            }}>
              <i className="fas fa-users" style={{ fontSize: '24px' }}></i>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '600' }}>
                Driver Management
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '1.1rem' }}>
                Manage all registered drivers in your fleet
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { 
              title: 'Total Drivers', 
              value: drivers.length, 
              icon: 'fas fa-users',
              color: '#3498db',
              bgColor: '#e3f2fd'
            },
            { 
              title: 'Active Drivers', 
              value: drivers.filter(d => d.status === 'active').length, 
              icon: 'fas fa-user-check',
              color: '#27ae60',
              bgColor: '#e8f5e8'
            },
            { 
              title: 'Inactive Drivers', 
              value: drivers.filter(d => d.status === 'inactive').length, 
              icon: 'fas fa-user-times',
              color: '#e74c3c',
              bgColor: '#ffeaea'
            },
            { 
              title: 'Suspended Drivers', 
              value: drivers.filter(d => d.status === 'suspended').length, 
              icon: 'fas fa-user-slash',
              color: '#f39c12',
              bgColor: '#fff3e0'
            }
          ].map((stat, index) => (
            <div 
              key={index}
              style={{ 
                background: 'white',
                borderRadius: '15px',
                padding: '25px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '2rem', 
                    fontWeight: '700',
                    color: stat.color
                  }}>
                    {stat.value}
                  </h3>
                  <p style={{ 
                    margin: '5px 0 0 0', 
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    {stat.title}
                  </p>
                </div>
                <div style={{ 
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: stat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className={stat.icon} style={{ fontSize: '24px', color: stat.color }}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Controls */}
        <div style={{ 
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search drivers by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 45px 12px 15px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0078D4';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0,120,212,0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <i className="fas fa-search" style={{ 
                  position: 'absolute',
                  right: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '16px'
                }}></i>
              </div>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '12px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0078D4';
                e.target.style.boxShadow = '0 0 0 3px rgba(0,120,212,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              onClick={fetchDrivers}
              style={{
                padding: '12px 20px',
                background: '#0078D4',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#106ebe';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#0078D4';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '50px',
            background: 'white',
            borderRadius: '15px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#0078D4', marginBottom: '20px' }}></i>
              <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>Loading drivers...</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#fff2f2',
            border: '1px solid #ffcccb',
            borderRadius: '15px',
            padding: '30px',
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#e74c3c', marginBottom: '15px' }}></i>
            <p style={{ fontSize: '1.2rem', color: '#e74c3c', margin: 0 }}>{error}</p>
            <button
              onClick={fetchDrivers}
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Enhanced Drivers Grid */}
        {!loading && !error && (
          <div>
            {filteredDrivers.length === 0 ? (
              <div style={{ 
                background: 'white',
                borderRadius: '15px',
                padding: '60px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
              }}>
                <i className="fas fa-user-tie" style={{ fontSize: '64px', color: '#ccc', marginBottom: '20px' }}></i>
                <h3 style={{ fontSize: '1.5rem', color: '#666', margin: '0 0 10px 0' }}>No drivers found</h3>
                <p style={{ color: '#999', margin: 0 }}>No drivers match your search criteria.</p>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '25px'
              }}>
                {filteredDrivers.map((driver) => (
                  <div 
                    key={driver._id} 
                    style={{
                      background: 'white',
                      borderRadius: '15px',
                      padding: '25px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                      border: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-5px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ position: 'relative', marginRight: '15px' }}>
                        {driver.driverImageUrl ? (
                          <img
                            src={`http://localhost:8000${driver.driverImageUrl}`}
                            alt={`${driver.firstName} ${driver.lastName}`}
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '3px solid #e0e0e0'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: '#f0f0f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #e0e0e0'
                          }}>
                            <i className="fas fa-user" style={{ fontSize: '24px', color: '#999' }}></i>
                          </div>
                        )}
                        
                        <div style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: driver.status === 'active' ? '#27ae60' : 
                                     driver.status === 'inactive' ? '#e74c3c' : '#f39c12'
                        }}>
                          {driver.status}
                        </div>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '1.3rem', 
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {driver.firstName} {driver.lastName}
                        </h3>
                        <p style={{ 
                          margin: '2px 0 0 0', 
                          color: '#666',
                          fontSize: '0.9rem'
                        }}>
                          ID: {driver._id?.slice(-6) || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      {[
                        { icon: 'fas fa-envelope', label: 'Email', value: driver.email },
                        { icon: 'fas fa-phone', label: 'Phone', value: driver.contact || driver.phone },
                        { icon: 'fas fa-id-card', label: 'License', value: driver.DLicenceNo || driver.license },
                        { icon: 'fas fa-calendar', label: 'Experience', value: driver.age || driver.experience ? `${driver.age || driver.experience} years` : null }
                      ].filter(item => item.value).map((item, index) => (
                        <div key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '8px 0',
                          borderBottom: '1px solid #f5f5f5'
                        }}>
                          <i className={item.icon} style={{ 
                            width: '20px', 
                            color: '#0078D4', 
                            marginRight: '10px' 
                          }}></i>
                          <span style={{ 
                            color: '#666', 
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={driver.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(driver._id, e.target.value);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteDriver(driver);
                        }}
                        style={{
                          padding: '8px 12px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#c0392b';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#e74c3c';
                        }}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={closeModal}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: modalMode === 'edit' ? '600px' : '400px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div style={{
              padding: '25px 30px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                {modalMode === 'edit' && (
                  <>
                    <i className="fas fa-edit" style={{ color: '#0078D4' }}></i>
                    Edit Driver
                  </>
                )}
                {modalMode === 'delete' && (
                  <>
                    <i className="fas fa-trash" style={{ color: '#e74c3c' }}></i>
                    Delete Driver
                  </>
                )}
              </h2>
              <button onClick={closeModal} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#999',
                padding: '5px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#999';
              }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '30px' }}>
              {modalMode === 'edit' && (
                <form onSubmit={handleSubmit}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    {[
                      { key: 'firstName', label: 'First Name', type: 'text', required: true },
                      { key: 'lastName', label: 'Last Name', type: 'text', required: true },
                      { key: 'email', label: 'Email', type: 'email', required: true },
                      { key: 'phone', label: 'Phone', type: 'tel', required: true },
                      { key: 'license', label: 'License', type: 'text', required: true },
                      { key: 'experience', label: 'Experience (years)', type: 'number', required: true }
                    ].map((field) => (
                      <div key={field.key} style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{
                          marginBottom: '8px',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {field.label} {field.required && <span style={{ color: '#e74c3c' }}>*</span>}
                        </label>
                        <input
                          type={field.type}
                          value={formData[field.key]}
                          onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                          required={field.required}
                          style={{
                            padding: '12px 15px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#0078D4';
                            e.target.style.boxShadow = '0 0 0 3px rgba(0,120,212,0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    ))}
                    
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{
                        marginBottom: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        Status <span style={{ color: '#e74c3c' }}>*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        required
                        style={{
                          padding: '12px 15px',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          outline: 'none',
                          background: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0078D4';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,120,212,0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'flex-end',
                    paddingTop: '20px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <button type="button" onClick={closeModal} style={{
                      padding: '12px 25px',
                      background: '#f8f9fa',
                      color: '#666',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e9ecef';
                      e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#666';
                    }}>
                      Cancel
                    </button>
                    <button type="submit" style={{
                      padding: '12px 25px',
                      background: '#0078D4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#106ebe';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#0078D4';
                      e.target.style.transform = 'translateY(0)';
                    }}>
                      <i className="fas fa-save"></i>
                      Save Changes
                    </button>
                  </div>
                </form>
              )}

              {modalMode === 'delete' && selectedDriver && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#fff2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '36px', color: '#e74c3c' }}></i>
                  </div>
                  
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    Are you sure you want to delete this driver?
                  </h3>
                  
                  <p style={{
                    margin: '0 0 10px 0',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#0078D4'
                  }}>
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </p>
                  
                  <p style={{
                    margin: '0 0 30px 0',
                    color: '#666',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                  }}>
                    This action cannot be undone. The driver will be permanently removed from the system.
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'center'
                  }}>
                    <button type="button" onClick={closeModal} style={{
                      padding: '12px 25px',
                      background: '#f8f9fa',
                      color: '#666',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e9ecef';
                      e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#666';
                    }}>
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleSubmit(e)} 
                      style={{
                        padding: '12px 25px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#c0392b';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#e74c3c';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <i className="fas fa-trash"></i>
                      Delete Driver
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;
