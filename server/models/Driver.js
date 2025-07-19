class Driver{
  constructor({
    brandName,
    firstName,
    lastName,
    contact,
    age,
    NIC,
    DLicenceNo,
    Address
  }) {
    this.brandName = brandName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.contact = contact;
    this.age = age;
    this.NIC = NIC;
    this.DLicenceNo = DLicenceNo;
    this.Address = Address;
  }
}

module.exports = Driver;