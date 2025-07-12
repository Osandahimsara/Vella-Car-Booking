const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
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
// Add this POST route after your existing routes but before module.exports:

// POST /api/driver - Create a new driver
router.post("/", upload.single('driverImage'), async (req, res) => {
  console.log("=== DRIVER REGISTRATION DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);
  console.log("================================");

  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Check if driver with same name already exists
    const existingDriver = await db.collection("drivers").findOne({
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });

    if (existingDriver) {
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/drivers', req.file.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.status(400).json({ 
        message: "Driver with this name already exists"
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
      status: "active" // Set default status as active
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

// DELETE /api/driver/:id - Delete a driver
router.delete("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const driverId = req.params.id;
     // Find driver first to get image filename
    const driver = await db.collection("drivers").findOne({
      _id: new ObjectId(driverId)
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Delete driver from database
    const result = await db.collection("drivers").deleteOne({
      _id: new ObjectId(driverId)
    });
    
    // Delete image file if exists
    if (driver.driverImage) {
      const imagePath = path.join(__dirname, '../uploads/drivers', driver.driverImage);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting driver image:', err);
      });
    }
    
    res.json({ 
      message: "Driver deleted successfully",
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error deleting driver:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

// PUT /api/driver/:id - Update a driver
router.put("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const driverId = req.params.id;
    const updateData = req.body;
    
    console.log('Updating driver with ID:', driverId);
    console.log('Update data:', updateData);
    
    // Remove any undefined or null values
    const cleanUpdateData = Object.keys(updateData).reduce((acc, key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        acc[key] = updateData[key];
      }
      return acc;
    }, {});
    
    console.log('Clean update data:', cleanUpdateData);
    
    const result = await db.collection("drivers").updateOne(
      { _id: new ObjectId(driverId) },
      { $set: cleanUpdateData }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Driver not found" });
    }
    
    // Get the updated driver
    const updatedDriver = await db.collection("drivers").findOne({
      _id: new ObjectId(driverId)
    });
    
    // Add image URL if driver has an image
    if (updatedDriver && updatedDriver.driverImage) {
      updatedDriver.driverImageUrl = `/uploads/drivers/${updatedDriver.driverImage}`;
    }
    
    res.json({ 
      message: "Driver updated successfully",
      driver: updatedDriver,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating driver:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;
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

// GET /api/driver/available - Get available drivers (THIRD)
router.get("/available", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const { pickUpDate, dropOffDate, pickUpTime, dropOffTime } = req.query;
    
    console.log("=== AVAILABLE DRIVERS REQUEST ===");
    console.log("Query params:", { pickUpDate, dropOffDate, pickUpTime, dropOffTime });
    
    if (!pickUpDate || !dropOffDate) {
      // Return all active drivers if no dates provided
      console.log("No dates provided, returning all active drivers");
      const allDrivers = await db.collection("drivers").find({ 
        status: "active" 
      }).toArray();
      
      return res.status(200).json({
        availableDrivers: allDrivers,
        totalDrivers: allDrivers.length,
        conflictingBookings: 0,
        bookedDrivers: []
      });
    }
    
    // Create date-time objects for comparison
    const bookingStart = new Date(`${pickUpDate}T${pickUpTime || '00:00'}`);
    const bookingEnd = new Date(`${dropOffDate}T${dropOffTime || '23:59'}`);
    
    console.log("Checking availability between:", bookingStart, "and", bookingEnd);
    
    // Find all conflicting bookings
    const conflictingBookings = await db.collection("bookings").find({
      status: { $ne: "cancelled" },
      $or: [
        {
          $and: [
            { pickTime: { $lte: bookingStart } },
            { dropTime: { $gt: bookingStart } }
          ]
        },
        {
          $and: [
            { pickTime: { $lt: bookingEnd } },
            { dropTime: { $gte: bookingEnd } }
          ]
        },
        {
          $and: [
            { pickTime: { $gte: bookingStart } },
            { pickTime: { $lt: bookingEnd } }
          ]
        }
      ]
    }).toArray();
    
    console.log(`Found ${conflictingBookings.length} conflicting bookings`);
    
    // Get list of booked drivers
    const bookedDrivers = conflictingBookings.map(booking => booking.driver);
    console.log("Booked drivers:", bookedDrivers);
    
    // Get all active drivers
    const allDrivers = await db.collection("drivers").find({ 
      status: "active" 
    }).toArray();
    
    console.log(`Total active drivers: ${allDrivers.length}`);
    
    // Filter out booked drivers
    const availableDrivers = allDrivers.filter(driver => {
      const driverName = `${driver.firstName} ${driver.lastName}`;
      return !bookedDrivers.includes(driverName);
    });
    
    console.log(`Available drivers: ${availableDrivers.length}`);
    console.log("Available driver names:", availableDrivers.map(d => `${d.firstName} ${d.lastName}`));
    
    res.status(200).json({
      availableDrivers: availableDrivers,
      totalDrivers: allDrivers.length,
      conflictingBookings: conflictingBookings.length,
      bookedDrivers: bookedDrivers,
      requestedPeriod: { bookingStart, bookingEnd }
    });
    
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ 
      message: "Error fetching available drivers",
      error: error.message 
    });
  } finally {
    await client.close();
  }
});

// GET /api/driver/check-individual - Check individual driver (FOURTH - CRITICAL POSITION!)
router.get("/check-individual", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const { driverName, pickUpDate, dropOffDate, pickUpTime, dropOffTime } = req.query;
    
    console.log("=== INDIVIDUAL DRIVER AVAILABILITY CHECK ===");
    console.log("Query params:", { driverName, pickUpDate, dropOffDate, pickUpTime, dropOffTime });
    
    if (!driverName || !pickUpDate || !dropOffDate) {
      return res.status(400).json({ 
        message: "Driver name, pick-up and drop-off dates are required",
        available: false
      });
    }
    
    // Create date-time objects for comparison
    const requestStart = new Date(`${pickUpDate}T${pickUpTime || '00:00'}:00`);
    const requestEnd = new Date(`${dropOffDate}T${dropOffTime || '23:59'}:59`);
    
    // Validate dates
    if (isNaN(requestStart.getTime()) || isNaN(requestEnd.getTime())) {
      console.log("Invalid date format:", { requestStart, requestEnd });
      return res.status(400).json({ 
        message: "Invalid date format",
        available: false
      });
    }
    
    console.log("Checking driver availability between:", requestStart, "and", requestEnd);
    
    // IMPROVED: Check for conflicting bookings with better overlap detection
    const conflictingBookings = await db.collection("bookings").find({
      driver: driverName,
      status: { $ne: "cancelled" },
      $or: [
        // Case 1: Existing booking starts before request and ends after request starts
        {
          $and: [
            { 
              $expr: {
                $lt: [
                  { $dateFromString: { dateString: { $concat: ["$pickTime", "T", { $ifNull: ["$pickUpTime", "00:00"] }, ":00"] } } },
                  requestStart
                ]
              }
            },
            {
              $expr: {
                $gt: [
                  { $dateFromString: { dateString: { $concat: ["$dropTime", "T", { $ifNull: ["$dropOffTime", "23:59"] }, ":59"] } } },
                  requestStart
                ]
              }
            }
          ]
        },
        // Case 2: Existing booking starts before request ends and ends after request ends
        {
          $and: [
            {
              $expr: {
                $lt: [
                  { $dateFromString: { dateString: { $concat: ["$pickTime", "T", { $ifNull: ["$pickUpTime", "00:00"] }, ":00"] } } },
                  requestEnd
                ]
              }
            },
            {
              $expr: {
                $gte: [
                  { $dateFromString: { dateString: { $concat: ["$dropTime", "T", { $ifNull: ["$dropOffTime", "23:59"] }, ":59"] } } },
                  requestEnd
                ]
              }
            }
          ]
        },
        // Case 3: Existing booking is completely within request period
        {
          $and: [
            {
              $expr: {
                $gte: [
                  { $dateFromString: { dateString: { $concat: ["$pickTime", "T", { $ifNull: ["$pickUpTime", "00:00"] }, ":00"] } } },
                  requestStart
                ]
              }
            },
            {
              $expr: {
                $lte: [
                  { $dateFromString: { dateString: { $concat: ["$dropTime", "T", { $ifNull: ["$dropOffTime", "23:59"] }, ":59"] } } },
                  requestEnd
                ]
              }
            }
          ]
        }
      ]
    }).toArray();
    
    console.log(`Found ${conflictingBookings.length} conflicting bookings for driver ${driverName}`);
    
    if (conflictingBookings.length > 0) {
      console.log("Conflicting bookings details:", conflictingBookings.map(b => ({
        bookingId: b.bookingId,
        pickTime: b.pickTime,
        pickUpTime: b.pickUpTime,
        dropTime: b.dropTime,
        dropOffTime: b.dropOffTime
      })));
    }
    
    const available = conflictingBookings.length === 0;
    
    res.status(200).json({
      available: available,
      driverName: driverName,
      conflictingBookings: conflictingBookings.length,
      requestedPeriod: { 
        start: requestStart.toISOString(), 
        end: requestEnd.toISOString() 
      },
      conflicts: available ? [] : conflictingBookings.map(booking => ({
        bookingId: booking.bookingId,
        pickTime: booking.pickTime,
        pickUpTime: booking.pickUpTime,
        dropTime: booking.dropTime,
        dropOffTime: booking.dropOffTime,
        customer: `${booking.name} ${booking.lastName}`
      }))
    });
    
  } catch (error) {
    console.error("Error checking driver availability:", error);
    res.status(500).json({ 
      message: "Error checking driver availability",
      error: error.message,
      available: false
    });
  } finally {
    await client.close();
  }
});

// =================== GENERAL ROUTES AFTER SPECIFIC ONES ===================

// GET /api/driver - Get all drivers (PUT AFTER SPECIFIC ROUTES)
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

// PATCH /api/driver/:id/status - Update driver status
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
      { _id: new ObjectId(req.params.id) },
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

// POST /api/driver - Create a new driver (EXISTING CODE)
router.post("/", upload.single('driverImage'), async (req, res) => {
  // ... your existing POST code ...
});

// DELETE /api/driver/:id - Delete a driver (EXISTING CODE) 
router.delete("/:id", async (req, res) => {
  // ... your existing DELETE code ...
});

module.exports = router;