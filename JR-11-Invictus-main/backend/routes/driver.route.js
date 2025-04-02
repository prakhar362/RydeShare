import express from "express";
import { findNearbyRidesForDriver, acceptRide, rejectRide } from "../controllers/driver.controller.js";

const router = express.Router();

// Get nearby rides for the driver
router.get("/nearby-rides", findNearbyRidesForDriver);

// Accept a ride
router.post("/accept-ride/:rideId", acceptRide);

// Reject a ride
router.post("/reject-ride/:rideId", rejectRide);


export default router;
