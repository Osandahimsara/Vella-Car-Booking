class Booking {
  constructor({
    bookingId, 
    carType,
    vehicleDetails, // NEW: Add vehicle details
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
  }) {
    this.bookingId = bookingId; 
    this.carType = carType;
    this.vehicleDetails = vehicleDetails; // NEW: Store complete vehicle info
    this.pickUp = pickUp;
    this.dropOff = dropOff;
    this.pickTime = pickTime;
    this.pickUpTime = pickUpTime;
    this.dropOffTime = dropOffTime;
    this.dropTime = dropTime;
    this.driver = driver;
    this.name = name;
    this.lastName = lastName;
    this.phone = phone;
    this.designation = designation;
    this.email = email;
    this.status = "confirmed";
    this.createdAt = new Date();
  }
}

module.exports = Booking;