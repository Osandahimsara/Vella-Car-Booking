import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../CSS/admin.css";
import totalVehiclesImg from "../images/admin/TotalVehicles.png";
import totalDriversImg from "../images/admin/TotalDrivers.png";
import pendingBookingsImg from "../images/admin/PendingBookings.webp";
import totalBookingsImg from "../images/admin/TotalBookings .webp";
import completedImg from "../images/admin/Completed.png";
import cancelledImg from "../images/admin/Cancelled.png";
import fleetActiveImg from "../images/admin/FleetActive.jpg";
import addDriverImg from "../images/admin/AddDriver.png";
import addVehicleImg from "../images/admin/AddVehicle.webp";
import newBookingImg from "../images/admin/NewBooking.png";
import viewReportsImg from "../images/admin/ViewReports.png";

const AdminPage = () => {
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeVehicles, setActiveVehicles] = useState(0);
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Add dashboard animations
  useEffect(() => {
    if (!document.getElementById('dashboard-animations')) {
      const style = document.createElement('style');
      style.id = 'dashboard-animations';
      style.textContent = `
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Fetch real data from your backend API
  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    setLoading(true);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch vehicles data
      let vehicles = [];
      try {
        const vehiclesRes = await axios.get('http://localhost:8000/api/vehicles');
        vehicles = vehiclesRes.data || [];
        console.log('✅ Vehicles fetched:', vehicles.length, 'total');
      } catch (vehicleError) {
        console.error('❌ Error fetching vehicles:', vehicleError.message);
      }
      
      // Fetch drivers data
      let drivers = [];
      try {
        const driversRes = await axios.get('http://localhost:8000/api/driver');
        drivers = driversRes.data || [];
        console.log('✅ Drivers fetched:', drivers.length, 'total');
      } catch (driverError) {
        console.error('❌ Error fetching drivers:', driverError.message);
      }
      
      // Fetch bookings data
      let bookings = [];
      try {
        const bookingsRes = await axios.get('http://localhost:8000/api/bookings');
        bookings = bookingsRes.data || [];
        console.log('✅ Bookings fetched:', bookings.length, 'total');
      } catch (bookingError) {
        console.error('❌ Error fetching bookings:', bookingError.message);
      }

      // Calculate real-time statistics
      const totalVehicleCount = vehicles.length;
      const totalDriverCount = drivers.length;
      const totalBookingCount = bookings.length;
      
      const activeVehicleCount = vehicles.filter(v => v.status === 'available' || v.status === 'active').length;
      const activeDriverCount = drivers.filter(d => d.status === 'active').length;
      const pendingBookingCount = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
      const completedBookingCount = bookings.filter(b => b.status === 'completed' || b.status === 'approved').length;
      
      // Update state with real data
      setTotalVehicles(totalVehicleCount);
      setTotalDrivers(totalDriverCount);
      setTotalBookings(totalBookingCount);
      setActiveVehicles(activeVehicleCount);
      setActiveDrivers(activeDriverCount);
      setPendingBookings(pendingBookingCount);
      setCompletedBookings(completedBookingCount);
      
      console.log(' Dashboard Statistics:');
      console.log(`  Vehicles: ${totalVehicleCount} total, ${activeVehicleCount} active`);
      console.log(`  Drivers: ${totalDriverCount} total, ${activeDriverCount} active`);
      console.log(`  Bookings: ${totalBookingCount} total, ${pendingBookingCount} pending, ${completedBookingCount} completed`);
      
      // Calculate revenue from completed bookings
      const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => {
          const amount = parseFloat(b.totalAmount || b.total || b.price || 0);
          return sum + amount;
        }, 0);
      setRevenue(totalRevenue);

      // Get recent bookings (last 5)
      const recent = bookings
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || a.pickTime || a.bookingDate);
          const dateB = new Date(b.createdAt || b.pickTime || b.bookingDate);
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentBookings(recent);
      
      // Update last updated timestamp
      setLastUpdated(new Date());

    } catch (error) {
      console.error('❌ Critical error fetching dashboard data:', error);
      // Fallback to demo values if API fails
      setTotalVehicles(0);
      setTotalDrivers(0);
      setPendingBookings(0);
      setTotalBookings(0);
      setActiveVehicles(0);
      setActiveDrivers(0);
      setCompletedBookings(18);
      setRevenue(15420);


    } finally {
      setLoading(false);
    }
  };


const cards = [
    {
      count: totalVehicles,
      label: "Total Vehicles",
      sublabel: `${activeVehicles} Active`,
      color: "#0078D4",
      icon: <i className="fas fa-car"></i>,
      image: totalVehiclesImg, 
      trend: "+2 this week",
      link: "/AdminVehicles"
    },
    {
      count: totalDrivers,
      label: "Total Drivers", 
      sublabel: `${activeDrivers} Active`,
      color: "#107C10",
      icon: <i className="fas fa-user-tie"></i>,
      image: totalDriversImg, 
      trend: "+1 this week",
      link: "/AdminDrivers"
    },
    {
      count: pendingBookings,
      label: "Pending Bookings",
      sublabel: "Need attention",
      color: "#FF8C00",
      icon: <i className="fas fa-clock"></i>,
      image: pendingBookingsImg, 
      trend: pendingBookings > 5 ? "High volume" : "Normal",
      link: "/BookingApproval"
    },
    {
      count: totalBookings,
      label: "Total Bookings",
      sublabel: `${completedBookings} Completed`,
      color: "#0078D4",
      icon: <i className="fas fa-calendar-check"></i>,
      image: totalBookingsImg, 
      trend: "+5 this week"
    }
  ];


  const secondaryCards = [
    {
      count: completedBookings,
      label: "Completed",
      color: "#107C10",
      icon: <i className="fas fa-check-circle"></i>,
      image: completedImg
    },
    
    {
      count: totalBookings - completedBookings - pendingBookings,
      label: "Cancelled",
      color: "#D13438",
      icon: <i className="fas fa-times-circle"></i>,
      image: cancelledImg
    },
    {
      count: `${Math.round((activeVehicles/totalVehicles)*100)}%`,
      label: "Fleet Active",
      color: "#0078D4",
      icon: <i className="fas fa-chart-line"></i>,
      image: fleetActiveImg
    }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Enhanced Sidebar */}
      <div id="nav-bar" className={sidebarOpen ? "nav-bar active" : "nav-bar"} 
           style={{ 
             backgroundColor: '#2c3e50',
             boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
             transition: 'all 0.3s ease'
           }}>
        
        <div id="nav-header" style={{ padding: '20px', borderBottom: '1px solid #34495e' }}>
          <div className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}
               style={{ 
                 background: '#0078D4',
                 padding: '12px 15px',
                 borderRadius: '8px',
                 cursor: 'pointer',
                 marginBottom: '15px',
                 transition: 'all 0.3s ease'
               }}>
            <i className="fas fa-bars" style={{ color: 'white' }}></i>
          </div>
          
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
              <i className="fas fa-user-shield" style={{ color: 'white', fontSize: '24px' }}></i>
            </div>
            <span style={{ color: "white", fontWeight: "bold", fontSize: "1.5rem", display: 'block' }}>
              Admin Panel
            </span>
            <small style={{ color: '#bdc3c7', fontSize: '12px' }}>Car Booking System</small>
          </div>
        </div>

        <div id="nav-content" style={{ padding: '20px 0' }}>
          {[
            { icon: "fas fa-tachometer-alt", label: "Dashboard", path: "/Adminpage", active: true },
            { icon: "fas fa-user-plus", label: "Add Drivers", path: "/DriverRegister" },
            { icon: "fas fa-car", label: "Add Vehicle", path: "/VehicleRegister" },
            { icon: "fas fa-car-side", label: "Manage Vehicles", path: "/vehicles" },
            { icon: "fas fa-id-badge", label: "Manage Drivers", path: "/Drivers" },
            { icon: "fas fa-list", label: "Bookings", path: "/BookingApproval" },
            { icon: "fas fa-chart-bar", label: "Reports", path: "/reports" }
          ].map((item, idx) => (
            <div key={idx} className="nav-button" style={{
              margin: '5px 15px',
              borderRadius: '8px',
              backgroundColor: item.active ? '#0078D4' : 'transparent',
              transition: 'all 0.3s ease'
            }}>
              <i className={item.icon} style={{ 
                marginRight: '12px', 
                width: '20px',
                color: '#ecf0f1'
              }}></i>
              <Link to={item.path} className="nav-link" style={{
                color: '#ecf0f1',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: item.active ? 'bold' : 'normal'
              }}>
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        <div id="nav-footer" style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          right: '20px',
          borderTop: '1px solid #34495e',
          paddingTop: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://gravatar.com/avatar/4474ca42d303761c2901fa819c4f2547"
              alt="Avatar"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '10px'
              }}
            />
            <div>
              <h5 style={{ fontSize: "14px", color: "white", margin: 0 }}>Administrator</h5>
              <small style={{ color: '#bdc3c7', fontSize: '12px' }}>Online</small>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Dashboard */}
      <div className="dashboard" style={{ 
        flex: 1, 
        padding: '30px',
        marginLeft: sidebarOpen ? '0' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        
        {/* Enhanced Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 100%)',
          borderRadius: '20px',
          padding: '40px 35px',
          marginBottom: '35px',
          boxShadow: '0 15px 35px rgba(0, 120, 212, 0.3)',
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
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
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
                  Driver
                </span>{' '}
                Dashboard
              </h1>
                

              {/* Subtitle */}
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '1.2rem', 
                margin: '0 0 15px 0',
                fontWeight: '400',
                lineHeight: '1.4'
              }}>
                Welcome back, Administrator! 👋<br/>
                <span style={{ fontSize: '1rem', opacity: 0.8 }}>
                  Here's your car booking business overview
                </span>
              </p>

             
              
            </div>

            {/* Right Side Actions - Perfectly Aligned */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '15px',
              alignItems: 'center',
              minWidth: '180px'
            }}>
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{
                  background: loading ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  padding: '15px 30px',
                  borderRadius: '30px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '15px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  justifyContent: 'center',
                  boxShadow: '0 8px 30px rgba(255, 255, 255, 0.15)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                    e.target.style.transform = 'translateY(-4px) scale(1.02)';
                    e.target.style.boxShadow = '0 12px 40px rgba(255, 255, 255, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 8px 30px rgba(255, 255, 255, 0.15)';
                  }
                }}
              >
                <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-sync-alt"} 
                   style={{ fontSize: '18px' }}></i>
                {loading ? 'Updating...' : 'Refresh Data'}
              </button>

              {/* Time Display - Perfectly Centered */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
                color: 'white',
                padding: '20px',
                borderRadius: '25px',
                textAlign: 'center',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                width: '100%',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle animated background */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  animation: 'rotate 20s linear infinite',
                  opacity: 0.3
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '2.2rem', 
                    fontWeight: '900', 
                    marginBottom: '8px',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    backgroundSize: '200% 200%',
                    animation: 'gradientShift 3s ease-in-out infinite',
                    lineHeight: '1',
                    textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)'
                  }}>
                    {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.95,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }}>
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'short'
                    })}
                  </div>
                </div>
              </div>

              {/* Last Updated - Clean & Aligned */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.95)',
                padding: '12px 20px',
                borderRadius: '20px',
                textAlign: 'center',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.75rem',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  opacity: 0.8,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '600'
                }}>
                  <i className="fas fa-clock" style={{ fontSize: '12px' }}></i>
                  <span>Last Updated</span>
                </div>
                <span style={{ 
                  fontWeight: '800', 
                  color: 'white',
                  fontSize: '0.85rem',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {lastUpdated.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
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

        {/* Enhanced Main Stats Cards with Images */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '25px',
          marginBottom: '30px'
        }}>
          {cards.map((card, idx) => (
            <Link 
              key={idx}
              to={card.link || '#'}
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '25px',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                border: `3px solid ${card.color}20`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                cursor: card.link ? 'pointer' : 'default',
                height: '200px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = `${card.color}20`;
              }}>
                
                {/* Top stripe */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: `linear-gradient(90deg, ${card.color}, ${card.color}aa)`
                }}></div>

                {/* Card Image */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 20px ${card.color}30`,
                  border: `3px solid ${card.color}20`,
                  overflow: 'hidden'
                }}>
                  <img 
                    src={card.image} 
                    alt={card.label}
                    style={{
                      width: '65px',
                      height: '65px',
                      objectFit: 'contain',
                      transition: 'all 0.3s ease',
                      filter: 'brightness(1.1) contrast(1.1)'
                    }}
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.15)';
                      e.target.style.filter = 'brightness(1.2) contrast(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.filter = 'brightness(1.1) contrast(1.1)';
                    }}
                  />
                  {/* Fallback icon (hidden by default) */}
                  <div style={{
                    display: 'none',
                    fontSize: '30px',
                    color: card.color,
                    position: 'absolute'
                  }}>
                    {card.icon}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  height: '100%',
                  justifyContent: 'space-between'
                }}>
                  {/* Main Content */}
                  <div>
                    <h2 style={{ 
                      fontSize: '2.8rem', 
                      fontWeight: '800', 
                      color: '#2c3e50',
                      margin: '0 0 8px 0',
                      lineHeight: 1,
                      background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      {loading ? '...' : card.count}
                    </h2>
                    
                    <p style={{ 
                      fontSize: '1.1rem', 
                      color: '#2c3e50', 
                      margin: '0 0 6px 0',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {card.label}
                    </p>
                    
                    <small style={{ 
                      color: '#7f8c8d', 
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '12px'
                    }}>
                      {card.sublabel}
                    </small>
                  </div>

                  {/* Bottom Section */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start', 
                    alignItems: 'center',
                    marginTop: 'auto'
                  }}>
                    <div style={{
                      padding: '6px 12px',
                      background: `linear-gradient(135deg, ${card.color}20, ${card.color}10)`,
                      borderRadius: '15px',
                      border: `1px solid ${card.color}30`
                    }}>
                      <small style={{ 
                        color: card.color,
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {card.trend}
                      </small>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(135deg, ${card.color}05, transparent)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }} className="card-hover-overlay"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {secondaryCards.map((card, idx) => (
            <div key={idx} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                fontSize: '18px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {card.image && (
                  <img 
                    src={card.image} 
                    alt={card.label}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      opacity: 0.8
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {card.icon}
                </div>
              </div>
              
              <div>
                <h4 style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 'bold', 
                  color: '#2c3e50',
                  margin: 0
                }}>
                  {loading ? '...' : card.count}
                </h4>
                <p style={{ 
                  color: '#7f8c8d', 
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '25px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f8f9fa'
          }}>
            <h3 style={{ color: '#2c3e50', margin: 0, fontSize: '1.3rem' }}>
              🕐 Recent Bookings
            </h3>
            <Link 
              to="/BookingApproval" 
              style={{ 
                color: '#0078D4', 
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', marginBottom: '10px' }}></i>
              <p>Loading recent bookings...</p>
            </div>
          ) : recentBookings.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              {recentBookings.map((booking, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  background: idx % 2 === 0 ? '#f8f9fa' : 'white',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ flex: '0 0 80px', fontWeight: 'bold', color: '#007bff' }}>
                    #{booking.bookingId || `BK${booking._id?.slice(-4)}`}
                  </div>
                  <div style={{ flex: '1', minWidth: '150px' }}>
                    {booking.name} {booking.lastName}
                  </div>
                  <div style={{ flex: '1', minWidth: '120px', color: '#6c757d' }}>
                    {booking.vehicleDetails?.brandName} {booking.vehicleDetails?.modelName}
                  </div>
                  <div style={{ flex: '0 0 100px', color: '#6c757d' }}>
                    {new Date(booking.pickTime).toLocaleDateString()}
                  </div>
                  <div style={{ flex: '0 0 80px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
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
                      {booking.status === 'confirmed' ? 'Pending' : 
                       booking.status === 'approved' ? 'Approved' :
                       booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
              <i className="fas fa-calendar-times" style={{ fontSize: '48px', marginBottom: '15px', color: '#dee2e6' }}></i>
              <h4>No Recent Bookings</h4>
              <p>No bookings found in the system yet.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#2c3e50', marginBottom: '20px', fontSize: '1.3rem' }}>
            ⚡ Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {[
              { icon: 'fas fa-car', title: 'Add Vehicle', desc: 'Register new vehicle', path: '/VehicleRegister', color: '#0078D4', image: addVehicleImg },
              { icon: 'fas fa-user-plus', title: 'Add Driver', desc: 'Register new driver', path: '/DriverRegister', color: '#107C10', image: addDriverImg },
              { icon: 'fas fa-calendar-plus', title: 'New Booking', desc: 'Create booking', path: '/bookcar', color: '#FF8C00', image: newBookingImg },
              { icon: 'fas fa-chart-line', title: 'View Reports', desc: 'Analytics & reports', path: '/reports', color: '#D13438', image: viewReportsImg }
            ].map((action, idx) => (
              <Link 
                key={idx}
                to={action.path}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 3px 15px rgba(0,0,0,0.08)',
                  border: `2px solid ${action.color}20`,
                  transition: 'all 0.3s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = action.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = `${action.color}20`;
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: `${action.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 15px',
                  fontSize: '20px',
                  color: action.color,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {action.image && (
                    <img 
                      src={action.image} 
                      alt={action.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        opacity: 0.9
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <i className={action.icon}></i>
                  </div>
                </div>
                <h4 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{action.title}</h4>
                <p style={{ margin: 0, color: '#7f8c8d', fontSize: '0.9rem' }}>{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;