import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../CSS/admin.css"
import "../CSS/navbar.css"

const AdminPage = () => {
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Example: Fetch data from your backend API
  useEffect(() => {
    // Replace with your actual API endpoints
    // Example:
    // axios.get("/api/vehicles").then(res => setTotalVehicles(res.data.length));
    // axios.get("/api/drivers").then(res => setTotalDrivers(res.data.length));
    // axios.get("/api/bookings?status=pending").then(res => setPendingBookings(res.data.length));

    // Demo values:
    setTotalVehicles(12);
    setTotalDrivers(8);
    setPendingBookings(3);
  }, []);

  const cards = [
    {
      count: totalVehicles,
      label: "Total Vehicles",
      color: "blue",
      icon: <i className="fas fa-car si"></i>,
    },
    {
      count: totalDrivers,
      label: "Total Drivers",
      color: "green",
      icon: <i className="fas fa-user-tie si"></i>,
    },
    {
      count: pendingBookings,
      label: "Pending Bookings",
      color: "red",
      icon: <i className="fas fa-clock si"></i>,
    },
  ];

  


  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar Navbar */}
     <div id="nav-bar" className={sidebarOpen ? "nav-bar active" : "nav-bar"} style={{ backgroundColor: '#ff4c30e8' }}>

        <div id="nav-header" >

<div
  className="hamburger"
  onClick={() => setSidebarOpen(!sidebarOpen)}
>
  <i className="fas fa-bars"></i>
</div>



          <span id="nav-title" style={{ color: "white", fontWeight: "bold", fontSize: "2.5rem" }}>
            Admin
          </span>
        </div>
        <div id="nav-content" >
          <div className="nav-button">
            <i className="fas fa-user-plus"></i>
            <Link to="/DriverRegister" className="nav-link">Add Drivers</Link>
          </div>
           <div className="nav-button">
            <i className="fas fa-car"></i>
            <Link to="/VehicleRegister" className="nav-link">Add Vehicle</Link> {/* UPDATED */}
          </div>
          <div className="nav-button">
            <i className="fas fa-car-side"></i>
            <Link to="/vehicles" className="nav-link">Registered Vehicles</Link> {/* UPDATED */}
          </div>
          <div className="nav-button">
            <i className="fas fa-id-badge"></i>
            <Link to="/Drivers" className="nav-link">Registered Drivers</Link>
          </div>
          <div className="nav-button">
            <i className="fas fa-list"></i>
            <Link to="/pending-bookings" className="nav-link">Pending Booking List</Link>
          </div>
          <div className="nav-button">
            <i className="fas fa-file-alt"></i>
            <Link to="/reports" className="nav-link">Reports</Link>
          </div>
        </div>
        <div id="nav-footer">
          <div id="nav-footer-heading">
            <div id="nav-footer-avatar">
              <img
                src="https://gravatar.com/avatar/4474ca42d303761c2901fa819c4f2547"
                alt="Avatar"
              />
            </div>
            <div id="nav-footer-titlebox">
              <h5 style={{ fontSize: "16px", color: "white" }}>admin</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="dashboard" style={{ flex: 1 }}>
        <div className="dashboard-header">
          <h1 className="title">Dashboard</h1>
          {/*<p className="sublink">
            <Link to="/">Home</Link> / <span>Dashboard</span>
          </p>*/}
        </div>
        <div className="dashboard-cards">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="dashboard-card1"
              style={{ backgroundColor: card.color }}
            >
              <div className="card-content1">
                <h2>{card.count}</h2>
                <p className="clabel">{card.label}</p>
              </div>
              <div className="card-icon">{card.icon}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;