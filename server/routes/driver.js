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