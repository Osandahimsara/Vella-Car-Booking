import '../CSS/adDriver.css';
import React, { useState } from 'react';
import axios from 'axios';

const companyOptions = [
  "Vella", "98 Acres", "Ravana Pool Club", "Flying Ravana",
  "Le Maas Tota", "Tea Factory", "Walaa kulu", "Kiri Kopi",
  "Tea Export", "Ambuluwawa Swing"
];

const DriverRegister = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [age, setAge] = useState('');
  const [company, setCompany] = useState('');
  const [NIC, setNIC] = useState('');
  const [Address, setAddress] = useState('');
  const [DLicenceNo, setDLicenceNo] = useState('');
  const [driverImage, setDriverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateNIC = (nic) => {
    const oldNICRegex = /^[0-9]{9}[vVxX]$/;
    const newNICRegex = /^[0-9]{12}$/;
    return oldNICRegex.test(nic) || newNICRegex.test(nic);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\+94|0)?[1-9][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validateLicense = (license) => {
    const licenseRegex = /^[A-Z0-9]{6,12}$/i;
    return licenseRegex.test(license);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    return nameRegex.test(name);
  };

  const validateAge = (age) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 70;
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
      setDriverImage(null);
      setImagePreview(null);
      setErrors(prev => ({ ...prev, driverImage: "" }));
      return;
    }
    
    if (!validateImage(file)) {
      setErrors(prev => ({ 
        ...prev, 
        driverImage: "Please select a valid image file (JPEG, PNG, GIF) under 5MB" 
      }));
      setDriverImage(null);
      setImagePreview(null);
      return;
    }
    
    setDriverImage(file);
    setErrors(prev => ({ ...prev, driverImage: "" }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setDriverImage(null);
    setImagePreview(null);
    setErrors(prev => ({ ...prev, driverImage: "" }));
    // Clear the file input
    const fileInput = document.getElementById('driverImage');
    if (fileInput) fileInput.value = '';
  };

  // Real-time validation handlers
  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, firstName: "First name is required" }));
    } else if (!validateName(value)) {
      setErrors(prev => ({ ...prev, firstName: "First name should only contain letters (2-30 characters)" }));
    } else {
      setErrors(prev => ({ ...prev, firstName: "" }));
    }
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, lastName: "Last name is required" }));
    } else if (!validateName(value)) {
      setErrors(prev => ({ ...prev, lastName: "Last name should only contain letters (2-30 characters)" }));
    } else {
      setErrors(prev => ({ ...prev, lastName: "" }));
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    setContact(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, contact: "Contact number is required" }));
    } else if (!validatePhone(value)) {
      setErrors(prev => ({ ...prev, contact: "Please enter a valid Sri Lankan phone number (e.g., 0712345678)" }));
    } else {
      setErrors(prev => ({ ...prev, contact: "" }));
    }
  };

  const handleNICChange = (e) => {
    const value = e.target.value.toUpperCase();
    setNIC(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, NIC: "NIC is required" }));
    } else if (!validateNIC(value)) {
      setErrors(prev => ({ ...prev, NIC: "Please enter a valid Sri Lankan NIC (e.g., 123456789V or 200012345678)" }));
    } else {
      setErrors(prev => ({ ...prev, NIC: "" }));
    }
  };

  const handleLicenseChange = (e) => {
    const value = e.target.value.toUpperCase();
    setDLicenceNo(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, DLicenceNo: "Driving license number is required" }));
    } else if (!validateLicense(value)) {
      setErrors(prev => ({ ...prev, DLicenceNo: "Please enter a valid license number (6-12 alphanumeric characters)" }));
    } else {
      setErrors(prev => ({ ...prev, DLicenceNo: "" }));
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, Address: "Address is required" }));
    } else if (value.length < 10) {
      setErrors(prev => ({ ...prev, Address: "Please enter a complete address (minimum 10 characters)" }));
    } else {
      setErrors(prev => ({ ...prev, Address: "" }));
    }
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setAge(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, age: "Age is required" }));
    } else if (!validateAge(value)) {
      setErrors(prev => ({ ...prev, age: "Age must be between 18 and 70 years" }));
    } else {
      setErrors(prev => ({ ...prev, age: "" }));
    }
  };

  const handleCompanyChange = (e) => {
    const value = e.target.value;
    setCompany(value);
    
    if (!value) {
      setErrors(prev => ({ ...prev, company: "Company selection is required" }));
    } else {
      setErrors(prev => ({ ...prev, company: "" }));
    }
  };

  // Validation before submit
  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    else if (!validateName(firstName)) newErrors.firstName = "First name should only contain letters (2-30 characters)";
    
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    else if (!validateName(lastName)) newErrors.lastName = "Last name should only contain letters (2-30 characters)";
    
    if (!contact.trim()) newErrors.contact = "Contact number is required";
    else if (!validatePhone(contact)) newErrors.contact = "Please enter a valid Sri Lankan phone number";
    
    if (!NIC.trim()) newErrors.NIC = "NIC is required";
    else if (!validateNIC(NIC)) newErrors.NIC = "Please enter a valid Sri Lankan NIC";
    
    if (!DLicenceNo.trim()) newErrors.DLicenceNo = "Driving license number is required";
    else if (!validateLicense(DLicenceNo)) newErrors.DLicenceNo = "Please enter a valid license number";
    
    if (!Address.trim()) newErrors.Address = "Address is required";
    else if (Address.length < 10) newErrors.Address = "Please enter a complete address";
    
    if (!age.trim()) newErrors.age = "Age is required";
    else if (!validateAge(age)) newErrors.age = "Age must be between 18 and 70 years";
    
    if (!company) newErrors.company = "Company selection is required";
    
    if (!driverImage) newErrors.driverImage = "Driver photo is required";
    else if (!validateImage(driverImage)) newErrors.driverImage = "Please select a valid image file (JPEG, PNG, GIF) under 5MB";
    
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
    formData.append('firstName', firstName.trim());
    formData.append('lastName', lastName.trim());
    formData.append('contact', contact.trim());
    formData.append('age', parseInt(age));
    formData.append('NIC', NIC.trim());
    formData.append('DLicenceNo', DLicenceNo.trim());
    formData.append('Address', Address.trim());
    formData.append('companyName', company);
    formData.append('driverImage', driverImage);

    try {
      const response = await axios.post('http://localhost:8000/api/driver', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Driver registered successfully!');
      handleReset();
    } catch (err) {
      console.error('Error registering driver:', err);
      if (err.response?.data?.message) {
        alert(`Error: ${err.response.data.message}`);
      } else {
        alert('Error registering driver. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFirstName('');
    setLastName('');
    setContact('');
    setNIC('');
    setDLicenceNo('');
    setAddress('');
    setAge('');
    setCompany('');
    setDriverImage(null);
    setImagePreview(null);
    setErrors({});
    
    // Clear file input
    const fileInput = document.getElementById('driverImage');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="driver-register-container">
      <div className="Users">
        <h1 className="userhead">Driver Registration</h1>

        <fieldset>
          <form onSubmit={handleSubmit}>
            {/* Driver Image Upload */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <label style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '15px', display: 'block' }}>
                Driver Photo <span style={{ color: 'red' }}>*</span>
              </label>
              
              <div className="image-upload-container" onClick={() => document.getElementById('driverImage').click()}>
                {imagePreview ? (
                  <div className="image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Driver Preview" 
                      className="preview-image"
                    />
                    <button 
                      type="button" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering file input
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
                    <div className="upload-icon">📷</div>
                    <p>Click to upload driver photo</p>
                    <small>JPEG, PNG, GIF (Max 5MB)</small>
                  </div>
                )}
                
                <input
                  id="driverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                  style={{ display: 'none' }} // Hide the actual input
                />
              </div>
              
              {errors.driverImage && <span className="error">{errors.driverImage}</span>}
            </div>
            {/* Names */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>First Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.firstName ? 'error-input' : ''}`}
                  value={firstName}
                  onChange={handleFirstNameChange}
                  placeholder="Enter first name"
                />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>
              <div>
                <label>Last Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.lastName ? 'error-input' : ''}`}
                  value={lastName}
                  onChange={handleLastNameChange}
                  placeholder="Enter last name"
                />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
            </div>

            {/* Contact & Age */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>Contact Number <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.contact ? 'error-input' : ''}`}
                  value={contact}
                  onChange={handleContactChange}
                  placeholder="+9412345678"
                />
                {errors.contact && <span className="error">{errors.contact}</span>}
              </div>
              <div>
                <label>Age <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.age ? 'error-input' : ''}`}
                  type="number"
                  min="18"
                  max="70"
                  value={age}
                  onChange={handleAgeChange}
                  placeholder="Enter age"
                />
                {errors.age && <span className="error">{errors.age}</span>}
              </div>
            </div>

            {/* NIC & License */}
            <div className="row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label>NIC <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.NIC ? 'error-input' : ''}`}
                  value={NIC}
                  onChange={handleNICChange}
                  placeholder="123456789V or 200012345678"
                />
                {errors.NIC && <span className="error">{errors.NIC}</span>}
              </div>
              <div>
                <label>Driving License Number <span style={{ color: 'red' }}>*</span></label>
                <input
                  className={`input ${errors.DLicenceNo ? 'error-input' : ''}`}
                  value={DLicenceNo}
                  onChange={handleLicenseChange}
                  placeholder="Enter license number"
                />
                {errors.DLicenceNo && <span className="error">{errors.DLicenceNo}</span>}
              </div>
            </div>

            {/* Address */}
            <div style={{ marginBottom: '20px' }}>
              <label>Address <span style={{ color: 'red' }}>*</span></label>
              <textarea
                className={`input ${errors.Address ? 'error-input' : ''}`}
                value={Address}
                onChange={handleAddressChange}
                placeholder="Enter complete address"
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
              {errors.Address && <span className="error">{errors.Address}</span>}
            </div>

            {/* Company */}
            <div style={{ marginBottom: '30px' }}>
              <label>Company Name <span style={{ color: 'red' }}>*</span></label>
              <select
                className={errors.company ? 'error-input' : ''}
                value={company}
                onChange={handleCompanyChange}
              >
                <option value="">Select Company</option>
                {companyOptions.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.company && <span className="error">{errors.company}</span>}
            </div>

            {/* Buttons */}
            <div className="button-group">
              <button 
                type="button" 
                className="btn1" 
                onClick={handleReset}
                disabled={loading}
              >
                Reset
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
    </div>
  );
};

export default DriverRegister;