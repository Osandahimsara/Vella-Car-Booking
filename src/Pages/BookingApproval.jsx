import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../CSS/admin.css';
import '../CSS/bookingApproval.css';

const BookingApproval = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/api/bookings');
      setBookings(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle approve booking
  const handleApproveBooking = (booking) => {
    setSelectedBooking(booking);
    setShowApprovalModal(true);
  };

  // Handle reject booking
  const handleRejectBooking = (booking) => {
    setSelectedBooking(booking);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  // Confirm approval
  const confirmApproval = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      const response = await axios.put(`http://localhost:8000/api/bookings/${selectedBooking._id}/approve`);
      
      // Update the booking in the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, status: 'approved', approvedAt: new Date() }
            : booking
        )
      );
      
      setSuccessMessage('Booking approved successfully! Confirmation email sent to customer.');
      setShowSuccessModal(true);
      setShowApprovalModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error('Error approving booking:', err);
      setError('Error approving booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm rejection
  const confirmRejection = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      const response = await axios.put(`http://localhost:8000/api/bookings/${selectedBooking._id}/reject`, {
        reason: rejectionReason || 'Vehicle/driver unavailable for selected dates'
      });
      
      // Update the booking in the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBooking._id 
            ? { 
                ...booking, 
                status: 'rejected', 
                rejectedAt: new Date(),
                rejectionReason: rejectionReason || 'Vehicle/driver unavailable for selected dates'
              }
            : booking
        )
      );
      
      setSuccessMessage('Booking rejected. Notification email sent to customer.');
      setShowSuccessModal(true);
      setShowRejectionModal(false);
      setSelectedBooking(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting booking:', err);
      setError('Error rejecting booking. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: '#007bff', bg: '#e7f3ff', text: 'Confirmed' },
      approved: { color: '#28a745', bg: '#e8f5e9', text: 'Approved' },
      rejected: { color: '#dc3545', bg: '#ffebee', text: 'Rejected' },
      pending: { color: '#ffc107', bg: '#fff8e1', text: 'Pending' },
      completed: { color: '#17a2b8', bg: '#e0f7fa', text: 'Completed' },
      cancelled: { color: '#6c757d', bg: '#f8f9fa', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: '#6c757d', bg: '#f8f9fa', text: status };
    
    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        textTransform: 'capitalize'
      }}>
        {config.text}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="booking-approval-page" style={{ minHeight: "100vh", background: "#f8f9fa" }}>
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
            {/* Left Side - Badge and Title */}
            <div style={{ flex: 1 }}>
              {/* Status Badge */}
              <div style={{ marginBottom: '20px' }}>
                <span style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '25px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'inline-block',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  BOOKING MANAGEMENT
                </span>
              </div>

              {/* Main Title */}
              <h1 style={{ 
                color: 'white', 
                margin: '0 0 15px 0', 
                fontSize: '3rem',
                fontWeight: '700',
                lineHeight: '1.1',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}>
                <span style={{
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Booking
                </span>{' '}
                Management
              </h1>

              {/* Subtitle */}
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1rem',
                marginBottom: '20px'
              }}>
                Manage all registered bookings in the system
              </div>
            </div>

            {/* Right Side - Clock */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: 'white',
              padding: '15px 20px',
              borderRadius: '15px',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '5px',
              minWidth: '120px'
            }}>
              <span style={{ 
                fontWeight: '800', 
                fontSize: '1.5rem',
                lineHeight: '1'
              }}>
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </span>
              <span style={{ 
                fontSize: '0.7rem', 
                opacity: 0.8,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '600'
              }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short'
                }).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Stats Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            {[
              { label: 'Total Bookings', value: bookings.length, icon: 'fas fa-calendar-alt', color: '#FFD700' },
              { label: 'Pending Review', value: bookings.filter(b => b.status === 'confirmed').length, icon: 'fas fa-clock', color: '#FFA500' },
              { label: 'Approved', value: bookings.filter(b => b.status === 'approved').length, icon: 'fas fa-check-circle', color: '#90EE90' },
              { label: 'Rejected', value: bookings.filter(b => b.status === 'rejected').length, icon: 'fas fa-times-circle', color: '#FFB6C1' }
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '20px',
                borderRadius: '15px',
                textAlign: 'center',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <i className={stat.icon} style={{ 
                  fontSize: '24px', 
                  color: stat.color,
                  marginBottom: '10px',
                  display: 'block'
                }}></i>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginBottom: '5px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
        {/* Controls */}
        <div style={{
          background: 'white',
          padding: '15px 30px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: '1', maxWidth: '350px' }}>
            <input
              type="text"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '200%',
                padding: '10px 15px',
                border: '1px solid #dee2e6',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: '#f8f9fa'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0078D4';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dee2e6';
                e.target.style.background = '#f8f9fa';
              }}
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '20%',
              padding: '8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              minWidth: '130px',
              background: '#f8f9fa',
              cursor: 'pointer',
              marginLeft: '360px',
              marginBottom: '1px'
            }}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>

          <button
            onClick={fetchBookings}
            disabled={loading}
            style={{
              width: '13%',
              padding: '9px 50px',
              background: '#0078D4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#106ebe')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#0078D4')}
          >
            <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-sync-alt"} style={{ fontSize: '12px' }}></i>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '15px 20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }}></i>
            {error}
          </div>
        )}

        {/* Bookings Table */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '25px',
            borderBottom: '2px solid #f8f9fa',
            background: 'linear-gradient(90deg, #f8f9fa, #fff)'
          }}>
            <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.4rem', fontWeight: '700' }}>
               Booking Requests ({filteredBookings.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6c757d' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '36px', marginBottom: '20px' }}></i>
              <p style={{ fontSize: '1.1rem', margin: 0 }}>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#6c757d' }}>
              <i className="fas fa-inbox" style={{ fontSize: '48px', marginBottom: '20px', color: '#dee2e6' }}></i>
              <h4 style={{ margin: '0 0 10px 0' }}>No Bookings Found</h4>
              <p style={{ margin: 0 }}>
                {searchTerm || filterStatus !== 'all' 
                  ? 'No bookings match your current filters.' 
                  : 'No booking requests available at this time.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Booking ID</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Customer</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Contact</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Trip Details</th>
                    <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Dates</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, idx) => (
                    <tr key={booking._id} style={{
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontWeight: '700', color: '#0078D4', fontSize: '0.9rem' }}>
                          #{booking.bookingId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '2px' }}>
                          {formatDate(booking.createdAt)}
                        </div>
                      </td>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                          {booking.name} {booking.lastName}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '2px' }}>
                          {booking.designation}
                        </div>
                      </td>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                          <i className="fas fa-envelope" style={{ marginRight: '6px', color: '#6c757d' }}></i>
                          <a href={`mailto:${booking.email}`} style={{ color: '#0078D4', textDecoration: 'none' }}>
                            {booking.email}
                          </a>
                        </div>
                        <div style={{ fontSize: '0.85rem' }}>
                          <i className="fas fa-phone" style={{ marginRight: '6px', color: '#6c757d' }}></i>
                          <a href={`tel:${booking.phone}`} style={{ color: '#0078D4', textDecoration: 'none' }}>
                            {booking.phone}
                          </a>
                        </div>
                      </td>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span style={{ 
                            background: '#e3f2fd', 
                            color: '#1976d2', 
                            padding: '2px 8px', 
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {booking.carType}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                          📍 {booking.pickUp} → {booking.dropOff}
                        </div>
                        {booking.driver && (
                          <div style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '2px' }}>
                            👨‍✈️ {booking.driver}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '20px 15px' }}>
                        <div style={{ fontSize: '0.8rem', marginBottom: '2px' }}>
                          <strong>Pick-up:</strong> {booking.pickTime}
                          {booking.pickUpTime && <span style={{ color: '#6c757d' }}> {booking.pickUpTime}</span>}
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong>Drop-off:</strong> {booking.dropTime}
                          {booking.dropOffTime && <span style={{ color: '#6c757d' }}> {booking.dropOffTime}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '20px 15px', textAlign: 'center' }}>
                        {getStatusBadge(booking.status)}
                      </td>
                      <td style={{ padding: '20px 15px', textAlign: 'center' }}>
                        {booking.status === 'confirmed' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleApproveBooking(booking)}
                              style={{
                                padding: '8px 16px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#218838'}
                              onMouseLeave={(e) => e.target.style.background = '#28a745'}
                            >
                              <i className="fas fa-check"></i>
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectBooking(booking)}
                              style={{
                                padding: '8px 16px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={(e) => e.target.style.background = '#c82333'}
                              onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                            >
                              <i className="fas fa-times"></i>
                              Reject
                            </button>
                          </div>
                        )}
                        {booking.status !== 'confirmed' && (
                          <span style={{ fontSize: '0.8rem', color: '#6c757d', fontStyle: 'italic' }}>
                            {booking.status === 'approved' && '✅ Approved'}
                            {booking.status === 'rejected' && '❌ Rejected'}
                            {booking.status === 'completed' && '🏁 Completed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Dashboard */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link
            to="/Adminpage"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '15px 30px',
              background: 'white',
              color: '#0078D4',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '2px solid #0078D4',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#0078D4';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#0078D4';
            }}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedBooking && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'modalSlideIn 0.3s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <i className="fas fa-check" style={{ fontSize: '36px', color: 'white' }}></i>
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.5rem' }}>
                Approve Booking Request
              </h3>
              <p style={{ margin: 0, color: '#6c757d' }}>
                Confirm approval for booking #{selectedBooking.bookingId}
              </p>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '25px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Customer:</strong> {selectedBooking.name} {selectedBooking.lastName}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Email:</strong> {selectedBooking.email}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Trip:</strong> {selectedBooking.pickUp} → {selectedBooking.dropOff}
              </div>
              <div>
                <strong>Dates:</strong> {selectedBooking.pickTime} to {selectedBooking.dropTime}
              </div>
            </div>

            <div style={{
              background: '#d4edda',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '25px',
              border: '1px solid #c3e6cb'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#155724' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                An approval confirmation email will be automatically sent to the customer.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={actionLoading}
                style={{
                  padding: '12px 25px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmApproval}
                disabled={actionLoading}
                style={{
                  padding: '12px 25px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                {actionLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Approving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i>
                    Approve & Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedBooking && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'modalSlideIn 0.3s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #dc3545, #c82333)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <i className="fas fa-times" style={{ fontSize: '36px', color: 'white' }}></i>
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50', fontSize: '1.5rem' }}>
                Reject Booking Request
              </h3>
              <p style={{ margin: 0, color: '#6c757d' }}>
                Provide a reason for rejecting booking #{selectedBooking.bookingId}
              </p>
            </div>

            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Customer:</strong> {selectedBooking.name} {selectedBooking.lastName}
              </div>
              <div>
                <strong>Email:</strong> {selectedBooking.email}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#495057' 
              }}>
                Rejection Reason:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection (optional)"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '12px',
                  border: '2px solid #e9ecef',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#dc3545'}
                onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
              />
              <small style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                If no reason is provided, a default message will be sent.
              </small>
            </div>

            <div style={{
              background: '#f8d7da',
              padding: '15px',
              borderRadius: '10px',
              marginBottom: '25px',
              border: '1px solid #f5c6cb'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#721c24' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                A rejection notification email will be sent to the customer.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowRejectionModal(false)}
                disabled={actionLoading}
                style={{
                  padding: '12px 25px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={actionLoading}
                style={{
                  padding: '12px 25px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: actionLoading ? 0.7 : 1
                }}
              >
                {actionLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-times"></i>
                    Reject & Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'modalSlideIn 0.3s ease'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 25px'
            }}>
              <i className="fas fa-check" style={{ fontSize: '36px', color: 'white' }}></i>
            </div>
            
            <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '1.5rem' }}>
              Success! 🎉
            </h3>
            
            <p style={{ margin: '0 0 30px 0', color: '#6c757d', lineHeight: '1.5' }}>
              {successMessage}
            </p>
            
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                padding: '12px 30px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Great!
            </button>
          </div>
        </div>
      )}

      {/* Enhanced CSS Animations */}
      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
            }
            50% { 
              transform: translateY(-20px) rotate(5deg); 
            }
          }

          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2), inset 0 2px 10px rgba(255, 255, 255, 0.1);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 20px 50px rgba(255, 255, 255, 0.3), inset 0 2px 15px rgba(255, 255, 255, 0.15);
            }
          }

          @keyframes iconBounce {
            0%, 100% { 
              transform: translateY(0px) scale(1); 
            }
            25% { 
              transform: translateY(-3px) scale(1.1); 
            }
            50% { 
              transform: translateY(0px) scale(1); 
            }
            75% { 
              transform: translateY(-1px) scale(1.05); 
            }
          }

          @keyframes gradientShift {
            0%, 100% { 
              background-position: 0% 50%; 
            }
            50% { 
              background-position: 100% 50%; 
            }
          }

          /* Enhanced button hover effects */
          .booking-approval-page button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }

          /* Smooth transitions for all interactive elements */
          .booking-approval-page * {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Custom scrollbar */
          .booking-approval-page::-webkit-scrollbar {
            width: 8px;
          }

          .booking-approval-page::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .booking-approval-page::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #0078D4, #005A9E);
            border-radius: 4px;
          }

          .booking-approval-page::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #106ebe, #004578);
          }
        `}
      </style>
    </div>
  );
};

export default BookingApproval;
