import React, { useState, useEffect } from "react";
import Footer from "../components/Footer";
import axios from "axios";
import "../CSS/vehicles.css";

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vehicles from the database
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/api/vehicles');
        setVehicles(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <>
        <section className="vehicles-page">
          <div className="container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading our vehicles...</p>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <section className="vehicles-page">
          <div className="container">
            <div className="error-container">
              <h2>⚠️ Unable to Load Vehicles</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="retry-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  if (vehicles.length === 0) {
    return (
      <>
        <section className="vehicles-page">
          <div className="container">
            <div className="no-vehicles-container">
              <h2>No Vehicles Available</h2>
              <p>We're currently adding new vehicles to our fleet.</p>
              <p>Please check back soon!</p>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="vehicles-page">
        <div className="container">
          <div className="vehicles-header">
            <h1>Our Vehicle Fleet</h1>
            <p>Discover our wide range of well-maintained vehicles</p>
          </div>
          
          <div className="vehicles-container">
            {vehicles.map((vehicle) => (
              <div key={vehicle._id} className="vehicle-card">
                <div className="vehicle-card__img-div">
                  {vehicle.vehicleImageUrl ? (
                    <img 
                      src={`http://localhost:8000${vehicle.vehicleImageUrl}`} 
                      alt={`${vehicle.brandName} ${vehicle.modelName}`}
                      onError={(e) => {
                        e.target.src = '/images/cars/default-car.png';
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      <i className="fa-solid fa-car"></i>
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="vehicle-card__info">
                  <h3>{vehicle.brandName} {vehicle.modelName}</h3>
                  
                  <div className="vehicle-details">
                    <div className="detail-item">
                      <div>
                        <div className="detail-label">Vehicle Number</div>
                        <div className="detail-value">{vehicle.vehicleNumber}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                     
                      <div>
                        <div className="detail-label">Year</div>
                        <div className="detail-value">{vehicle.year}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                      
                      <div>
                        <div className="detail-label">Fuel Type</div>
                        <div className="detail-value">{vehicle.fuelType || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="detail-item">
                   
                      <div>
                        <div className="detail-label">Seating</div>
                        <div className="detail-value">{vehicle.seatingCapacity ? `${vehicle.seatingCapacity} Seats` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                <div className="vehicle-status">
                    <span className={`status-badge ${vehicle.status}`}>
                      {vehicle.status === 'active' ? 'Available' : 
                       vehicle.status === 'maintenance' ? 'Maintenance' : 
                       'Unavailable'}
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

export default Vehicles;