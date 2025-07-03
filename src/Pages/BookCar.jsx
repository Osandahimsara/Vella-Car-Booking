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

function BookCar() {
  const [modal, setModal] = useState(false); // Modal state
  const [successMessage, setSuccessMessage] = useState(false); // Success message state
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




  // Confirm booking and send data to the backend
  const confirmBooking = async (e) => {e.preventDefault();
     setLoading(true); // Show loading

    if (!name || !lastName || !phone || !designation || !email) {
      const errorMsg = document.querySelector(".error-message");
      errorMsg.style.display = "flex";
      return;
    }

    const bookingData = {
  carType,
  pickUp,
  dropOff,
  pickTime,
  pickUpTime,   
  dropOffTime,  
  dropTime,
  driver, 
  name,
  lastName,
  phone,
  designation,
  email,
};

     try {
  const response = await axios.post("http://localhost:8000/api/bookings", bookingData);
  setBookingId(response.data.bookingId); 
  setModal(false);
  setSuccessMessage(true);
  setTimeout(() => setSuccessMessage(false), 8000);
} catch (error) {
  console.error("Error saving booking:", error);
} finally {
  setLoading(false);
}
};

  // Handle modal inputs
  const handleName = (e) => setName(e.target.value);
  const handleLastName = (e) => setLastName(e.target.value);
  const handlePhone = (e) => setPhone(e.target.value);
  const handledesignation = (e) => setdesignation(e.target.value);
  const handleEmail = (e) => setEmail(e.target.value);

  // Handle booking inputs
  const handleCar = (e) => {setCarType(e.target.value);setCarImg(e.target.value);};
  const handlePick = (e) => setPickUp(e.target.value);
  const handleDrop = (e) => setDropOff(e.target.value);
  const handlePickTime = (e) => setPickTime(e.target.value);
  const handleDropTime = (e) => setDropTime(e.target.value);
  const handleDriver = (e) => setDriver(e.target.value);
  // Open modal when all inputs are fulfilled
  const openModal = (e) => {
    e.preventDefault();
    const errorMsg = document.querySelector(".error-message");
    if (!pickUp || !dropOff || !pickTime || !dropTime || !carType) {
      errorMsg.style.display = "flex";
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
const [bookingId, setBookingId] = useState("");
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

                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> &nbsp; Pick-up{" "}
                    <b>*</b>
                  </label>
                  <select value={pickUp} onChange={handlePick}>
                    <option>Select pick up location</option>
                    <option>Ella</option>
                    <option>Colombo</option>
                    <option>Galle</option>
                    <option>Kandy</option>
                    <option>Halpe</option>
                  </select>
                </div>

                <div className="box-form__car-type">
                  <label>
                    <i className="fa-solid fa-location-dot"></i> &nbsp; Drop-off{" "}
                    <b>*</b>
                  </label>
                  <select value={dropOff} onChange={handleDrop}>
                    <option>Select drop off location</option>
                    <option>Ella</option>
                    <option>Colombo</option>
                    <option>Galle</option>
                    <option>Kandy</option>
                    <option>Halpe</option>
                  </select>
                </div>

                <div className="box-form__car-type">
                <label>
                <i className="fa-solid fa-location-dot"></i> &nbsp; Select Driver <b>*</b>
                </label>
               <select value={driver} onChange={handleDriver}>
                  <option>Select Driver</option>
                  <option>Michael Diaz</option>
                  <option>Briana Ross</option>
                  <option>Lauren Rivera</option>
                  <option>Martin Rizz</option>
                  <option>Caitlyn Hunt</option>
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
        <h2 className="success-popup-title">Booking Confirmed!</h2>
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

      {/* Modal */}
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
          </div>
          <div className="booking-modal__car-info__model">
            <h5>
              <span>Car -</span> {carType}
            </h5>
            {imgUrl && <img src={imgUrl} alt="car_img" />}
          </div>
        </div>

        {/* Personal Info */}
        <div className="booking-modal__person-info">
          <h4>Personal Information</h4>
          <form className="info-form">
            <div className="info-form__2col">
              <span>
                <label>
                  First Name <b>*</b>
                </label>
                <input
                  value={name}
                  onChange={handleName}
                  type="text"
                  placeholder="Enter your first name"
                ></input>
                <p className="error-modal">This field is required.</p>
              </span>

              <span>
                <label>
                  Last Name <b>*</b>
                </label>
                <input
                  value={lastName}
                  onChange={handleLastName}
                  type="text"
                  placeholder="Enter your last name"
                ></input>
                <p className="error-modal ">This field is required.</p>
              </span>

              <span>
                <label>
                  Phone Number <b>*</b>
                </label>
                <input
                  value={phone}
                  onChange={handlePhone}
                  type="tel"
                  placeholder="Enter your phone number"
                ></input>
                <p className="error-modal">This field is required.</p>
              </span>

              <span>
                <label>
                  Designation <b>*</b>
                </label>
                <input
                 value={designation}
                 onChange={handledesignation}
                 type="text"
                 placeholder="Enter your designation"
                />
                <p className="error-modal ">This field is required.</p>
              </span>
            </div>

            <div className="info-form__1col">
              <span>
                <label>
                  Email <b>*</b>
                </label>
                <input
                  value={email}
                  onChange={handleEmail}
                  type="email"
                  placeholder="Enter your email address"
                ></input>
                <p className="error-modal">This field is required.</p>
              </span>
            </div>

            <div className="reserve-button">
              <button onClick={confirmBooking}>Reserve Now</button>
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