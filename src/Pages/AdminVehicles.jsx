import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../CSS/adminvehicles.css';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://13.229.216.243:8000/api/vehicles');
      setVehicles(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to fetch vehicles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter vehicles based on search and status
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.modelName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle delete vehicle with custom modal
  const handleDeleteVehicle = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setLoading(true);
      const response = await axios.delete(`http://13.229.216.243:8000/api/vehicles/${vehicleToDelete._id}`);
      console.log('Delete response:', response.data);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      
      // Show success message
      setShowDeleteSuccessModal(true);
      
      // Refresh the vehicles list
      await fetchVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      
      if (err.response?.status === 404) {
        setErrorMessage('Vehicle not found. It may have already been deleted.');
      } else {
        setErrorMessage(`Error deleting vehicle: ${err.response?.data?.message || err.message}`);
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setVehicleToDelete(null);
  };

  // Handle status change
  const handleStatusChange = async (vehicleId, newStatus) => {
    try {
      await axios.put(`http://13.229.216.243:8000/api/vehicles/${vehicleId}`, { 
        status: newStatus 
      });
      
      // Update the local state immediately
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle._id === vehicleId 
            ? { ...vehicle, status: newStatus }
            : vehicle
        )
      );
      
      setStatusMessage(`Vehicle status updated to ${newStatus}!`);
      setShowStatusModal(true);
    } catch (err) {
      console.error('Error updating vehicle status:', err);
      setErrorMessage('Error updating vehicle status. Please try again.');
      setShowErrorModal(true);
      
      // Refresh the list to restore the original state
      fetchVehicles();
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(-5deg); }
            50% { transform: translateY(-10px) rotate(-3deg); }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .feature-tag {
            animation: pulse 2s ease-in-out infinite;
          }
          
          .feature-tag:nth-child(1) { animation-delay: 0s; }
          .feature-tag:nth-child(2) { animation-delay: 0.3s; }
          .feature-tag:nth-child(3) { animation-delay: 0.6s; }
        `}
      </style>
      {/* Top Navigation */}
      <div style={{
        background: 'white',
        padding: '15px 30px',
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/Adminpage" style={{
              textDecoration: 'none',
              color: 'rgba(0, 120, 212, 1)',
              fontWeight: '600',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </Link>
            <span style={{ color: '#6c757d', fontSize: '1.2rem' }}>|</span>
            <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem' }}>
              <i className="fas fa-car-side" style={{ marginRight: '10px', color: 'rgba(0, 120, 212, 1)' }}></i>
              Vehicle Management
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link to="/VehicleRegister" style={{
              padding: '8px 16px',
              background: 'rgba(0, 120, 212, 1)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
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
              <i className="fas fa-plus"></i>
              Add Vehicle
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        padding: '0 30px 30px 30px',
        width: '100%'
      }}>
        
        {/* Enhanced Header */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 120, 212, 1) 0%, rgba(0, 120, 212, 0.8) 100%)',
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
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
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
            <div style={{ flex: 1, minWidth: '300px' }}>
              {/* Welcome Section */}
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
                  Vehicle Management
                </span>
              </div>

              {/* Main Title */}
              <h1 style={{ 
                fontSize: '3rem', 
                color: 'white', 
                margin: '0 0 10px 0',
                fontWeight: '800',
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                lineHeight: '1.1'
              }}>
                <span style={{ 
                  fontSize: '3.5rem',
                  marginRight: '15px',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  display: 'inline-block',
                  transform: 'rotate(-5deg)',
                  animation: 'float 3s ease-in-out infinite'
                }}>
                  
                </span>
                <span style={{ 
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: '900'
                }}>
                  Vehicle
                </span>{' '}
                Management
              </h1>

              {/* Subtitle */}
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1.2rem', 
                margin: '0 0 15px 0',
                fontWeight: '400',
                lineHeight: '1.4'
              }}>
                Manage all registered vehicles in the system 
                <br/>
                <span style={{ 
                  fontSize: '1rem', 
                  opacity: 8,
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
                  }}
                  className="feature-tag">
                    ⚡ View
                  </span>
                  <span style={{ 
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  className="feature-tag">
                    ✏️ Update
                  </span>
                  <span style={{ 
                    fontSize: '0.9rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  className="feature-tag">
                    🎯 Delete
                  </span>
                </span>
              </p>
            </div>

            {/* Right Side Actions */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              alignItems: 'flex-end'
            }}>
              {/* Time Display */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '15px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '150px'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2px' }}>
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {new Date().toLocaleDateString('en-US', { timeZoneName: 'short' }).split(', ')[1]}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            borderRadius: '50%',
            opacity: 0.3
          }}></div>
          
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))',
            borderRadius: '50%',
            opacity: 0.4
          }}></div>
        </div>

        {/* Enhanced Controls */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '25px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0, 120, 212, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.05), rgba(0, 90, 158, 0.03))',
            borderRadius: '50%',
            opacity: 0.6
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-20px',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.5), rgba(0, 120, 212, 0.3))',
            borderRadius: '50%',
            opacity: 0.5
          }}></div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '25px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '20px',
              alignItems: 'center',
              minWidth: '300px'
            }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}>
                  <i className="fas fa-search" style={{
                    color: 'rgba(0, 120, 212, 1)',
                    fontSize: '16px'
                  }}></i>
                </div>
                <input
                  type="text"
                  placeholder="Search vehicles by brand, model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '15px 20px 15px 45px',
                    border: '2px solid rgba(0, 120, 212, 0.5)',
                    borderRadius: '15px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 4px 15px rgba(0, 120, 212, 0.5)',
                    outline: 'none',
                    color: '#2c3e50'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0078D4';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 120, 212, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e3f2fd';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 120, 212, 0.08)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                />
              </div>
              
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}>
                  <i className="fas fa-filter" style={{
                    color: 'rgba(0, 120, 212, 1)',
                    fontSize: '14px'
                  }}></i>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{
                    padding: '15px 20px 15px 40px',
                    border: '2px solid rgba(0, 120, 212, 0.5)',
                    borderRadius: '15px',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    minWidth: '140px',
                    maxWidth: '140px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 15px rgba(0, 120, 212, 0.5)',
                    outline: 'none',
                    color: '#2c3e50',
                    appearance: 'none',
                    backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%), url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'%230078D4\' viewBox=\'0 0 16 16\'%3e%3cpath d=\'M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z\'/%3e%3c/svg%3e")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'calc(100% - 15px) center',
                    backgroundSize: '16px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0078D4';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 120, 212, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e3f2fd';
                    e.target.style.boxShadow = '0 4px 15px rgba(0, 120, 212, 0.08)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '20px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 120, 212, 1) 0%, rgba(0, 120, 212, 0.8) 100%)',
                padding: '20px 25px',
                borderRadius: '18px',
                textAlign: 'center',
                color: 'white',
                minWidth: '120px',
                boxShadow: '0 8px 25px rgba(0, 120, 212, 0.5)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 120, 212, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 120, 212, 0.25)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  opacity: 0.6
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  <i className="fas fa-car-side"></i>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px', position: 'relative', zIndex: 1 }}>
                  {vehicles.length}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.95, fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  Total Vehicles
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #107C10 0%, #0F6B0F 100%)',
                padding: '20px 25px',
                borderRadius: '18px',
                textAlign: 'center',
                color: 'white',
                minWidth: '120px',
                boxShadow: '0 8px 25px rgba(16, 124, 16, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(16, 124, 16, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 124, 16, 0.25)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  opacity: 0.6
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px', position: 'relative', zIndex: 1 }}>
                  {vehicles.filter(v => v.status === 'active').length}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.95, fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  Active
                </div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #D13438 0%, #B22A2F 100%)',
                padding: '20px 25px',
                borderRadius: '18px',
                textAlign: 'center',
                color: 'white',
                minWidth: '120px',
                boxShadow: '0 8px 25px rgba(209, 52, 56, 0.25)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(209, 52, 56, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(209, 52, 56, 0.25)';
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-10px',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  opacity: 0.6
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '5px',
                  left: '5px',
                  fontSize: '12px',
                  opacity: 0.7
                }}>
                  <i className="fas fa-pause-circle"></i>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '5px', position: 'relative', zIndex: 1 }}>
                  {vehicles.filter(v => v.status === 'inactive').length}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.95, fontWeight: '600', position: 'relative', zIndex: 1 }}>
                  Inactive
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ 
              fontSize: '48px', 
              color: 'rgba(0, 120, 212, 1)',
              marginBottom: '20px'
            }}></i>
            <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>Loading vehicles...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '2px solid #dc3545'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ 
              fontSize: '48px', 
              color: '#dc3545',
              marginBottom: '20px'
            }}></i>
            <p style={{ fontSize: '1.2rem', color: '#dc3545' }}>{error}</p>
          </div>
        )}

        {/* Vehicles Grid */}
        {!loading && !error && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '25px',
            marginBottom: '30px'
          }}>
            {filteredVehicles.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '80px 20px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}>
                <i className="fas fa-car-side" style={{ 
                  fontSize: '64px', 
                  color: '#dee2e6',
                  marginBottom: '20px'
                }}></i>
                <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>No vehicles found</h3>
                <p style={{ color: '#8e8e93' }}>No vehicles match your search criteria.</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => (
                <div key={vehicle._id} style={{
                  background: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                  border: '2px solid transparent',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#0078D4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}>
                  
                  {/* Top stripe */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, rgba(0, 120, 212, 1), rgba(0, 120, 212, 0.8))'
                  }}></div>

                  <div style={{
                    position: 'relative',
                    height: '220px',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                  }}>
                    {vehicle.vehicleImageUrl ? (
                      <img
                        src={`http://13.229.216.243:8000${vehicle.vehicleImageUrl}`}
                        alt={`${vehicle.brandName} ${vehicle.modelName}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#6c757d'
                      }}>
                        <i className="fas fa-car" style={{ fontSize: '48px', marginBottom: '10px' }}></i>
                        <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>No Image</span>
                      </div>
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px'
                    }}>
                      <span style={{
                        padding: '8px 16px',
                        borderRadius: '25px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        background: vehicle.status === 'active' 
                          ? 'linear-gradient(135deg, #107C10 0%, #0F6B0F 100%)'
                          : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        {vehicle.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '25px' }}>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#2c3e50',
                      margin: '0 0 15px 0',
                      textAlign: 'center'
                    }}>
                      {vehicle.brandName} {vehicle.modelName}
                    </h3>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <i className="fas fa-hashtag" style={{ color: 'rgba(0, 120, 212, 1)', width: '16px' }}></i>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{vehicle.vehicleNumber}</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                      }}>
                        <i className="fas fa-calendar-alt" style={{ color: 'rgba(0, 120, 212, 1)', width: '16px' }}></i>
                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{vehicle.year}</span>
                      </div>
                      {vehicle.fuelType && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <i className="fas fa-gas-pump" style={{ color: 'rgba(0, 120, 212, 1)', width: '16px' }}></i>
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{vehicle.fuelType}</span>
                        </div>
                      )}
                      {vehicle.transmission && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <i className="fas fa-cogs" style={{ color: 'rgba(0, 120, 212, 1)', width: '16px' }}></i>
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{vehicle.transmission}</span>
                        </div>
                      )}
                      {vehicle.seatingCapacity && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          background: '#f8f9fa',
                          borderRadius: '8px',
                          gridColumn: vehicle.fuelType && vehicle.transmission ? 'span 2' : 'span 1'
                        }}>
                          <i className="fas fa-users" style={{ color: 'rgba(0, 120, 212, 1)', width: '16px' }}></i>
                          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{vehicle.seatingCapacity} place</span>
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <select
                          value={vehicle.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(vehicle._id, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            padding: '10px 15px',
                            border: '2px solid #e9ecef',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '500',
                            background: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteVehicle(vehicle);
                        }}
                        style={{
                          padding: '10px 16px',
                          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && vehicleToDelete && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <div className="delete-warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Delete Vehicle</h3>
            </div>
            
            <div className="delete-modal-body">
              <p>Are you sure you want to delete this vehicle?</p>
              <div className="vehicle-info-preview">
                <div className="vehicle-preview-image">
                  {vehicleToDelete.vehicleImageUrl ? (
                    <img
                      src={`http://13.229.216.243:8000${vehicleToDelete.vehicleImageUrl}`}
                      alt={`${vehicleToDelete.brandName} ${vehicleToDelete.modelName}`}
                    />
                  ) : (
                    <div className="no-image-preview">
                      <i className="fas fa-car"></i>
                    </div>
                  )}
                </div>
                <div className="vehicle-preview-details">
                  <h4>{vehicleToDelete.brandName} {vehicleToDelete.modelName}</h4>
                  <p>Year: {vehicleToDelete.year}</p>
                  <p>Fuel: {vehicleToDelete.fuelType}</p>
                </div>
              </div>
              <div className="delete-warning-text">
                <i className="fas fa-info-circle"></i>
                <span>This action cannot be undone. The vehicle will be permanently removed from the system.</span>
              </div>
            </div>
            
            <div className="delete-modal-actions">
              <button
                type="button"
                onClick={cancelDelete}
                className="cancel-delete-btn"
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="confirm-delete-btn"
                disabled={loading}
              >
                <i className="fas fa-trash"></i>
                {loading ? 'Deleting...' : 'Delete Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Success Modal */}
      {showStatusModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              color: 'white'
            }}>
              ✓
            </div>
            <h2 style={{
              color: '#28a745',
              marginBottom: '15px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Success!
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '30px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              {statusMessage}
            </p>
            <button
              onClick={() => {
                setShowStatusModal(false);
                setStatusMessage('');
              }}
              style={{
                backgroundColor: 'rgba(0, 120, 212, 1)',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 120, 212, 0.8)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 120, 212, 1)'}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              color: 'white'
            }}>
              ✓
            </div>
            <h2 style={{
              color: '#28a745',
              marginBottom: '15px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Deleted!
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '30px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              Vehicle has been deleted successfully!
            </p>
            <button
              onClick={() => {
                setShowDeleteSuccessModal(false);
              }}
              style={{
                backgroundColor: 'rgba(0, 120, 212, 1)',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 120, 212, 0.8)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 120, 212, 1)'}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '90%',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '40px',
              color: 'white'
            }}>
              ✕
            </div>
            <h2 style={{
              color: '#dc3545',
              marginBottom: '15px',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              Error!
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '30px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              {errorMessage}
            </p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicles;
