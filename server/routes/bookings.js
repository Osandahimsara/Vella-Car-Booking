const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");
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
  subject: " New Car Booking Request - " + bookingId,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:carimage" alt="Car" width="150" />
        <h1 style="color: #dc3545; margin-top: 20px;">New Booking Alert! </h1>
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
          Please review this booking request and contact the customer to confirm availability.
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
 // User booking pending email
     const userMailOptions = {
  from: `"Vella Car Booking " <${process.env.EMAIL_USER}>`,
  to: booking.email,
      subject: "Booking Request Received - Pending Approval",
      replyTo: process.env.EMAIL_USER,
  headers: {
    'X-Priority': '1',
    'X-MSMail-Priority': 'Normal',
    'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`
  },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:carimage" alt="Car" width="150" />
            <h1 style="color: #ff8c00; margin-top: 20px;">Booking Request Received!</h1>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #ffc107;">
            <h2 style="color: #856404; text-align: center;">Hi ${booking.name}!</h2>
            <p style="text-align: center; font-size: 16px; color: #856404;">
              Thank you for your booking request! We've received your submission and it's currently being reviewed.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <tr style="background: #ff8c00; color: white;">
              <td colspan="2" style="padding: 15px; text-align: center; font-size: 18px; font-weight: bold;">
                 Booking Request Details
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Booking ID:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #ff8c00; font-weight: bold;">${booking.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Status:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;"><span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-weight: bold;">⏳ PENDING APPROVAL</span></td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Car Type:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.carType}</td>
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
            <tr>
              <td style="padding: 12px; font-weight: bold; background: #f8f9fa;">Contact Phone:</td>
              <td style="padding: 12px;">${booking.phone}</td>
            </tr>
          </table>

          <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 5px solid #17a2b8;">
            <h3 style="color: #0c5460; margin: 0 0 10px 0;">⏱️ What Happens Next?</h3>
            <p style="margin: 0; color: #0c5460;">
              Our team is reviewing your booking request to check vehicle availability and driver assignment. 
              You'll receive an email confirmation within <strong>24 hours</strong> with the approval status.
            </p>
          </div>

          <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 5px solid #dc3545;">
            <p style="margin: 0; color: #721c24; font-size: 14px;">
              <strong>📞 Need to modify your request?</strong><br>
              Please contact us immediately at <a href="tel:${process.env.CONTACT_PHONE || '0112 050 050'}" style="color: #721c24; text-decoration: none;">${process.env.CONTACT_PHONE || ' 0112 050 050'}</a> 
              with your Booking ID: <strong>${booking.bookingId}</strong>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin: 0; color: #666;">
              Thank you for choosing Vella Car Booking! 🚗<br>
              <strong>We'll get back to you soon!</strong>
            </p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
              <small style="color: #6c757d;">
                Request submitted on: ${new Date().toLocaleString()}<br>
                Reference ID: ${booking.bookingId}
              </small>
            </div>
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

     console.log("=== EMAIL DEBUGGING ===");
console.log("📧 Admin email going to:", process.env.EMAIL_USER);
console.log("📧 User email going to:", booking.email);
console.log("📧 User's actual email:", booking.email);
console.log("========================");
    

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

// GET /api/bookings - Get all bookings
router.get("/", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const bookings = await db.collection("bookings").find({}).sort({ createdAt: -1 }).toArray();
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  } finally {
    await client.close();
  }
});

