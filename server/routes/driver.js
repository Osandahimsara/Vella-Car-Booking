const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Db = process.env.MONGO_URL;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/drivers');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Create unique filename: timestamp_originalname
    const uniqueName = Date.now() + '_' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Please upload only image files'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/drivers');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// =================== EXISTING DEBUG ROUTES ===================
// DEBUG ROUTE - Add this temporarily to check driver data
router.get("/debug", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    const drivers = await db.collection("drivers").find({}).toArray();
    
    console.log("=== ALL DRIVERS DEBUG ===");
    drivers.forEach((driver, index) => {
      console.log(`Driver ${index + 1}:`, {
        name: `${driver.firstName} ${driver.lastName}`,
        status: driver.status,
        hasStatus: driver.hasOwnProperty('status')
      });
    });
    console.log("========================");
    
    res.json({
      totalDrivers: drivers.length,
      driversWithStatus: drivers.filter(d => d.status === 'active').length,
      allDrivers: drivers.map(d => ({
        name: `${d.firstName} ${d.lastName}`,
        status: d.status || 'NO STATUS',
        hasStatusField: d.hasOwnProperty('status')
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

// FIX EXISTING DRIVERS ROUTE - Add this to update drivers without status
router.patch("/fix-status", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Update all drivers without status to be active
    const result = await db.collection("drivers").updateMany(
      { status: { $exists: false } }, // Find drivers without status field
      { $set: { status: "active" } }   // Set them as active
    );
    
    console.log(`Updated ${result.modifiedCount} drivers to active status`);
    
    res.json({ 
      message: `Updated ${result.modifiedCount} drivers to active status`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

// =================== ADD THESE NEW ROUTES HERE ===================
// GET /api/driver/available - Get only available drivers for a specific time slot
router.get("/available", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const { pickUpDate, dropOffDate, pickUpTime, dropOffTime } = req.query;
    
    if (!pickUpDate || !dropOffDate) {
      return res.status(400).json({ message: "Pick-up and drop-off dates are required" });
    }
    
    // Create date-time objects for comparison
    const bookingStart = new Date(`${pickUpDate}T${pickUpTime || '00:00'}`);
    const bookingEnd = new Date(`${dropOffDate}T${dropOffTime || '23:59'}`);
    
    console.log("Checking availability for:", { bookingStart, bookingEnd });
    
    // Get all drivers
    const allDrivers = await db.collection("drivers").find({ status: "active" }).toArray();
    
    // Get all bookings that might conflict with the requested time
    const conflictingBookings = await db.collection("bookings").find({
      $or: [
        {
          // Booking starts during our requested period
          pickTime: { $gte: bookingStart, $lt: bookingEnd }
        },
        {
          // Booking ends during our requested period
          dropTime: { $gt: bookingStart, $lte: bookingEnd }
        },
        {
          // Booking completely encompasses our requested period
          pickTime: { $lte: bookingStart },
          dropTime: { $gte: bookingEnd }
        }
      ]
    }).toArray();
    
    console.log("Conflicting bookings found:", conflictingBookings.length);
    
    // Get list of driver names that are already booked
    const bookedDriverNames = conflictingBookings.map(booking => booking.driver);
    
    console.log("Booked drivers:", bookedDriverNames);
    
    // Filter out booked drivers
    const availableDrivers = allDrivers.filter(driver => {
      const driverFullName = `${driver.firstName} ${driver.lastName}`;
      return !bookedDriverNames.includes(driverFullName);
    });
    
    console.log("Available drivers:", availableDrivers.length);
    
    // Add image URLs
    const driversWithImageUrls = availableDrivers.map(driver => ({
      ...driver,
      driverImageUrl: driver.driverImage ? `/uploads/drivers/${driver.driverImage}` : null
    }));
    
    res.status(200).json({
      availableDrivers: driversWithImageUrls,
      totalDrivers: allDrivers.length,
      bookedDrivers: bookedDriverNames,
      requestedPeriod: { bookingStart, bookingEnd }
    });
    
  } catch (error) {
    console.error("Error checking driver availability:", error);
    res.status(500).json({ message: "Error checking driver availability" });
  } finally {
    await client.close();
  }
});

// Update driver status route
router.patch("/:id/status", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const { status } = req.body; // 'active', 'inactive', 'busy'
    
    if (!['active', 'inactive', 'busy'].includes(status)) {
      return res.status(400).json({ message: "Status must be 'active', 'inactive', or 'busy'" });
    }
    
    const result = await db.collection("drivers").updateOne(
      { _id: new require("mongodb").ObjectId(req.params.id) },
      { $set: { status: status, lastUpdated: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    res.json({ message: `Driver status updated to ${status}` });
  } catch (error) {
    console.error("Error updating driver status:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});
// ================================================================

// POST /api/driver - Create a new driver with image
router.post("/", upload.single('driverImage'), async (req, res) => {
  console.log("=== DRIVER REGISTRATION DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);
  console.log("================================");

  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Check if NIC already exists
    const existingDriver = await db.collection("drivers").findOne({
      NIC: req.body.NIC
    });

    if (existingDriver) {
      // Delete uploaded file if driver already exists
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/drivers', req.file.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.status(400).json({ 
        message: "Driver with this NIC already exists"
      });
    }

    // Prepare driver data
    const driverData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      contact: req.body.contact,
      age: parseInt(req.body.age),
      NIC: req.body.NIC,
      DLicenceNo: req.body.DLicenceNo,
      Address: req.body.Address,
      companyName: req.body.companyName,
      driverImage: req.file ? req.file.filename : null,
      registeredAt: new Date(),
      status: "active"
    };

    // Save to database
    const result = await db.collection("drivers").insertOne(driverData);
    
    console.log("Driver data saved successfully:", driverData);
    res.status(201).json({ 
      message: "Driver registered successfully",
      driverId: result.insertedId,
      driverData: {
        ...driverData,
        driverImageUrl: req.file ? `/uploads/drivers/${req.file.filename}` : null
      }
    });
    
  } catch (error) {
    console.error("Error registering driver:", error);
    
    // Delete uploaded file if database save fails
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/drivers', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ 
      message: "Error registering driver", 
      error: error.message 
    });
  } finally {
    await client.close();
  }
});

// GET /api/driver - Get all drivers
router.get("/", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    const drivers = await db.collection("drivers").find({}).toArray();
    
    // Add full image URL to each driver
    const driversWithImageUrls = drivers.map(driver => ({
      ...driver,
      driverImageUrl: driver.driverImage ? `/uploads/drivers/${driver.driverImage}` : null
    }));
    
    res.status(200).json(driversWithImageUrls);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Error fetching drivers" });
  } finally {
    await client.close();
  }
});

// DELETE /api/driver/:id - Delete a driver
router.delete("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // First get the driver to find the image file
    const driver = await db.collection("drivers").findOne({ _id: new require("mongodb").ObjectId(req.params.id) });
    
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    // Delete the driver from database
    await db.collection("drivers").deleteOne({ _id: new require("mongodb").ObjectId(req.params.id) });
    
    // Delete the image file if it exists
    if (driver.driverImage) {
      const filePath = path.join(__dirname, '../uploads/drivers', driver.driverImage);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
    }
    
    res.status(200).json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ message: "Error deleting driver" });
  } finally {
    await client.close();
  }
});

module.exports = router;