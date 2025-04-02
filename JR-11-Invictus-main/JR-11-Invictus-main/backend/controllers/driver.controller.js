import Ride from "../models/ride.model.js"; // Assuming Ride model exists
import haversine from "haversine-distance"; // Utility for distance calculation

// Accept a ride
export const acceptRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.user.id; // Assuming driver ID comes from auth middleware

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if (ride.status !== "pending") return res.status(400).json({ message: "Ride is not available" });

        ride.status = "accepted";
        ride.driver = driverId;
        await ride.save();

        // Notify passengers via socket.io (if implemented)

        res.status(200).json({ message: "Ride accepted", ride });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Reject a ride
export const rejectRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const driverId = req.user.id;

        const ride = await Ride.findById(rideId);
        if (!ride) return res.status(404).json({ message: "Ride not found" });

        if (ride.status !== "pending") return res.status(400).json({ message: "Ride is not available" });

        // Add driver to rejectedDrivers array to prevent reassigning
        ride.rejectedDrivers.push(driverId);
        await ride.save();

        res.status(200).json({ message: "Ride rejected successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Find nearby rides for driver
export const findNearbyRidesForDriver = async (req, res) => {
    try {
        const { latitude, longitude } = req.body; // Driver's current location
        const driverId = req.user.id;
        const MAX_DISTANCE = 5000; // 5 km

        const pendingRides = await Ride.find({ status: "pending", rejectedDrivers: { $ne: driverId } });

        const nearbyRides = pendingRides.filter(ride => {
            const rideLocation = { lat: ride.pickup.latitude, lon: ride.pickup.longitude };
            const driverLocation = { lat: latitude, lon: longitude };
            return haversine(driverLocation, rideLocation) <= MAX_DISTANCE;
        });

        res.status(200).json({ message: "Nearby rides found", rides: nearbyRides });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};


