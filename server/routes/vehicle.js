const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb"); 
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Vehicle = require("../models/Vehicle");
require("dotenv").config();

const Db = process.env.MONGO_URL;

// Configure multer for vehicle image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/vehicles');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
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

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  if (typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// POST /api/vehicles - Register a new vehicle
router.post("/", upload.single('vehicleImage'), async (req, res) => {
  console.log("=== VEHICLE REGISTRATION DEBUG ===");
  console.log("Request body:", req.body);
  console.log("Uploaded file:", req.file);
  console.log("================================");

  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Check if vehicle number already exists
    const existingVehicle = await db.collection("vehicles").findOne({
      vehicleNumber: req.body.vehicleNumber
    });

    if (existingVehicle) {
      if (req.file) {
        const filePath = path.join(__dirname, '../uploads/vehicles', req.file.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      return res.status(400).json({ 
        message: "Vehicle with this number already exists"
      });
    }

    // Prepare vehicle data
    const vehicleData = {
      brandName: req.body.brandName,
      modelName: req.body.modelName,
      vehicleNumber: req.body.vehicleNumber.toUpperCase(),
      year: parseInt(req.body.year),
      fuelType: req.body.fuelType,
      seatingCapacity: parseInt(req.body.seatingCapacity),
      vehicleImage: req.file ? req.file.filename : null,
      registeredAt: new Date(),
      status: "active"
    };

    // Save to database
    const result = await db.collection("vehicles").insertOne(vehicleData);
    
    console.log("Vehicle data saved successfully:", vehicleData);
    
    res.status(201).json({ 
      message: "Vehicle registered successfully",
      vehicleId: result.insertedId,
      vehicleData: {
        ...vehicleData,
        _id: result.insertedId,
        vehicleImageUrl: req.file ? `/uploads/vehicles/${req.file.filename}` : null
      }
    });
    
  } catch (error) {
    console.error("Error registering vehicle:", error);
    
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/vehicles', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ 
      message: "Error registering vehicle", 
      error: error.message 
    });
  } finally {
    await client.close();
  }
});

// GET /api/vehicles - Get all vehicles
router.get("/", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    const vehicles = await db.collection("vehicles").find({}).toArray();
    
    // Add image URLs to vehicles
    const vehiclesWithImageUrls = vehicles.map(vehicle => ({
      ...vehicle,
      vehicleImageUrl: vehicle.vehicleImage ? `/uploads/vehicles/${vehicle.vehicleImage}` : null
    }));
    
    res.status(200).json(vehiclesWithImageUrls);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Error fetching vehicles" });
  } finally {
    await client.close();
  }
});

// GET /api/vehicles/check-availability - Check vehicle availability
router.get("/check-availability", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const { vehicleId, pickUpDate, dropOffDate, pickUpTime, dropOffTime } = req.query;
    
    console.log("=== VEHICLE AVAILABILITY CHECK ===");
    console.log("Query params:", { vehicleId, pickUpDate, dropOffDate, pickUpTime, dropOffTime });
    
    if (!vehicleId || !pickUpDate || !dropOffDate) {
      return res.status(400).json({ 
        message: "Vehicle ID, pick-up and drop-off dates are required",
        available: false
      });
    }
    
    // Validate ObjectId format
    if (!isValidObjectId(vehicleId)) {
      console.log("Invalid vehicleId format:", vehicleId);
      return res.status(400).json({ 
        message: "Invalid vehicle ID format",
        available: false
      });
    }
    
    // Create date-time objects for comparison (IMPROVED)
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
    
    console.log("Checking vehicle availability between:", requestStart, "and", requestEnd);
    
    // Find the vehicle
    const vehicle = await db.collection("vehicles").findOne({
      _id: new ObjectId(vehicleId)
    });
    
    if (!vehicle) {
      return res.status(404).json({ 
        message: "Vehicle not found",
        available: false
      });
    }
    
    console.log("Found vehicle:", vehicle.vehicleNumber);
    
    // IMPROVED: Check for conflicting bookings with better overlap detection
    const conflictingBookings = await db.collection("bookings").find({
      "vehicleDetails.vehicleId": vehicleId,
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
    
    console.log(`Found ${conflictingBookings.length} conflicting bookings for vehicle ${vehicle.vehicleNumber}`);
    
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
      vehicleId: vehicleId,
      vehicleNumber: vehicle.vehicleNumber,
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
    console.error("Error checking vehicle availability:", error);
    res.status(500).json({ 
      message: "Error checking vehicle availability",
      error: error.message,
      available: false
    });
  } finally {
    await client.close();
  }
});

