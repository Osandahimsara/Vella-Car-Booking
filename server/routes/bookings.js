const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");
const path = require('path');
require("dotenv").config();


const Db = process.env.MONGO_URL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// POST /api/bookings - Create a new booking and send email
router.post("/", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("ToDoApp");
    const booking = new Booking(req.body);
    const result = await db.collection("bookings").insertOne(booking);


  // Admin email 
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Car Booking",
      html: ` 
    <img src="cid:carimage" alt="Car" width="150" />
   <table style="width: 100%; border-collapse: collapse;">
  <tr>
    <!-- Left: Booking Details -->
    <td style="vertical-align: top; width: 70%;">
      <div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h2 style="color: #2d3748;">Car Booking Reservation</h2>
        <hr>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px;"><strong>Name:</strong></td>
            <td style="padding: 8px;">${booking.name} ${booking.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Designation:</strong></td>
            <td style="padding: 8px;">${booking.designation}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Phone Number:</strong></td>
            <td style="padding: 8px;">${booking.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Pick-Up Date & Time:</strong></td>
            <td style="padding: 8px;">${booking.pickTime} ${booking.pickUpTime ? '| ' + booking.pickUpTime : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Drop-Off Date & Time:</strong></td>
            <td style="padding: 8px;">${booking.dropTime} ${booking.dropOffTime ? '| ' + booking.dropOffTime : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Pick-Up Location:</strong></td>
            <td style="padding: 8px;">${booking.pickUp}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Drop-Off Location:</strong></td>
            <td style="padding: 8px;">${booking.dropOff}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Car:</strong></td>
            <td style="padding: 8px;">${booking.carType}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Driver:</strong></td>
            <td style="padding: 8px;">${booking.driver}</td>
          </tr>
        </table>
        <hr>
        <p style="color: #555;">Thank you for your reservation, ${booking.name}!</p>
      </div>
    </td>
   
  </tr>
</table>
  `,
  attachments: [
  {
    filename: 'logo.png',
    path: path.join(__dirname, '../../src/images/logo/logo.png'),
    cid: 'carimage'
  }
]
};
 // User confirmation email
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: "Your Car Booking Confirmation",
      html: `
      <img src="cid:carimage" alt="Car" width="150" />
        <table style="width: 100%; border-collapse: collapse;">
  <tr>
    <!-- Left: Booking Details -->
    <td style="vertical-align: top; width: 70%;">
      <div style="font-family: Arial, sans-serif; max-width: 500px;">
        <h2 style="color: #2d3748;">Car Booking Reservation</h2>
        <hr>
        <table style="width: 100%; border-collapse: collapse;">
         
          <tr>
            <td style="padding: 8px;"><strong>Pick-Up Date & Time:</strong></td>
            <td style="padding: 8px;">${booking.pickTime} ${booking.pickUpTime ? '| ' + booking.pickUpTime : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Drop-Off Date & Time:</strong></td>
            <td style="padding: 8px;">${booking.dropTime} ${booking.dropOffTime ? '| ' + booking.dropOffTime : ''}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Pick-Up Location:</strong></td>
            <td style="padding: 8px;">${booking.pickUp}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Drop-Off Location:</strong></td>
            <td style="padding: 8px;">${booking.dropOff}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Car:</strong></td>
            <td style="padding: 8px;">${booking.carType}</td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>Driver:</strong></td>
            <td style="padding: 8px;">${booking.driver}</td>
          </tr>
        </table>
        <hr>
        <p style="color: #555;">Thank you for your reservation, ${booking.name}!</p>
      </div>
    </td>
  </tr>
</table>
      `,
       attachments: [
  {
    filename: 'logo.png',
    path: path.join(__dirname, '../../src/images/logo/logo.png'),
    cid: 'carimage'
  }
]
    };

      // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

   res.status(201).json({ bookingId: booking.bookingId });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ error: error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;