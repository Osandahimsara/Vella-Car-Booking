const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");
const path = require('path');
require ("dotenv").config();


const Db = process.env.MONGO_URL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateBookingId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  
  let result = "";
  for (let i = 0; i < 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 5; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}

// POST /api/bookings - Create a new booking and send email
router.post("/", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    // Generate bookingId and add to booking data
    const bookingId = generateBookingId();
    const bookingData = { ...req.body, bookingId };
    const booking = new Booking(bookingData);
    await db.collection("bookings").insertOne(booking);


 // Admin email 
const adminMailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: "🚨 New Car Booking Request - " + bookingId,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:carimage" alt="Car" width="150" />
        <h1 style="color: #dc3545; margin-top: 20px;">New Booking Alert! 🚨</h1>
      </div>
      
      <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #ffc107;">
        <h2 style="color: #856404; text-align: center; margin: 0;">New Booking Request</h2>
        <p style="text-align: center; font-size: 16px; color: #856404; margin: 10px 0 0 0;">
          A new car booking has been submitted and requires your attention.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <tr style="background: #dc3545; color: white;">
          <td colspan="2" style="padding: 15px; text-align: center; font-size: 18px; font-weight: bold;">
            📋 Booking Details
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Booking ID:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; color: #dc3545; font-weight: bold;">${booking.bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Customer Name:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.name} ${booking.lastName}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Email:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;"><a href="mailto:${booking.email}" style="color: #007bff; text-decoration: none;">${booking.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Phone:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;"><a href="tel:${booking.phone}" style="color: #007bff; text-decoration: none;">${booking.phone}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Designation:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.designation}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Car Type:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${booking.carType}</span></td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Pick-Up Location:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">📍 ${booking.pickUp}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Drop-Off Location:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">📍 ${booking.dropOff}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Pick-Up Date & Time:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">🗓️ ${booking.pickTime} ${booking.pickUpTime ? '⏰ ' + booking.pickUpTime : ''}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Drop-Off Date & Time:</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">🗓️ ${booking.dropTime} ${booking.dropOffTime ? '⏰ ' + booking.dropOffTime : ''}</td>
        </tr>
     <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Driver Required:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.driver}</td>
            </tr>
      </table>

      <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 5px solid #17a2b8;">
        <h3 style="color: #0c5460; margin: 0 0 10px 0;">⚡ Action Required</h3>
        <p style="margin: 0; color: #0c5460;">
          Please review this booking request and contact the customer to confirm availability and arrange payment.
        </p>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
        <a href="mailto:${booking.email}?subject=Car Booking Confirmation - ${booking.bookingId}&body=Dear ${booking.name},%0D%0A%0D%0AThank you for your booking request (ID: ${booking.bookingId}).%0D%0A%0D%0ABest regards" 
           style="background: #28a745; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          📧 Email Customer
        </a>
        <a href="tel:${booking.phone}" 
           style="background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
          📞 Call Customer
        </a>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          <strong>Booking received at:</strong> ${new Date().toLocaleString()}<br>
          <strong>System:</strong> Car Booking Management System
        </p>
      </div>
    </div>
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
      to: booking.email, // Send to user's email
      subject: "🚗 Your Car Booking Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:carimage" alt="Car" width="150" />
            <h1 style="color: #ff4d30; margin-top: 20px;">Booking Confirmed! 🎉</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #2d3748; text-align: center;">Hi ${booking.name}!</h2>
            <p style="text-align: center; font-size: 16px; color: #666;">
              Your car booking has been confirmed. Here are your booking details:
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <tr style="background: #ff4d30; color: white;">
              <td colspan="2" style="padding: 15px; text-align: center; font-size: 18px; font-weight: bold;">
                Booking Details
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Booking ID:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #ff4d30; font-weight: bold;">${booking.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Car Type:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.carType}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Pick-Up Location:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.pickUp}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Drop-Off Location:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.dropOff}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Pick-Up Date & Time:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.pickTime} ${booking.pickUpTime || ''}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Drop-Off Date & Time:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.dropTime} ${booking.dropOffTime || ''}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Driver Required:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.driver}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; background: #f8f9fa;">Contact Phone:</td>
              <td style="padding: 12px;">${booking.phone}</td>
            </tr>
          </table>

          <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
            <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ What's Next?</h3>
            <p style="margin: 0; color: #666;">
              We'll contact you shortly to confirm the final details. 
              Keep your booking ID handy for reference.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin: 0; color: #666;">
              Thank you for choosing our service! 🚗<br>
              <strong>We'll see you soon!</strong>
            </p>
          </div>
        </div>
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