// GET /api/vehicles/:id - Get specific vehicle
router.get("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const vehicleId = req.params.id;
    
    // Validate ObjectId format
    if (!isValidObjectId(vehicleId)) {
      console.log("Invalid vehicleId format in GET /:id:", vehicleId);
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    
    const vehicle = await db.collection("vehicles").findOne({
      _id: new ObjectId(vehicleId)
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    const vehicleWithImageUrl = {
      ...vehicle,
      vehicleImageUrl: vehicle.vehicleImage ? `/uploads/vehicles/${vehicle.vehicleImage}` : null
    };
    
    res.status(200).json(vehicleWithImageUrl);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ message: "Error fetching vehicle" });
  } finally {
    await client.close();
  }
});

// PUT /api/vehicles/:id/status - Update vehicle status
router.put("/:id/status", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const vehicleId = req.params.id;
    const { status } = req.body;
    
    // Validate ObjectId format
    if (!isValidObjectId(vehicleId)) {
      console.log("Invalid vehicleId format in PUT /:id/status:", vehicleId);
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    
    if (!["active", "inactive", "maintenance"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const result = await db.collection("vehicles").updateOne(
      { _id: new ObjectId(vehicleId) },
      { $set: { status: status, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    res.json({ message: `Vehicle status updated to ${status}` });
  } catch (error) {
    console.error("Error updating vehicle status:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

// PUT /api/vehicles/:id - Update a vehicle
router.put("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const vehicleId = req.params.id;
    const updateData = req.body;
    
    console.log('Updating vehicle with ID:', vehicleId);
    console.log('Update data:', updateData);
    
    // Validate ObjectId format
    if (!isValidObjectId(vehicleId)) {
      console.log("Invalid vehicleId format in PUT /:id:", vehicleId);
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    
    // Remove any undefined or null values
    const cleanUpdateData = Object.keys(updateData).reduce((acc, key) => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        acc[key] = updateData[key];
      }
      return acc;
    }, {});
    
    // Add updatedAt timestamp
    cleanUpdateData.updatedAt = new Date();
    
    console.log('Clean update data:', cleanUpdateData);
    
    const result = await db.collection("vehicles").updateOne(
      { _id: new ObjectId(vehicleId) },
      { $set: cleanUpdateData }
    );
    
    console.log('Update result:', result);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    // Get the updated vehicle
    const updatedVehicle = await db.collection("vehicles").findOne({
      _id: new ObjectId(vehicleId)
    });
    
    // Add image URL if vehicle has an image
    if (updatedVehicle && updatedVehicle.vehicleImage) {
      updatedVehicle.vehicleImageUrl = `/uploads/vehicles/${updatedVehicle.vehicleImage}`;
    }
    
    res.json({ 
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const vehicleId = req.params.id;
    
    console.log('Deleting vehicle with ID:', vehicleId);
    
    // Validate ObjectId format
    if (!isValidObjectId(vehicleId)) {
      console.log("Invalid vehicleId format in DELETE /:id:", vehicleId);
      return res.status(400).json({ message: "Invalid vehicle ID format" });
    }
    
    // Find vehicle first to get image filename
    const vehicle = await db.collection("vehicles").findOne({
      _id: new ObjectId(vehicleId)
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    
    console.log('Found vehicle to delete:', vehicle.brandName, vehicle.modelName);
    
    // Delete vehicle from database
    const result = await db.collection("vehicles").deleteOne({
      _id: new ObjectId(vehicleId)
    });
    
    console.log('Delete result:', result);
    
    // Delete image file if exists
    if (vehicle.vehicleImage) {
      const imagePath = path.join(__dirname, '../uploads/vehicles', vehicle.vehicleImage);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting vehicle image:', err);
        else console.log('Vehicle image deleted successfully');
      });
    }
    
    res.json({ 
      message: "Vehicle deleted successfully",
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;