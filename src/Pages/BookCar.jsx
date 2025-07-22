import { useEffect, useState } from "react";
import axios from "axios";
import "../CSS/book.css";
import Footer from "../components/Footer";
import citiesData from "../components/cities.json";

function BookCar() {
  const [modal, setModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState(false); 
  const [carType, setCarType] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickUp, setPickUp] = useState("");
  const [dropOff, setDropOff] = useState("");
  const [pickTime, setPickTime] = useState("");
  const [pickUpTime, setPickUpTime] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [dropOffTime, setDropOffTime] = useState("");
  const [driver, setDriver] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setdesignation] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [bookingId, setBookingId] = useState("");
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [driverLoading, setDriverLoading] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [vehicleLoading, setVehicleLoading] = useState(false);

  // Availability status states
  const [vehicleAvailabilityMessage, setVehicleAvailabilityMessage] = useState("");
  const [driverAvailabilityMessage, setDriverAvailabilityMessage] = useState("");
  const [selectedDriverDetails, setSelectedDriverDetails] = useState(null);

  // validation error states
  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
    phone: "",
    designation: "",
    email: ""
  });

  // Load cities and vehicles from server when component mounts
  useEffect(() => {
    loadCitiesFromJSON();
    fetchAvailableVehicles();
  }, []);

  // Fetch drivers based on selected dates/times with debugging
  useEffect(() => {
    console.log('📅 Dates/times changed:', { pickTime, dropTime, pickUpTime, dropOffTime });
    
    if (pickTime && dropTime && pickUpTime && dropOffTime) {
      console.log('✅ All dates/times selected, fetching available drivers...');
      fetchAvailableDrivers();
      
      // Check vehicle availability when dates change
      if (selectedVehicle) {
        console.log('🚗 Checking vehicle availability...');
        checkVehicleAvailability(selectedVehicle._id);
      }
      
      // Check driver availability when dates change
      if (driver) {
        console.log('👨‍💼 Checking driver availability...');
        checkDriverAvailability(driver);
      }
    } else {
      console.log('⚠️ Missing dates/times, fetching all drivers...');
      fetchAllDrivers();
      setVehicleAvailabilityMessage("");
      setDriverAvailabilityMessage("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickTime, dropTime, pickUpTime, dropOffTime]);

  // Check vehicle availability for selected dates
  const checkVehicleAvailability = async (vehicleId) => {
    if (!pickTime || !dropTime || !pickUpTime || !dropOffTime) {
      setVehicleAvailabilityMessage("");
      return;
    }

    try {
      setVehicleAvailabilityMessage("🔄 Checking vehicle availability...");
      
      const params = new URLSearchParams({
        vehicleId: vehicleId,
        pickUpDate: pickTime,
        dropOffDate: dropTime,
        pickUpTime: pickUpTime,
        dropOffTime: dropOffTime
      });

      const response = await axios.get(`http://13.214.122.184:8000/api/vehicles/check-availability?${params}`);
      console.log('🚗 Vehicle availability response:', response.data);
      
      if (response.data.available) {
        setVehicleAvailabilityMessage("✅ Vehicle is available for selected dates");
      } else {
        setVehicleAvailabilityMessage(`❌ Vehicle is not available (${response.data.conflictingBookings} conflicting bookings)`);
      }
    } catch (error) {
      console.error('❌ Error checking vehicle availability:', error);
      setVehicleAvailabilityMessage("⚠️ Unable to check vehicle availability");
    }
  };

  // FIXED: Check individual driver availability with enhanced debugging
  const checkDriverAvailability = async (driverName) => {
    console.log('🔍 Checking driver availability for:', driverName);
    
    if (!pickTime || !dropTime || !pickUpTime || !dropOffTime) {
      setDriverAvailabilityMessage("ℹ️ Select dates and times to check availability");
      return;
    }

    if (!driverName) {
      setDriverAvailabilityMessage("");
      return;
    }

    try {
      setDriverAvailabilityMessage("🔄 Checking driver availability...");
      
      const params = new URLSearchParams({
        driverName: driverName,
        pickUpDate: pickTime,
        dropOffDate: dropTime,
        pickUpTime: pickUpTime,
        dropOffTime: dropOffTime
      });

      const url = `http://13.214.122.184:8000/api/driver/check-individual?${params}`;
      console.log('📞 Making driver availability request to:', url);
      
      const response = await axios.get(url);
      console.log('✅ Driver availability response:', response.data);
      
      if (response.data.available) {
        setDriverAvailabilityMessage("✅ Driver is available for selected dates");
      } else {
        setDriverAvailabilityMessage(`❌ Driver is not available (${response.data.conflictingBookings} conflicting bookings)`);
      }
    } catch (error) {
      console.error('❌ Error checking driver availability:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        setDriverAvailabilityMessage("❌ Driver availability check endpoint not found");
      } else {
        setDriverAvailabilityMessage("⚠️ Unable to check driver availability");
      }
    }
  };

  // Fetch available vehicles from database
  const fetchAvailableVehicles = async () => {
    try {
      setVehicleLoading(true);
      console.log('🚗 Fetching available vehicles...');
      const response = await axios.get('http://13.214.122.184:8000/api/vehicles');
      console.log('✅ Vehicles response:', response.data);
      
      const activeVehicles = response.data.filter(vehicle => vehicle.status === 'active');
      setAvailableVehicles(activeVehicles);
      console.log(`📊 Found ${activeVehicles.length} active vehicles`);
      
    } catch (error) {
      console.error('❌ Error fetching vehicles:', error);
      setAvailableVehicles([]);
    } finally {
      setVehicleLoading(false);
    }
  };

  // Fetch available drivers
  const fetchAvailableDrivers = async () => {
    try {
      setDriverLoading(true);
      console.log('🔍 Fetching available drivers for:', { pickTime, dropTime, pickUpTime, dropOffTime });
      
      const params = new URLSearchParams({
        pickUpDate: pickTime,
        dropOffDate: dropTime,
        pickUpTime: pickUpTime,
        dropOffTime: dropOffTime
      });
      
      const url = `http://13.214.122.184:8000/api/driver/available?${params}`;
      console.log('📞 Making request to:', url);
      
      const response = await axios.get(url);
      console.log('✅ Available drivers response:', response.data);
      
      setAvailableDrivers(response.data.availableDrivers || []);
      
      if (response.data.conflictingBookings > 0) {
        console.log(`⚠️ Found ${response.data.conflictingBookings} conflicting bookings`);
        console.log('🚫 Booked drivers:', response.data.bookedDrivers);
      }
      
      console.log(`📊 Available: ${response.data.availableDrivers?.length || 0} / Total: ${response.data.totalDrivers}`);
      
      // Check if currently selected driver is still available
      if (driver && response.data.bookedDrivers && response.data.bookedDrivers.includes(driver)) {
        setDriver("");
        setDriverAvailabilityMessage("❌ Previously selected driver is no longer available");
        setSelectedDriverDetails(null);
        alert(`Driver ${driver} is no longer available for the selected time. Please choose another driver.`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching available drivers:', error);
      console.error('Error details:', error.response?.data);
      setAvailableDrivers([]);
    } finally {
      setDriverLoading(false);
    }
  };

  // Fetch all drivers (when no dates selected)
  const fetchAllDrivers = async () => {
    try {
      setDriverLoading(true);
      console.log('Fetching all drivers...');
      const response = await axios.get('http://13.214.122.184:8000/api/driver');
      console.log('All drivers response:', response.data);
      
      const activeDrivers = response.data.filter(driver => driver.status === 'active');
      setAvailableDrivers(activeDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setAvailableDrivers([]);
    } finally {
      setDriverLoading(false);
    }
  };

  // Load cities from JSON
  const loadCitiesFromJSON = () => {
    try {
      const cityOptions = [];
      
      Object.keys(citiesData).forEach(district => {
        cityOptions.push({
          value: '',
          label: `--- ${district} District ---`,
          disabled: true
        });
        
        citiesData[district].cities.forEach(city => {
          cityOptions.push({
            value: `${city}, ${district}`,
            label: `${city}`,
            disabled: false
          });
        });
      });

      setCities(cityOptions);
      
    } catch (error) {
      console.error("Error loading cities:", error);
      setCities([
        { value: "Colombo", label: "Colombo", disabled: false },
        { value: "Kandy", label: "Kandy", disabled: false },
        { value: "Galle", label: "Galle", disabled: false }
      ]);
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,30}$/;
    return nameRegex.test(name);
  };

  // Real-time validation handlers
  const handleName = (e) => {
    const value = e.target.value;
    setName(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, name: "First name is required" }));
    } else if (!validateName(value)) {
      setErrors(prev => ({ ...prev, name: "First name should only contain letters (2-30 characters)" }));
    } else {
      setErrors(prev => ({ ...prev, name: "" }));
    }
  };

  const handleLastName = (e) => {
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

  const handlePhone = (e) => {
    const value = e.target.value;
    setPhone(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, phone: "Phone number is required" }));
    } else if (!validatePhone(value)) {
      setErrors(prev => ({ ...prev, phone: "Please enter a valid phone number (10-15 digits)" }));
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  const handledesignation = (e) => {
    const value = e.target.value;
    setdesignation(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, designation: "Designation is required" }));
    } else if (value.length < 2) {
      setErrors(prev => ({ ...prev, designation: "Designation must be at least 2 characters" }));
    } else {
      setErrors(prev => ({ ...prev, designation: "" }));
    }
  };

  const handleEmail = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, email: "Email address is required" }));
    } else if (!validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address (e.g., user@example.com)" }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  };

  // confirmBooking function with vehicle details
  const confirmBooking = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "First name is required";
    } else if (!validateName(name)) {
      newErrors.name = "First name should only contain letters (2-30 characters)";
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (!validateName(lastName)) {
      newErrors.lastName = "Last name should only contain letters (2-30 characters)";
    }
    
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid phone number (10-15 digits)";
    }
    
    if (!designation.trim()) {
      newErrors.designation = "Designation is required";
    } else if (designation.length < 2) {
      newErrors.designation = "Designation must be at least 2 characters";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address (e.g., user@example.com)";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      const errorMsg = document.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.style.display = "flex";
        errorMsg.textContent = "Please fix the errors below!";
      }
      
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`input[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    setLoading(true);

    // Include vehicle details in booking
    const bookingData = {
      carType,
      vehicleDetails: selectedVehicle ? {
        vehicleId: selectedVehicle._id,
        brandName: selectedVehicle.brandName,
        modelName: selectedVehicle.modelName,
        vehicleNumber: selectedVehicle.vehicleNumber,
        year: selectedVehicle.year,
        fuelType: selectedVehicle.fuelType
      } : null,
      pickUp,
      dropOff,
      pickTime,
      pickUpTime,   
      dropOffTime,  
      dropTime,
      driver, 
      name: name.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      designation: designation.trim(),
      email: email.trim(),
    };

    try {
      const response = await axios.post("http://13.214.122.184:8000/api/bookings", bookingData);
      setBookingId(response.data.bookingId); 
      setModal(false);
      setSuccessMessage(true);
      
      // Clear form data and errors
      setName("");
      setLastName("");
      setPhone("");
      setdesignation("");
      setEmail("");
      setErrors({});
      
      setTimeout(() => setSuccessMessage(false), 8000);
    } catch (error) {
      console.error("Error saving booking:", error);
      
      if (error.response?.status === 409) {
        alert(error.response.data.message);
        fetchAvailableDrivers();
        setDriver("");
      } else {
        alert("Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle booking inputs
  const handlePick = (e) => {
    const value = e.target.value;
    setPickUp(value);
    console.log("Pick-up selected:", value);
  };
  
  const handleDrop = (e) => {
    const value = e.target.value;
    setDropOff(value);
    console.log("Drop-off selected:", value);
  };
  
  const handlePickTime = (e) => {
    const selectedDate = e.target.value;
    setPickTime(selectedDate);
    console.log("Pick-up date selected:", selectedDate);
    
    // Fetch available drivers when dates change
    if (selectedDate && dropTime) {
      fetchAvailableDrivers();
    }
  };
  
  const handleDropTime = (e) => {
    const selectedDate = e.target.value;
    setDropTime(selectedDate);
    console.log("Drop-off date selected:", selectedDate);
    
    // Fetch available drivers when dates change
    if (pickTime && selectedDate) {
      fetchAvailableDrivers();
    }
  };

  const handlePickUpTimeChange = (e) => {
    const time = e.target.value;
    setPickUpTime(time);
    console.log("Pick-up time selected:", time);
    
    // Re-fetch drivers if both dates and times are set
    if (pickTime && dropTime && time && dropOffTime) {
      fetchAvailableDrivers();
    }
  };

  const handleDropOffTimeChange = (e) => {
    const time = e.target.value;
    setDropOffTime(time);
    console.log("Drop-off time selected:", time);
    
    // Re-fetch drivers if both dates and times are set
    if (pickTime && dropTime && pickUpTime && time) {
      fetchAvailableDrivers();
    }
  };

  // Handle vehicle selection with availability check
  const handleVehicleSelect = (e) => {
    const vehicleId = e.target.value;
    console.log("Vehicle selection changed:", vehicleId);
    
    if (vehicleId) {
      const vehicle = availableVehicles.find(v => v._id === vehicleId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
        setCarType(`${vehicle.brandName} ${vehicle.modelName}`);
        console.log('🚗 Selected vehicle:', vehicle);
        
        // Check availability immediately if dates are selected
        if (pickTime && dropTime && pickUpTime && dropOffTime) {
          checkVehicleAvailability(vehicleId);
        } else {
          setVehicleAvailabilityMessage("ℹ️ Select dates to check availability");
        }
      }
    } else {
      setSelectedVehicle(null);
      setCarType("");
      setVehicleAvailabilityMessage("");
    }
  };

  // Handle driver selection with availability check
  const handleDriver = (e) => {
    const driverName = e.target.value;
    console.log('👨‍💼 Driver selected:', driverName);
    setDriver(driverName);
    
    if (driverName) {
      // Find driver details
      const driverData = availableDrivers.find(d => 
        `${d.firstName} ${d.lastName}` === driverName
      );
      
      if (driverData) {
        setSelectedDriverDetails(driverData);
        console.log('👨‍💼 Selected driver details:', driverData);
        
        // Check availability immediately if dates are selected
        if (pickTime && dropTime && pickUpTime && dropOffTime) {
          console.log('📅 Dates available, checking driver availability...');
          checkDriverAvailability(driverName);
        } else {
          setDriverAvailabilityMessage("ℹ️ Select dates and times to check availability");
        }
      }
    } else {
      setSelectedDriverDetails(null);
      setDriverAvailabilityMessage("");
    }
  };

  // Open modal validation to include vehicle
  const openModal = (e) => {
    e.preventDefault();
    const errorMsg = document.querySelector(".error-message");
    if (!pickUp || !dropOff || !pickTime || !dropTime || !carType || !driver) {
      errorMsg.style.display = "flex";
      errorMsg.textContent = "All fields including vehicle and driver selection are required!";
    } else {
      setModal(!modal);
      const modalDiv = document.querySelector(".booking-modal");
      if (modalDiv) modalDiv.scroll(0, 0);
      errorMsg.style.display = "none";
    }
  };

  // Disable page scroll when modal is displayed
  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "auto";
  }, [modal]);

  // Hide success message
  const hideMessage = () => {
    const doneMsg = document.querySelector(".booking-done");
    if (doneMsg) doneMsg.style.display = "none";
  };

  return (
    <>       
      <section id="booking-section" className="book-section">
        {/* Overlay */}
        {modal && (
          <div
            onClick={() => setModal(false)}
            className="modal-overlay active-modal"
          ></div>
        )}

        <div className="container">
          <div className="book-content">
            <div className="book-content__box">
              <h2>Book a car</h2>

              <p className="error-message">
                All fields required! <i className="fa-solid fa-xmark"></i>
              </p>

              <p className="booking-done">
                Check your email to confirm an order.{" "}
                <i onClick={hideMessage} className="fa-solid fa-xmark"></i>
              </p>

              <form className="box-form" onSubmit={(e) => e.preventDefault()} style={{ position: 'relative', zIndex: '10' }}>
                {/* Dynamic Vehicle Selection with Availability */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-car"></i> &nbsp; Select Vehicle <b>*</b>
                  </label>
                  <select 
                    value={selectedVehicle?._id || ""} 
                    onChange={handleVehicleSelect} 
                    disabled={vehicleLoading}
                    style={{ 
                      fontSize: '1.5rem',
                      color: '#ababab',
                      fontFamily: '"Rubik", sans-serif',
                      border: '1px solid #ccd7e6',
                      borderRadius: '3px',
                      fontWeight: '400',
                      padding: '1.2rem 1.3rem',
                      outline: 'none',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Vehicle select focused')}
                    onClick={() => console.log('Vehicle select clicked')}
                  >
                    <option value="">
                      {vehicleLoading ? "Loading vehicles..." : "Select your vehicle"}
                    </option>
                    {availableVehicles.length > 0 ? (
                      availableVehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.brandName} {vehicle.modelName} ({vehicle.year}) - {vehicle.vehicleNumber}
                        </option>
                      ))
                    ) : (
                      !vehicleLoading && (
                        <option disabled>No vehicles available</option>
                      )
                    )}
                  </select>
                  
                  {/* Show selected vehicle details and availability */}
                  {selectedVehicle && (
                    <div style={{ marginTop: '10px' }}>
                      <small style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                        ✅ {selectedVehicle.brandName} {selectedVehicle.modelName} • {selectedVehicle.fuelType || 'N/A'} • {selectedVehicle.year}
                      </small>
                      {vehicleAvailabilityMessage && (
                        <small style={{ 
                          color: vehicleAvailabilityMessage.includes('✅') ? '#28a745' : 
                                vehicleAvailabilityMessage.includes('❌') ? '#dc3545' : '#6c757d',
                          fontSize: '12px', 
                          display: 'block',
                          fontWeight: 'bold',
                          marginTop: '5px'
                        }}>
                          {vehicleAvailabilityMessage}
                        </small>
                      )}
                    </div>
                  )}
                </div>

               {/* Pick-up Location */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> &nbsp; Pick-up <b>*</b>
                  </label>
                  <select 
                    value={pickUp} 
                    onChange={handlePick}
                    style={{ 
                      fontSize: '1.5rem',
                      color: '#ababab',
                      fontFamily: '"Rubik", sans-serif',
                      border: '1px solid #ccd7e6',
                      borderRadius: '3px',
                      fontWeight: '400',
                      padding: '1.2rem 1.3rem',
                      outline: 'none',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Pick-up select focused')}
                    onClick={() => console.log('Pick-up select clicked')}
                  >
                    <option value="">Select pick up location</option>
                    {cities.map((city, index) => (
                      <option 
                        key={index} 
                        value={city.value} 
                        disabled={city.disabled}
                        style={{ 
                          fontWeight: city.disabled ? 'bold' : 'normal',
                          color: city.disabled ? '#666' : '#000',
                          backgroundColor: city.disabled ? '#f5f5f5' : '#ffffff'
                        }}
                      >
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Drop-off Location */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> &nbsp; Drop-off <b>*</b>
                  </label>
                  <select 
                    value={dropOff} 
                    onChange={handleDrop}
                    style={{ 
                      fontSize: '1.5rem',
                      color: '#ababab',
                      fontFamily: '"Rubik", sans-serif',
                      border: '1px solid #ccd7e6',
                      borderRadius: '3px',
                      fontWeight: '400',
                      padding: '1.2rem 1.3rem',
                      outline: 'none',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Drop-off select focused')}
                    onClick={() => console.log('Drop-off select clicked')}
                  >
                    <option value="">Select drop off location</option>
                    {cities.map((city, index) => (
                      <option 
                        key={index} 
                        value={city.value} 
                        disabled={city.disabled}
                        style={{ 
                          fontWeight: city.disabled ? 'bold' : 'normal',
                          color: city.disabled ? '#666' : '#000',
                          backgroundColor: city.disabled ? '#f5f5f5' : '#ffffff'
                        }}
                      >
                        {city.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="box-form__car-time">
                  <label htmlFor="picktime">
                    <i className="fa-regular fa-calendar-days "></i> &nbsp;
                    Pick-up Date<b>*</b>
                  </label>
                  <input
                    id="picktime"
                    value={pickTime}
                    onChange={handlePickTime}
                    type="date"
                    style={{
                      outline: 'none',
                      color: '#878585',
                      border: '1px solid #ccd7e6',
                      padding: '1.2rem 1.3rem',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Pick-up date focused')}
                    onClick={() => console.log('Pick-up date clicked')}
                  ></input>
                </div>

                {/* Pick-Up Time */}
                <div className="box-form__car-time">
                  <label htmlFor="pickUpTime">
                    <i className="fa-regular fa-clock"></i> &nbsp;
                    Pick-Up Time <b>*</b>
                  </label>
                  <input
                    type="time"
                    id="pickUpTime"
                    value={pickUpTime}
                    onChange={handlePickUpTimeChange}
                    required
                    style={{
                      outline: 'none',
                      color: '#878585',
                      border: '1px solid #ccd7e6',
                      padding: '1.2rem 1.3rem',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Pick-up time focused')}
                    onClick={() => console.log('Pick-up time clicked')}
                  />
                </div>

                <div className="box-form__car-time">
                  <label htmlFor="droptime">
                    <i className="fa-regular fa-calendar-days "></i> &nbsp;
                    Drop-off Date <b>*</b>
                  </label>
                  <input
                    id="droptime"
                    value={dropTime}
                    onChange={handleDropTime}
                    type="date"
                    style={{
                      outline: 'none',
                      color: '#878585',
                      border: '1px solid #ccd7e6',
                      padding: '1.2rem 1.3rem',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Drop-off date focused')}
                    onClick={() => console.log('Drop-off date clicked')}
                  ></input>
                </div>

                {/* Drop-Off Time */}
                <div className="box-form__car-time">
                  <label htmlFor="dropOffTime">
                    <i className="fa-regular fa-clock"></i> &nbsp;
                    Drop-Off Time <b>*</b>
                  </label>
                  <input
                    type="time"
                    id="dropOffTime"
                    value={dropOffTime}
                    onChange={handleDropOffTimeChange}
                    required
                    style={{
                      outline: 'none',
                      color: '#878585',
                      border: '1px solid #ccd7e6',
                      padding: '1.2rem 1.3rem',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Drop-off time focused')}
                    onClick={() => console.log('Drop-off time clicked')}
                  />
                </div>

                {/* Driver Selection with Availability */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-user"></i> &nbsp; Select Driver <b>*</b>
                  </label>
                  <select 
                    value={driver} 
                    onChange={handleDriver} 
                    disabled={driverLoading}
                    style={{ 
                      fontSize: '1.5rem',
                      color: '#ababab',
                      fontFamily: '"Rubik", sans-serif',
                      border: '1px solid #ccd7e6',
                      borderRadius: '3px',
                      fontWeight: '400',
                      padding: '1.2rem 1.3rem',
                      outline: 'none',
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: '1'
                    }}
                    onFocus={() => console.log('Driver select focused')}
                    onClick={() => console.log('Driver select clicked')}
                  >
                    <option value="">
                      {driverLoading ? "Loading drivers..." :
                       !pickTime || !dropTime ? "Please select dates first" : 
                       availableDrivers.length === 0 ? "No drivers available for selected time" : 
                       "Select Available Driver"
                      }
                    </option>
                    {availableDrivers.length > 0 ? (
                      availableDrivers.map((driverData) => (
                        <option 
                          key={driverData._id} 
                          value={`${driverData.firstName} ${driverData.lastName}`}
                        >
                          {driverData.firstName} {driverData.lastName} - {driverData.companyName}
                          {driverData.status === 'active' ? ' ✅' : ' ⚠️'}
                        </option>
                      ))
                    ) : (
                      !driverLoading && (
                        <option disabled>
                          {!pickTime || !dropTime ? 
                            "Select pick-up and drop-off dates to see available drivers" :
                            "All drivers are busy during this time period"
                          }
                        </option>
                      )
                    )}
                  </select>
                  
                  {/* Show driver availability info */}
                  {pickTime && dropTime && (
                    <div style={{ marginTop: '10px' }}>
                      <small style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                        {driverLoading ? '🔄 Checking availability...' :
                         availableDrivers.length > 0 ? 
                          `✅ ${availableDrivers.length} driver(s) available for ${pickTime} to ${dropTime}` :
                          `❌ No drivers available for selected time period`
                        }
                      </small>
                      
                      {/* Show selected driver details and availability */}
                      {selectedDriverDetails && (
                        <div style={{ marginTop: '8px' }}>
                          <small style={{ color: '#666', fontSize: '12px', display: 'block' }}>
                            👨‍💼 {selectedDriverDetails.firstName} {selectedDriverDetails.lastName} • {selectedDriverDetails.companyName} • Age: {selectedDriverDetails.age}
                          </small>
                          {driverAvailabilityMessage && (
                            <small style={{ 
                              color: driverAvailabilityMessage.includes('✅') ? '#28a745' : 
                                    driverAvailabilityMessage.includes('❌') ? '#dc3545' : '#6c757d',
                              fontSize: '12px', 
                              display: 'block',
                              fontWeight: 'bold',
                              marginTop: '5px'
                            }}>
                              {driverAvailabilityMessage}
                            </small>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Search button */}
                <button onClick={openModal} type="submit">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </section>

      {/* Success Message */}
      {successMessage && (
        <div className="success-popup-overlay">
          <div className="success-popup-card-row">
            <button 
              className="success-popup-close-btn"
              onClick={() => setSuccessMessage(false)}
            >
              ✕
            </button>
            
            <div className="success-popup-icon-col">
              <div className="success-popup-check">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="#4ade80" stroke="#22c55e" strokeWidth="2"/>
                  <polyline points="30,52 45,67 70,35" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            
            <div className="success-popup-text-col">
              <h2 className="success-popup-title">🎉 Booking Confirmed!</h2>
              <div className="success-popup-text">
                {bookingId && (
                  <>
                    <strong>Your Booking ID:</strong><br />
                    <span className="booking-id-highlight">{bookingId}</span><br /><br />
                  </>
                )}
                ✅ <strong>Confirmation email sent!</strong><br />
                Check your email for booking details<br />
                We'll see you soon!
              </div>
            </div>
            
            <div className="success-popup-footer">
              <button 
                className="success-popup-action-btn"
                onClick={() => setSuccessMessage(false)}
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED: Complete Modal Content */}
      <div className={`booking-modal ${modal ? "active-modal" : ""}`}>
        {/* Title */}
        <div className="booking-modal__title">
          <h2>Complete Reservation</h2>
          <i onClick={() => setModal(false)} className="fa-solid fa-xmark"></i>
        </div>

       {/* Car Info */}
        <div className="booking-modal__car-info">
          <div className="dates-div">
            <div className="booking-modal__car-info__dates">
              <h5>Location & Date</h5>
              <span>
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <h6>Pick-Up Date & Time</h6>
                  <p>
                   {pickTime} {pickUpTime && `| ${pickUpTime}`}
                  </p>
                </div>
              </span>
            </div>

            <div className="booking-modal__car-info__dates">
              <span>
                <i className="fa-solid fa-location-dot"></i>
                <div>
                  <h6>Drop-Off Date & Time</h6>
                  <p>
                   {dropTime} {dropOffTime && `| ${dropOffTime}`}
                  </p>
                </div>
              </span>
            </div>

            <div className="booking-modal__car-info__dates">
              <span>
                <i className="fa-solid fa-calendar-days"></i>
                <div>
                  <h6>Pick-Up Location</h6>
                  <p>{pickUp}</p>
                </div>
              </span>
            </div>

            <div className="booking-modal__car-info__dates">
              <span>
                <i className="fa-solid fa-calendar-days"></i>
                <div>
                  <h6>Drop-Off Location</h6>
                  <p>{dropOff}</p>
                </div>
              </span>
            </div>

            {/* Driver info in modal */}
            <div className="booking-modal__car-info__dates">
              <span>
                <i className="fa-solid fa-user"></i>
                <div>
                  <h6>Selected Driver</h6>
                  <p>{driver || "No driver selected"}</p>
                </div>
              </span>
            </div>
          </div>

          {/* Enhanced vehicle display with details */}
          <div className="booking-modal__car-info__model">
            <h5>
              <span>Vehicle -</span> {carType}
            </h5>
            
            {selectedVehicle && (
              <div className="vehicle-details-modal">
                {/* Show vehicle image if available */}
                {selectedVehicle.vehicleImageUrl && (
                  <img 
                    src={`http://13.214.122.184:8000${selectedVehicle.vehicleImageUrl}`} 
                    alt={`${selectedVehicle.brandName} ${selectedVehicle.modelName}`}
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: '10px',
                      marginBottom: '15px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                
                {/* Vehicle specifications */}
                <div className="vehicle-specs" style={{
                  background: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  marginTop: '15px'
                }}>
                  <h2 style={{ marginBottom: '10px', color: '#ff4d30' }}>Vehicle Specifications</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
                    <span><strong>Vehicle Number:</strong> <br />{selectedVehicle.vehicleNumber}</span>
                    <span><strong>Year:</strong> <br />{selectedVehicle.year}</span>
                    <span><strong>Fuel Type:</strong><br /> {selectedVehicle.fuelType || 'N/A'}</span>
                    <span><strong>Brand:</strong><br/> {selectedVehicle.brandName}</span>
                    <span><strong>Seating Capacity:</strong><br /> {selectedVehicle.seatingCapacity ? `${selectedVehicle.seatingCapacity} seats` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Personal Info with Validation */}
        <div className="booking-modal__person-info">
          <h4>Personal Information</h4>
          <form className="info-form">
            <div className="info-form__2col">
              <span>
                <label>
                  First Name <b>*</b>
                </label>
                <input
                  name="name"
                  value={name}
                  onChange={handleName}
                  type="text"
                  placeholder="Enter your first name"
                  className={errors.name ? 'error-input' : ''}
                />
                {errors.name && <p className="error-modal active">{errors.name}</p>}
              </span>

              <span>
                <label>
                  Last Name <b>*</b>
                </label>
                <input
                  name="lastName"
                  value={lastName}
                  onChange={handleLastName}
                  type="text"
                  placeholder="Enter your last name"
                  className={errors.lastName ? 'error-input' : ''}
                />
                {errors.lastName && <p className="error-modal active">{errors.lastName}</p>}
              </span>

              <span>
                <label>
                  Phone Number <b>*</b>
                </label>
                <input
                  name="phone"
                  value={phone}
                  onChange={handlePhone}
                  type="tel"
                  placeholder="Enter your phone number (e.g., +94712345678)"
                  className={errors.phone ? 'error-input' : ''}
                />
                {errors.phone && <p className="error-modal active">{errors.phone}</p>}
              </span>

              <span>
                <label>
                  Designation <b>*</b>
                </label>
                <input
                  name="designation"
                  value={designation}
                  onChange={handledesignation}
                  type="text"
                  placeholder="Enter your designation (e.g., Manager, Executive)"
                  className={errors.designation ? 'error-input' : ''}
                />
                {errors.designation && <p className="error-modal active">{errors.designation}</p>}
              </span>
            </div>

            <div className="info-form__1col">
              <span>
                <label>
                  Email <b>*</b>
                </label>
                <input
                  name="email"
                  value={email}
                  onChange={handleEmail}
                  type="email"
                  placeholder="Enter your email address (e.g., john@example.com)"
                  className={errors.email ? 'error-input' : ''}
                />
                {errors.email && <p className="error-modal active">{errors.email}</p>}
              </span>
            </div>

            <div className="reserve-button">
              <button 
                onClick={confirmBooking}
                disabled={loading || Object.values(errors).some(error => error !== "")}
                className={loading ? 'loading-btn' : ''}
              >
                {loading ? "Processing..." : "Reserve Now"}
              </button>
            </div>
          </form>
        </div>

        {loading && (
          <div className="loading-popup">
            <div className="loading-popup__content">
              <p className="loading-message">Your reservation is processing</p>
              <div className="loading-ellipsis">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default BookCar;