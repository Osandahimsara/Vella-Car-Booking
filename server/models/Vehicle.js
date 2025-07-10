class Vehicle {
  constructor({
    brandName,
    modelName,
    vehicleNumber,
    year,
    fuelType,
    vehicleImage,
  }) {
    this.brandName = brandName;
    this.modelName = modelName;
    this.vehicleNumber = vehicleNumber;
    this.year = year;
    this.fuelType = fuelType;
    this.vehicleImage = vehicleImage;
    this.status = "active";
    this.registeredAt = new Date();
  }
}

module.exports = Vehicle;