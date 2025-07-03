class Booking {
  constructor({
    bookingId, 
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
    
  }) {
    this.bookingId = bookingId; 
    this.carType = carType;
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
  }
}

module.exports = Booking;