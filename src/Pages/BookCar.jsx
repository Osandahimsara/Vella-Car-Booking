import { useEffect, useState } from "react";
import axios from "axios";
import CarAudi from "../images/cars-big/audia1.jpg";
import CarGolf from "../images/cars-big/golf6.jpg";
import CarToyota from "../images/cars-big/toyotacamry.jpg";
import CarBmw from "../images/cars-big/bmw320.jpg";
import CarMercedes from "../images/cars-big/benz.jpg";
import CarPassat from "../images/cars-big/passatcc.jpg";
import "../CSS/book.css";
import Footer from "../components/Footer";
import citiesData from "../components/cities.json";

function BookCar() {
  const [modal, setModal] = useState(false); 
  const [successMessage, setSuccessMessage] = useState(false); 
  const [carType, setCarType] = useState("");
  const [pickUp, setPickUp] = useState("");
  const [dropOff, setDropOff] = useState("");
  const [pickTime, setPickTime] = useState("");
  const [pickUpTime, setPickUpTime] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [dropOffTime, setDropOffTime] = useState("");
  const [driver, setDriver] = useState("");
  const [carImg, setCarImg] = useState("");
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

  // validation error states
  const [errors, setErrors] = useState({
    name: "",
    lastName: "",
    phone: "",
    designation: "",
    email: ""
  });

  // Load cities from JSON file when component mounts
  useEffect(() => {
    loadCitiesFromJSON();
  }, []);

  // UPDATED: Fetch drivers based on selected dates/times
  useEffect(() => {
    // Only fetch drivers when we have pick-up and drop-off details
    if (pickTime && dropTime && pickUpTime && dropOffTime) {
      fetchAvailableDrivers();
    } else {
      // If no dates selected, fetch all drivers
      fetchAllDrivers();
    }
  }, [pickTime, dropTime, pickUpTime, dropOffTime]); // Add dependencies

 // Update the fetchAvailableDrivers function with more debugging
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
    
    const url = `http://localhost:8000/api/driver/available?${params}`;
    console.log('📞 Making request to:', url);
    
    const response = await axios.get(url);
    console.log('✅ Available drivers response:', response.data);
    
    setAvailableDrivers(response.data.availableDrivers || []);
    
    // Log detailed availability info
    if (response.data.conflictingBookings > 0) {
      console.log(`⚠️ Found ${response.data.conflictingBookings} conflicting bookings`);
      console.log('🚫 Booked drivers:', response.data.bookedDrivers);
    }
    
    console.log(`📊 Available: ${response.data.availableDrivers?.length || 0} / Total: ${response.data.totalDrivers}`);
    
    // Clear selected driver if they're no longer available
    if (driver && response.data.bookedDrivers && response.data.bookedDrivers.includes(driver)) {
      setDriver("");
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

  // UPDATED: Fetch all drivers (when no dates selected)
  const fetchAllDrivers = async () => {
    try {
      setDriverLoading(true);
      console.log('Fetching all drivers...');
      const response = await axios.get('http://localhost:8000/api/driver');
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

  // NEW: Manual refresh function
  const refreshDriverAvailability = () => {
    if (pickTime && dropTime && pickUpTime && dropOffTime) {
      fetchAvailableDrivers();
    } else {
      alert('Please select pickup and drop-off dates and times first');
    }
  };

  // Alternative approach - grouped by districts
  const loadCitiesFromJSON = () => {
    try {
      const cityOptions = [];
      
      // Loop through each district
      Object.keys(citiesData).forEach(district => {
        // Add district header (disabled option)
        cityOptions.push({
          value: '',
          label: `--- ${district} District ---`,
          disabled: true
        });
        
        // Add all cities from this district
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

  // UPDATED: confirmBooking function with driver conflict handling
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
    
    // Update error states
    setErrors(newErrors);
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      // Show error message
      const errorMsg = document.querySelector(".error-message");
      if (errorMsg) {
        errorMsg.style.display = "flex";
        errorMsg.textContent = "Please fix the errors below!";
      }
      
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`input[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    setLoading(true);

    const bookingData = {
      carType,
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
      const response = await axios.post("http://localhost:8000/api/bookings", bookingData);
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
      
      // Handle driver conflict (409 status)
      if (error.response?.status === 409) {
        alert(error.response.data.message);
        // Refresh driver list
        fetchAvailableDrivers();
        setDriver(""); // Clear selected driver
      } else {
        alert("Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle booking inputs
  const handleCar = (e) => {setCarType(e.target.value);setCarImg(e.target.value);};
  const handlePick = (e) => setPickUp(e.target.value);
  const handleDrop = (e) => setDropOff(e.target.value);
  const handlePickTime = (e) => setPickTime(e.target.value);
  const handleDropTime = (e) => setDropTime(e.target.value);
  const handleDriver = (e) => setDriver(e.target.value);

  // UPDATED: Open modal validation to include driver
  const openModal = (e) => {
    e.preventDefault();
    const errorMsg = document.querySelector(".error-message");
    if (!pickUp || !dropOff || !pickTime || !dropTime || !carType || !driver) {
      errorMsg.style.display = "flex";
      errorMsg.textContent = "All fields including driver selection are required!";
    } else {
      setModal(!modal);
      const modalDiv = document.querySelector(".booking-modal");
      modalDiv.scroll(0, 0);
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
    doneMsg.style.display = "none";
  };

  // Show car image based on selected car type
  let imgUrl;
  switch (carImg) {
    case "Audi A1 S-Line":
      imgUrl = CarAudi;
      break;
    case "VW Golf 6":
      imgUrl = CarGolf;
      break;
    case "Toyota Camry":
      imgUrl = CarToyota;
      break;
    case "BMW 320 ModernLine":
      imgUrl = CarBmw;
      break;
    case "Mercedes-Benz GLK":
      imgUrl = CarMercedes;
      break;
    case "VW Passat CC":
      imgUrl = CarPassat;
      break;
    default:
      imgUrl = "";
  }

  return (
    <>       
      <section id="booking-section" className="book-section">
        {/* Overlay */}
        <div
          onClick={openModal}
          className={`modal-overlay ${modal ? "active-modal" : ""}`}
        ></div>

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

              <form className="box-form">
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-car"></i> &nbsp; Select Your Car
                    Type <b>*</b>
                  </label>
                  <select value={carType} onChange={handleCar}>
                    <option>Select your car type</option>
                    <option value="Audi A1 S-Line">Audi A1 S-Line</option>
                    <option value="VW Golf 6">VW Golf 6</option>
                    <option value="Toyota Camry">Toyota Camry</option>
                    <option value="BMW 320 ModernLine">
                      BMW 320 ModernLine
                    </option>
                    <option value="Mercedes-Benz GLK">Mercedes-Benz GLK</option>
                    <option value="VW Passat CC">VW Passat CC</option>
                  </select>
                </div>

               {/* Pick-up Location with grouped cities */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> &nbsp; Pick-up <b>*</b>
                  </label>
                  <select value={pickUp} onChange={handlePick}>
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

                {/* Drop-off Location with grouped cities */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> &nbsp; Drop-off <b>*</b>
                  </label>
                  <select value={dropOff} onChange={handleDrop}>
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
                    onChange={(e) => setPickUpTime(e.target.value)}
                    required
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
                    onChange={(e) => setDropOffTime(e.target.value)}
                    required
                  />
                </div>

                               {/* UPDATED: Driver Selection - No manual refresh button */}
                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-user"></i> &nbsp; Select Driver <b>*</b>
                  </label>
                  <select value={driver} onChange={handleDriver} disabled={driverLoading}>
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
                  
                  {/* Show availability info */}
                  {pickTime && dropTime && (
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                      {driverLoading ? '🔄 Checking availability...' :
                       availableDrivers.length > 0 ? 
                        `✅ ${availableDrivers.length} driver(s) available for ${pickTime} to ${dropTime}` :
                        `❌ No drivers available for selected time period`
                      }
                    </small>
                  )}
                </div>

                {/* Updated Search button */}
                <button onClick={openModal} type="submit">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
        <Footer />
      </section>

      {/* Rest of your existing JSX remains the same... */}
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

      {/* Modal - Add driver info to the modal */}
      <div className={`booking-modal ${modal ? "active-modal" : ""}`}>
        {/* Title */}
        <div className="booking-modal__title">
          <h2>Complete Reservation</h2>
          <i onClick={openModal} className="fa-solid fa-xmark"></i>
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

            {/* Add driver info to modal */}
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
          <div className="booking-modal__car-info__model">
            <h5>
              <span>Car -</span> {carType}
            </h5>
            {imgUrl && <img src={imgUrl} alt="car_img" />}
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