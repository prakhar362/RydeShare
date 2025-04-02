import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

import { bookRide, cancelRide, findAvailableRides } from "../controllers/Ride.controller.js";
import protectRoute from "../middleware/protectroute.js";

dotenv.config(); // Load environment variables

const router = express.Router();

// Initialize Razorpay instance securely
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Use environment variable
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Use environment variable
});

// Route to book a ride
router.post("/bookRide", protectRoute, bookRide);

// Route to cancel a ride
router.put("/cancel/:rideId", protectRoute, cancelRide);

// Route to find available rides
router.post("/findRides", protectRoute, findAvailableRides);

// Route to create an order
router.post("/createOrder", async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert amount to paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(), // Fixed template string issue
    });

    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    res.status(500).json({ error: "Something went wrong while creating order" });
  }
});

// Route to verify payment
router.post("/payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // Use environment variable
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.status(200).json({ message: "Payment verified successfully!" });
  } else {
    res.status(400).json({ error: "Invalid payment signature!" });
  }
});

export default router;
