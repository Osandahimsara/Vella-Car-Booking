const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");
require("dotenv").config();

const Db = process.env.MONGO_URL;

// Email transporter setup - FIXED: createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// POST /api/users/login - Admin login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const user = await db.collection("users").findOne({ username });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    res.status(200).json({
      username: user.username,
      role: user.role
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// POST /api/users/request - Request password reset
router.post("/request", async (req, res) => {
  const { username } = req.body;
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const user = await db.collection("users").findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User Correct" });
    
  } catch (error) {
    console.error("Request error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// POST /api/users/otp - Send OTP via email
router.post("/otp", async (req, res) => {
  const { username, otp } = req.body;
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const user = await db.collection("users").findOne({ username });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Store OTP temporarily (expires in 5 minutes)
    otpStore.set(username, {
      otp,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email || process.env.EMAIL_USER, // Fallback to admin email
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #2d3748;">Password Reset Request</h2>
          <p>Hello ${username},</p>
          <p>Your OTP for password reset is:</p>
          <div style="background: #f7f7f7; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666;">This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
    
  } catch (error) {
    console.error("OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  } finally {
    await client.close();
  }
});

// POST /api/users/verify - Verify OTP
router.post("/verify", async (req, res) => {
  const { username, otp } = req.body;
  
  try {
    const storedOTP = otpStore.get(username);
    
    if (!storedOTP) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }
    
    if (Date.now() > storedOTP.expires) {
      otpStore.delete(username);
      return res.status(400).json({ message: "OTP expired" });
    }
    
    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    res.status(200).json({ message: "OTP verified successfully" });
    
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/reset-password - Reset password
router.post("/reset-password", async (req, res) => {
  const { username, newPassword } = req.body;
  const client = new MongoClient(Db);
  
  try {
    // Check if OTP was verified
    const storedOTP = otpStore.get(username);
    if (!storedOTP) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }
    
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Update password
    const result = await db.collection("users").updateOne(
      { username },
      { $set: { password: newPassword } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Clear OTP from store
    otpStore.delete(username);
    
    res.status(200).json({ message: "Password reset successfully" });
    
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// GET /api/users - Get all users
router.get("/", async (req, res) => {
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const users = await db.collection("users").find({}).toArray();
    
    // Remove password from response for security
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.status(200).json(safeUsers);
    
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// POST /api/users - Create new user
router.post("/", async (req, res) => {
  const { name, email, password, role = 'user', phone, status = 'active' } = req.body;
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ 
      $or: [{ email }, { username: email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Create new user
    const newUser = {
      name,
      email,
      username: email, // Use email as username
      password,
      role,
      phone,
      status,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection("users").insertOne(newUser);
    
    // Return user without password
    const { password: _, ...safeUser } = newUser;
    safeUser._id = result.insertedId;
    
    res.status(201).json(safeUser);
    
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// PUT /api/users/:id - Update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, phone, status } = req.body;
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Build update object
    const updateData = {
      name,
      email,
      username: email, // Keep username in sync with email
      role,
      phone,
      status,
      updatedAt: new Date()
    };
    
    // Only update password if provided
    if (password) {
      updateData.password = password;
    }
    
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User updated successfully" });
    
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const client = new MongoClient(Db);
  
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const result = await db.collection("users").deleteOne(
      { _id: new ObjectId(id) }
    );
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ message: "User deleted successfully" });
    
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
});

module.exports = router;