import '../CSS/adVehicle.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const vehicleBrands = [
  "Toyota", "Honda", "Nissan", "Suzuki", "Mitsubishi", "Mazda",
  "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Volvo",
  "Hyundai", "KIA", "Ford", "Chevrolet", "Peugeot", "Other"
];

const fuelTypes = [
  "Petrol", "Diesel", "Hybrid", "Electric", "CNG", "LPG"
];

const VehicleRegister = () => {
  const navigate = useNavigate();
  const [vehicleImage, setVehicleImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [modelName, setModelName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [seatCount, setSeatCount] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validation functions
  const validateVehicleNumber = (number) => {
    // Sri Lankan vehicle number format: ABC-1234 or AB-1234 or ABC-123
    const vehicleRegex = /^[A-Z]{2,3}-\d{3,4}$/;
    return vehicleRegex.test(number);
  };

  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return !isNaN(yearNum) && yearNum >= 1990 && yearNum <= currentYear;
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z0-9\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const validateImage = (file) => {
    if (!file) return false;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return allowedTypes.includes(file.type) && file.size <= maxSize;
  };

  // Image handling
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      setVehicleImage(null);
      setImagePreview(null);
      setErrors(prev => ({ ...prev, vehicleImage: "" }));
      return;
    }
    
    if (!validateImage(file)) {
      setErrors(prev => ({ 
        ...prev, 
        vehicleImage: "Please select a valid image file (JPEG, PNG, GIF) under 5MB" 
      }));
      setVehicleImage(null);
      setImagePreview(null);
      return;
    }
    
    setVehicleImage(file);
    setErrors(prev => ({ ...prev, vehicleImage: "" }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setVehicleImage(null);
    setImagePreview(null);
    setErrors(prev => ({ ...prev, vehicleImage: "" }));
    const fileInput = document.getElementById('vehicleImage');
    if (fileInput) fileInput.value = '';
  };

  // Real-time validation handlers
  const handleBrandChange = (e) => {
    const value = e.target.value;
    setBrandName(value);
    
    if (!value) {
      setErrors(prev => ({ ...prev, brandName: "Brand selection is required" }));
    } else {
      setErrors(prev => ({ ...prev, brandName: "" }));
    }
  };

  const handleModelChange = (e) => {
    const value = e.target.value;
    setModelName(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, modelName: "Model name is required" }));
    } else if (!validateName(value)) {
      setErrors(prev => ({ ...prev, modelName: "Model name should contain only letters, numbers, and spaces (2-50 characters)" }));
    } else {
      setErrors(prev => ({ ...prev, modelName: "" }));
    }
  };

  const handleVehicleNumberChange = (e) => {
    const value = e.target.value.toUpperCase();
    setVehicleNumber(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, vehicleNumber: "Vehicle number is required" }));
    } else if (!validateVehicleNumber(value)) {
      setErrors(prev => ({ ...prev, vehicleNumber: "Please enter a valid vehicle number (e.g., ABC-1234)" }));
    } else {
      setErrors(prev => ({ ...prev, vehicleNumber: "" }));
    }
  };

  const handleYearChange = (e) => {
    const value = e.target.value;
    setYear(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, year: "Year is required" }));
    } else if (!validateYear(value)) {
      setErrors(prev => ({ ...prev, year: `Year must be between 1990 and ${new Date().getFullYear()}` }));
    } else {
      setErrors(prev => ({ ...prev, year: "" }));
    }
  };

  const handleFuelTypeChange = (e) => {
    const value = e.target.value;
    setFuelType(value);
    
    if (!value) {
      setErrors(prev => ({ ...prev, fuelType: "Fuel type selection is required" }));
    } else {
      setErrors(prev => ({ ...prev, fuelType: "" }));
    }
  };

  const handleSeatCountChange = (e) => {
    const value = e.target.value;
    setSeatCount(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, seatCount: "Seat count is required" }));
    } else {
      const seatNum = parseInt(value);
      if (isNaN(seatNum) || seatNum < 1 || seatNum > 50) {
        setErrors(prev => ({ ...prev, seatCount: "Seat count must be between 1 and 50" }));
      } else {
        setErrors(prev => ({ ...prev, seatCount: "" }));
      }
    }
  };

  // Validation before submit
  const validateForm = () => {
    const newErrors = {};
    
    if (!brandName) newErrors.brandName = "Brand selection is required";
    
    if (!modelName.trim()) newErrors.modelName = "Model name is required";
    else if (!validateName(modelName)) newErrors.modelName = "Model name should contain only letters, numbers, and spaces (2-50 characters)";
    
    if (!vehicleNumber.trim()) newErrors.vehicleNumber = "Vehicle number is required";
    else if (!validateVehicleNumber(vehicleNumber)) newErrors.vehicleNumber = "Please enter a valid vehicle number (e.g., ABC-1234)";
    
    if (!year.trim()) newErrors.year = "Year is required";
    else if (!validateYear(year)) newErrors.year = `Year must be between 1990 and ${new Date().getFullYear()}`;
    
    if (!seatCount.trim()) newErrors.seatCount = "Seat count is required";
    else {
      const seatNum = parseInt(seatCount);
      if (isNaN(seatNum) || seatNum < 1 || seatNum > 50) {
        newErrors.seatCount = "Seat count must be between 1 and 50";
      }
    }
    
    if (!fuelType) newErrors.fuelType = "Fuel type selection is required";
    
    if (!vehicleImage) newErrors.vehicleImage = "Vehicle photo is required";
    else if (!validateImage(vehicleImage)) newErrors.vehicleImage = "Please select a valid image file (JPEG, PNG, GIF) under 5MB";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('brandName', brandName);
    formData.append('modelName', modelName.trim());
    formData.append('vehicleNumber', vehicleNumber.trim());
    formData.append('year', parseInt(year));
    formData.append('seatingCapacity', parseInt(seatCount));
    formData.append('fuelType', fuelType);
    formData.append('vehicleImage', vehicleImage);

    try {
      await axios.post('http://localhost:8000/api/vehicles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setShowSuccessModal(true);
      handleReset();
    } catch (err) {
      console.error('Error registering vehicle:', err);
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Error registering vehicle. Please try again.');
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setBrandName('');
    setModelName('');
    setVehicleNumber('');
    setYear('');
    setSeatCount('');
    setFuelType('');
    setVehicleImage(null);
    setImagePreview(null);
    setErrors({});
    
    const fileInput = document.getElementById('vehicleImage');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="vehicle-register-container">
      <div className="Users">
        <h1 className="userhead">Vehicle Registration</h1>

        <fieldset>
          <form onSubmit={handleSubmit}>
           

            {/* Vehicle Image Upload */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px', display: 'block' }}>
                Vehicle Photo <span style={{ color: 'red' }}>*</span>
              </label>
              
              <div className="image-upload-container" onClick={() => document.getElementById('vehicleImage').click()}>
                {imagePreview ? (
                  <div className="image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Vehicle Preview" 
                      className="preview-image"
                    />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        removeImage();
                      }}
                      className="remove-image-btn"
                      title="Remove Image"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">+</div>
                    <p>Click to upload vehicle photo</p>
                    <small>JPEG, PNG, GIF (Max 5MB)</small>
                  </div>
                )}
                
                <input
                  id="vehicleImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  style={{ display: 'none' }} // Hide the actual input
                />
              </div>
              
              {errors.vehicleImage && <span className="error">{errors.vehicleImage}</span>}
            </div>

            {/* Brand & Model */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>Brand Name <span style={{ color: 'red' }}>*</span></label>
                <select
                  className={`input ${errors.brandName ? 'error-input' : ''}`}
                  value={brandName}
                  onChange={handleBrandChange}
                >
                  <option value="">Select Brand</option>
                  {vehicleBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.brandName && <span className="error">{errors.brandName}</span>}
              </div>
              <div>
                <label>Model Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.modelName ? 'error-input' : ''}`}
                  value={modelName}
                  onChange={handleModelChange}
                  placeholder="Enter model name (e.g., Camry, Corolla)"
                />
                {errors.modelName && <span className="error">{errors.modelName}</span>}
              </div>
            </div>

            {/* Vehicle Number & Year */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>Vehicle Number <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.vehicleNumber ? 'error-input' : ''}`}
                  value={vehicleNumber}
                  onChange={handleVehicleNumberChange}
                  placeholder="ABC-1234"
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.vehicleNumber && <span className="error">{errors.vehicleNumber}</span>}
              </div>
              <div>
                <label>Year <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.year ? 'error-input' : ''}`}
                  type="number"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={year}
                  onChange={handleYearChange}
                  placeholder="Enter year"
                />
                {errors.year && <span className="error">{errors.year}</span>}
              </div>
            </div>

            {/* Seat Count & Fuel Type */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>Seat Count <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.seatCount ? 'error-input' : ''}`}
                  type="number"
                  min="1"
                  max="50"
                  value={seatCount}
                  onChange={handleSeatCountChange}
                  placeholder="Enter seat count"
                />
                {errors.seatCount && <span className="error">{errors.seatCount}</span>}
              </div>
              <div>
                <label>Fuel Type <span style={{ color: 'red' }}>*</span></label>
                <select
                  className={`input ${errors.fuelType ? 'error-input' : ''}`}
                  value={fuelType}
                  onChange={handleFuelTypeChange}
                >
                  <option value="">Select Fuel Type</option>
                  {fuelTypes.map(fuel => (
                    <option key={fuel} value={fuel}>{fuel}</option>
                  ))}
                </select>
                {errors.fuelType && <span className="error">{errors.fuelType}</span>}
              </div>
            </div>

            {/* Buttons */}
           <div className="button-group">
              <button 
                type="button" 
                className="btn1" 
                onClick={() => navigate('/Adminpage')}
                disabled={loading}
              >
                Back to Admin
              </button>
              <button 
                type="submit" 
                className="btn2"
                disabled={loading || Object.values(errors).some(error => error !== "")}
              >
                {loading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </form>
        </fieldset>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
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
              Vehicle has been registered successfully!
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/AdminVehicles');
              }}
              style={{
                backgroundColor: '#fa4226',
                color: 'white',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#e63946'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#fa4226'}
            >
              View Vehicles
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

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleRegister;