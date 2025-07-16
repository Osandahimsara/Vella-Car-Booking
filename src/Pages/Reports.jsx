import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../CSS/admin.css';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    rejectedBookings: 0,
    topVehicles: [],
    topDrivers: [],
    monthlyStats: [],
    recentBookings: []
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all bookings
      const bookingsResponse = await axios.get('http://localhost:8000/api/bookings');
      const allBookings = bookingsResponse.data || [];
      
      // Fetch vehicles
      const vehiclesResponse = await axios.get('http://localhost:8000/api/vehicles');
      const allVehicles = vehiclesResponse.data || [];
      
      // Fetch drivers
      const driversResponse = await axios.get('http://localhost:8000/api/driver');
      const allDrivers = driversResponse.data || [];
      
      // Filter bookings based on date range
      const filteredBookings = filterBookingsByDateRange(allBookings);
      
      // Calculate statistics
      const stats = calculateStatistics(filteredBookings, allVehicles, allDrivers);
      
      setReportData(stats);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookingsByDateRange = (bookings) => {
    const now = new Date();
    let filterStartDate, filterEndDate;

    switch (dateRange) {
      case 'today':
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        filterStartDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        filterEndDate = new Date();
        break;
      case 'thisMonth':
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        filterStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        filterStartDate = new Date(now.getFullYear(), 0, 1);
        filterEndDate = new Date(now.getFullYear() + 1, 0, 0);
        break;
      case 'custom':
        if (startDate && endDate) {
          filterStartDate = new Date(startDate);
          filterEndDate = new Date(endDate);
        } else {
          return bookings; // Return all if no custom dates set
        }
        break;
      default:
        return bookings;
    }

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt || booking.pickTime);
      return bookingDate >= filterStartDate && bookingDate <= filterEndDate;
    });
  };

  const calculateStatistics = (bookings, vehicles, drivers) => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
    const rejectedBookings = bookings.filter(b => b.status === 'rejected').length;
    
    // Top vehicles by booking count
    const vehicleBookingCount = {};
    bookings.forEach(booking => {
      const vehicleKey = booking.carType || 'Unknown Vehicle';
      vehicleBookingCount[vehicleKey] = (vehicleBookingCount[vehicleKey] || 0) + 1;
    });
    
    const topVehicles = Object.entries(vehicleBookingCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([vehicle, count]) => ({ vehicle, count }));

    // Top drivers by booking count
    const driverBookingCount = {};
    bookings.forEach(booking => {
      if (booking.driver) {
        driverBookingCount[booking.driver] = (driverBookingCount[booking.driver] || 0) + 1;
      }
    });
    
    const topDrivers = Object.entries(driverBookingCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([driver, count]) => ({ driver, count }));

    // Monthly statistics for the last 6 months
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      const monthBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt || booking.pickTime);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      });
      
      monthlyStats.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        bookings: monthBookings.length,
        completed: monthBookings.filter(b => b.status === 'approved' || b.status === 'completed').length
      });
    }

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      rejectedBookings,
      topVehicles,
      topDrivers,
      monthlyStats,
      recentBookings: bookings.slice(0, 10)
    };
  };

  const exportToExcel = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Recent Bookings
    const bookingsData = [
      ['Booking ID', 'Customer Name', 'Vehicle', 'Driver', 'Pick-up Date', 'Status'],
      ...reportData.recentBookings.map(booking => [
        booking.bookingId || `BK${booking._id?.slice(-4)}`,
        `${booking.name} ${booking.lastName}`,
        booking.carType || 'N/A',
        booking.driver || 'N/A',
        new Date(booking.pickTime).toLocaleDateString(),
        booking.status === 'confirmed' ? 'Pending' : booking.status
      ])
    ];
    
    const bookingsWS = XLSX.utils.aoa_to_sheet(bookingsData);
    bookingsWS['!cols'] = [
      { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 }
    ];
    
    // Sheet 2: Summary Statistics
    const summaryData = [
      ['Metric', 'Value'],
      ['Report Period', getDateRangeText()],
      ['Total Bookings', reportData.totalBookings],
      ['Completed Bookings', reportData.completedBookings],
      ['Pending Bookings', reportData.pendingBookings],
      ['Rejected Bookings', reportData.rejectedBookings],
      [''],
      ['Top Vehicles', ''],
      ...reportData.topVehicles.map((vehicle, idx) => [
        `${idx + 1}. ${vehicle.vehicle}`,
        `${vehicle.count} bookings`
      ]),
      [''],
      ['Top Drivers', ''],
      ...reportData.topDrivers.map((driver, idx) => [
        `${idx + 1}. ${driver.driver}`,
        `${driver.count} trips`
      ])
    ];
    
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWS['!cols'] = [{ wch: 25 }, { wch: 20 }];
    
    // Sheet 3: Monthly Statistics
    const monthlyData = [
      ['Month', 'Total Bookings', 'Completed'],
      ...reportData.monthlyStats.map(stat => [
        stat.month,
        stat.bookings,
        stat.completed
      ])
    ];
    
    const monthlyWS = XLSX.utils.aoa_to_sheet(monthlyData);
    monthlyWS['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
    
    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, bookingsWS, 'Recent Bookings');
    XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
    XLSX.utils.book_append_sheet(wb, monthlyWS, 'Monthly Trends');
    
    // Generate filename with current date
    const filename = `booking_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
  };

  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'thisWeek': return 'This Week';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisYear': return 'This Year';
      case 'custom': return `${startDate} to ${endDate}`;
      default: return 'All Time';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#0078D4', marginBottom: '20px' }}></i>
          <p style={{ fontSize: '18px', color: '#6c757d' }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 100%)',
        borderRadius: '20px',
        padding: '30px',
        marginBottom: '30px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.4
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', fontWeight: '800' }}>
                 Reports & Analytics
              </h1>
              <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
                Business insights and performance metrics for {getDateRangeText()}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
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
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <i className="fas fa-arrow-left"></i>
                Back to Dashboard
              </Link>
              
              <button
                onClick={exportToExcel}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '12px 20px',
                  borderRadius: '25px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <i className="fas fa-file-excel"></i>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}> Date Range</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '14px',
              fontWeight: '500',
              outline: 'none',
              minWidth: '150px'
            }}
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
          
          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  padding: '10px 15px',
                  borderRadius: '8px',
                  border: '2px solid #e9ecef',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <span style={{ color: '#6c757d' }}>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  padding: '10px 15px',
                  borderRadius: '8px',
                  border: '2px solid #e9ecef',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          { label: 'Total Bookings', value: reportData.totalBookings, color: '#0078D4', icon: 'fas fa-calendar-alt' },
          { label: 'Completed', value: reportData.completedBookings, color: '#28a745', icon: 'fas fa-check-circle' },
          { label: 'Pending', value: reportData.pendingBookings, color: '#ffc107', icon: 'fas fa-clock' },
          { label: 'Rejected', value: reportData.rejectedBookings, color: '#dc3545', icon: 'fas fa-times-circle' }
        ].map((metric, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
            border: `3px solid ${metric.color}20`,
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '800', 
                  margin: '0 0 8px 0',
                  color: metric.color
                }}>
                  {metric.value}
                </h3>
                <p style={{ 
                  color: '#6c757d', 
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {metric.label}
                </p>
              </div>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `${metric.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                color: metric.color
              }}>
                <i className={metric.icon}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Top Vehicles */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>🚗 Top Vehicles</h3>
          {reportData.topVehicles.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reportData.topVehicles.map((vehicle, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#0078D4',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {vehicle.vehicle}
                    </span>
                  </div>
                  <div style={{
                    background: '#0078D4',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {vehicle.count} bookings
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px 0' }}>
              No vehicle data available
            </p>
          )}
        </div>

        {/* Top Drivers */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>👨‍✈️ Top Drivers</h3>
          {reportData.topDrivers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {reportData.topDrivers.map((driver, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#28a745',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {driver.driver}
                    </span>
                  </div>
                  <div style={{
                    background: '#28a745',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {driver.count} trips
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px 0' }}>
              No driver data available
            </p>
          )}
        </div>
      </div>

      {/* Monthly Statistics */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>📈 Monthly Trends</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Month</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Total Bookings</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Completed</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthlyStats.map((stat, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{stat.month}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{stat.bookings}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{stat.completed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '25px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50' }}>📋 Recent Bookings</h3>
          <Link
            to="/BookingApproval"
            style={{
              color: '#0078D4',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            View All <i className="fas fa-external-link-alt"></i>
          </Link>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Booking ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Vehicle</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentBookings.slice(0, 10).map((booking, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px', fontWeight: '600', color: '#0078D4' }}>
                    #{booking.bookingId || `BK${booking._id?.slice(-4)}`}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {booking.name} {booking.lastName}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {booking.carType || 'N/A'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(booking.pickTime).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: booking.status === 'approved' ? '#d4edda' :
                                booking.status === 'completed' ? '#d4edda' :
                                booking.status === 'confirmed' ? '#fff3cd' :
                                booking.status === 'pending' ? '#fff3cd' :
                                booking.status === 'rejected' ? '#f8d7da' : '#f8f9fa',
                      color: booking.status === 'approved' ? '#155724' :
                             booking.status === 'completed' ? '#155724' :
                             booking.status === 'confirmed' ? '#856404' :
                             booking.status === 'pending' ? '#856404' :
                             booking.status === 'rejected' ? '#721c24' : '#6c757d'
                    }}>
                      {booking.status === 'confirmed' ? 'Pending' : booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