// PUT /api/bookings/:id/approve - Approve a booking
router.put("/:id/approve", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const bookingId = req.params.id;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }
    
    // Find the booking
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId)
    });
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Update booking status to approved
    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          status: "approved",
          approvedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Booking could not be approved" });
    }
    
    // Send approval email to customer
    const approvalEmailOptions = {
      from: `"Vella Car Booking" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Approved - ${booking.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:carimage" alt="Car" width="150" />
            <h1 style="color: #28a745; margin-top: 20px;"> Booking Approved!</h1>
          </div>
          
          <div style="background: #d4edda; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #28a745;">
            <h2 style="color: #155724; text-align: center; margin: 0;">Great News, ${booking.name}!</h2>
            <p style="text-align: center; font-size: 16px; color: #155724; margin: 10px 0 0 0;">
              Your car booking has been approved and confirmed!
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <tr style="background: #28a745; color: white;">
              <td colspan="2" style="padding: 15px; text-align: center; font-size: 18px; font-weight: bold;">
                 Approved Booking Details
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Booking ID:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #28a745; font-weight: bold;">${booking.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Customer Name:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${booking.name} ${booking.lastName}</td>
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

          <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 5px solid #17a2b8;">
            <h3 style="color: #0c5460; margin: 0 0 10px 0;"> What's Next?</h3>
            <p style="margin: 0; color: #0c5460;">
              Your booking is confirmed. Please arrive on time at the designated booking location.
              Please have your booking ID: <strong>${booking.bookingId}</strong>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin: 0; color: #666;">
              Thank you for choosing Vella Car Booking! <br>
              <strong>We look forward to serving you!</strong>
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

    await transporter.sendMail(approvalEmailOptions);
    
    res.status(200).json({ 
      message: "Booking approved successfully",
      booking: {
        ...booking,
        status: "approved",
        approvedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error("Error approving booking:", error);
    res.status(500).json({ message: "Error approving booking", error: error.message });
  } finally {
    await client.close();
  }
});

// PUT /api/bookings/:id/reject - Reject a booking
router.put("/:id/reject", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    await client.connect();
    const db = client.db("Car_Booking");
    
    const bookingId = req.params.id;
    const { reason } = req.body;
    
    // Validate ObjectId format
    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID format" });
    }
    
    // Find the booking
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId)
    });
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Update booking status to rejected
    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          status: "rejected",
          rejectedAt: new Date(),
          rejectionReason: reason || "No reason provided",
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Booking could not be rejected" });
    }
    
    // Send rejection email to customer
    const rejectionEmailOptions = {
      from: `"Vella Car Booking" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `Booking Update - ${booking.bookingId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="cid:carimage" alt="Car" width="150" />
            <h1 style="color: #dc3545; margin-top: 20px;">Booking Update</h1>
          </div>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 5px solid #dc3545;">
            <h2 style="color: #721c24; text-align: center; margin: 0;">Dear ${booking.name},</h2>
            <p style="text-align: center; font-size: 16px; color: #721c24; margin: 10px 0 0 0;">
              We regret to inform you that your booking request could not be accommodated at this time.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <tr style="background: #dc3545; color: white;">
              <td colspan="2" style="padding: 15px; text-align: center; font-size: 18px; font-weight: bold;">
                Booking Details
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Booking ID:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee; color: #dc3545; font-weight: bold;">${booking.bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; background: #f8f9fa;">Reason:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${reason || "Vehicle/driver unavailable for selected dates"}</td>
            </tr>
          </table>

          <div style="background: #d1ecf1; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; border-left: 5px solid #17a2b8;">
            <h3 style="color: #0c5460; margin: 0 0 10px 0;">Alternative Options</h3>
            <p style="margin: 0; color: #0c5460;">
              Please contact us to discuss alternative dates or vehicle options.
              We're here to help find the best solution for your transportation needs.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin: 0; color: #666;">
              Thank you for considering Vella Car Booking.<br>
              <strong>We hope to serve you in the future!</strong>
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

    await transporter.sendMail(rejectionEmailOptions);
    
    res.status(200).json({ 
      message: "Booking rejected successfully",
      booking: {
        ...booking,
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason: reason || "No reason provided"
      }
    });
    
  } catch (error) {
    console.error("Error rejecting booking:", error);
    res.status(500).json({ message: "Error rejecting booking", error: error.message });
  } finally {
    await client.close();
  }
});

// PUT /api/bookings/:id - Update booking details
router.put("/:id", async (req, res) => {
  const client = new MongoClient(Db);
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove any fields that shouldn't be updated directly
    const { _id, bookingId, createdAt, status, ...allowedUpdates } = updateData;
    
    await client.connect();
    const db = client.db("Car_Booking");
    
    // Check if booking exists
    const existingBooking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    if (!existingBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Add updated timestamp
    allowedUpdates.updatedAt = new Date();
    
    // Update the booking
    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: allowedUpdates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Fetch the updated booking
    const updatedBooking = await db.collection("bookings").findOne({ _id: new ObjectId(id) });
    
    res.status(200).json({ 
      message: "Booking updated successfully",
      booking: updatedBooking
    });
    
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Error updating booking", error: error.message });
  } finally {
    await client.close();
  }
});

module.exports = router;