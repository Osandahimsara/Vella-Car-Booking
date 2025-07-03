const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const bookingsRoute = require("./routes/bookings");
app.use("/api/bookings", bookingsRoute);


const usersRouter = require("./routes/users");
app.use("/api/users", usersRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});