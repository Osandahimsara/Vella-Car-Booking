class Booking {
  constructor({
    carType,
    pickUp,
    dropOff,
    pickTime,
    pickUpTime,    // <-- add this
    dropOffTime,   // <-- add this
    dropTime,
    driver,
    name,
    lastName,
    phone,
    designation,
    email,
  }) {
    this.carType = carType;
    this.pickUp = pickUp;
    this.dropOff = dropOff;
    this.pickTime = pickTime;
    this.pickUpTime = pickUpTime;      // <-- add this
    this.dropOffTime = dropOffTime;    // <-- add this
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