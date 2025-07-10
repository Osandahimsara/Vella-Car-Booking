import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import axios from "axios";
import "../CSS/drivers.css";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch drivers from the database
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/driver');
        setDrivers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load drivers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  if (loading) {
    return (
      <>
        <section className="drivers-page">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading our drivers...</p>
            </div>
          </div>
          <Footer />
        </section>
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="drivers-page">
          <div className="container">
            <div className="error-container">
              <h2>⚠️ Unable to Load Drivers</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          </div>
          <Footer />
        </section>
      </>
    );
  }

  if (drivers.length === 0) {
    return (
      <>
        <section className="drivers-page">
          <div className="container">
            <div className="no-drivers-container">
              <h2>No Drivers Available</h2>
              <p>We're currently adding new professional drivers to our team.</p>
              <p>Please check back soon!</p>
            </div>
          </div>
          <Footer />
        </section>
      </>
    );
  }

  return (
    <>
      <section className="drivers-page">
        <div className="container">
          <div className="drivers-header">
            <h1> Our Drivers</h1>
            <p>Meet our experienced and certified drivers ready to serve you</p>
          </div>
          
          <div className="team-container">
            {drivers.map((driver) => (
              <div key={driver._id} className="team-container__box">
                <div className="team-container__box__img-div">
                  {driver.driverImageUrl ? (
                    <img 
                      src={`http://localhost:8000${driver.driverImageUrl}`} 
                      alt={`${driver.firstName} ${driver.lastName}`}
                      onError={(e) => {
                        e.target.src = '/images/team/default-driver.png'; // Fallback image
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                </div>
                <div className="team-container__box__descr">
                  <h3>{driver.firstName} {driver.lastName}</h3>
                  <p className="driver-company">{driver.companyName}</p>
                  <div className="driver-details">
                    <span className="driver-age">
                      <i className="fa-solid fa-calendar"></i> {driver.age} years
                    </span>
                    <span className="driver-contact">
                      <i className="fa-solid fa-phone"></i> {driver.contact}
                    </span>
                  </div>
                   {/*  License number display */}
                  {/* 
                  <div className="driver-license">
                    <span>License: {driver.DLicenceNo}</span>
                  </div>
                  */}
                  <div className="driver-status">
                    <span className={`status-badge ${driver.status}`}>
                      {driver.status === 'active' ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </section>
    </>
  );
}

export default Drivers;