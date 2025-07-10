const express = require("express");
const cors = require("cors");
const path = require("path");
const multer = require("multer"); 
require("dotenv").config();

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const bookingsRoute = require("./routes/bookings");
app.use("/api/bookings", bookingsRoute);

const usersRouter = require("./routes/users");
app.use("/api/users", usersRouter);

const driverRouter = require("./routes/driver");
app.use("/api/driver", driverRouter);

// Vehicle routes
const vehicleRouter = require("./routes/vehicle");
app.use("/api/vehicles", vehicleRouter);

//  route to verify server is working
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ message: error.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});