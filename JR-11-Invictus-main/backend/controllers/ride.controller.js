import axios from "axios"; // Import axios for API requests
import Ride from "../models/ride.model.js";
import { User } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmails.js"; // Import email function

let io; // Socket instanc
// Function to get coordinates from an address (Geocoding)
export const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
      }
    );

    if (response.data.length === 0) return null;

    return {
      latitude: parseFloat(response.data[0].lat),
      longitude: parseFloat(response.data[0].lon),
    };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

// Function to get an address from coordinates (Reverse Geocoding)
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
        },
      }
    );

    return response.data.display_name || "Unknown Location";
  } catch (error) {
    console.error("Error fetching address:", error);
    return "Unknown Location";
  }
};

// Haversine formula to calculate distance between two points
export const setSocketInstance = (socketIoInstance) => {
  io = socketIoInstance;
};

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const calculateFare = (rideDetails, surgeMultiplier = 1) => {
    const baseFare = 20; // Base fare per passenger or segment
    const perKmRate = 10; // Rate per kilometer
    const sharingDiscount = 0.8; // 20% discount for shared segments
  
    const { totalDistance, segments, passengers } = rideDetails;
  
    if (passengers.length > 3) {
      throw new Error("Maximum capacity is 3 passengers.");
    }
  
    // Sort passengers by pickup point along the route (assuming linear route A -> B)
    const sortedPassengers = passengers.sort((a, b) => {
      const aDistanceFromStart = segments[a.from] ? segments[a.from].distanceFromStart : 0;
      const bDistanceFromStart = segments[b.from] ? segments[b.from].distanceFromStart : 0;
      return aDistanceFromStart - bDistanceFromStart;
    });
  
    // Calculate distances for each segment dynamically
    const segmentDistances = {};
    let previousPoint = 'A'; // Start point
    let cumulativeDistance = 0;
  
    for (let i = 0; i < sortedPassengers.length; i++) {
      const currentPoint = sortedPassengers[i].from;
      if (currentPoint !== previousPoint) {
        segmentDistances[`${previousPoint}to${currentPoint}`] = segments[currentPoint].distanceFromStart - cumulativeDistance;
        cumulativeDistance = segments[currentPoint].distanceFromStart;
        previousPoint = currentPoint;
      }
    }
    // Last segment to dropoff (B)
    segmentDistances[`${previousPoint}toB`] = totalDistance - cumulativeDistance;
  
    // Calculate fares for each passenger
    const fares = sortedPassengers.map((passenger) => {
      let passengerDistance = 0;
      let fare = 0;
      let currentPoint = passenger.from;
      let isShared = false;
  
      // Determine the distance traveled by this passenger
      for (const [segment, distance] of Object.entries(segmentDistances)) {
        const [start, end] = segment.match(/(.+)to(.+)/).slice(1);
        // Check if this segment is part of the passenger's journey
        if (start === currentPoint) {
          passengerDistance += distance;
          currentPoint = end;
        } else if (currentPoint === 'B') {
          break; // Reached destination
        }
  
        // Count passengers sharing this segment
        const passengersInSegment = sortedPassengers.filter(p => {
          const fromIndex = sortedPassengers.findIndex(sp => sp.from === start);
          const toIndex = sortedPassengers.findIndex(sp => sp.to === 'B');
          const pIndex = sortedPassengers.findIndex(sp => sp.id === p.id);
          return pIndex >= fromIndex && distance > 0;
        }).length;
  
        if (passengersInSegment > 1 && passengerDistance >= distance && distance > 0) {
          isShared = true;
        }
      }
  
      // Calculate fare: base fare + per km rate, apply discount if shared
      fare = baseFare + passengerDistance * perKmRate;
      if (isShared) {
        fare *= sharingDiscount;
      }
  
      return {
        passengerId: passenger.id,
        fare: fare * surgeMultiplier,
        distance: passengerDistance,
      };
    });
  
    // Total fare driver receives
    const totalDriverFare = fares.reduce((sum, f) => sum + f.fare, 0);
  
    return {
      fares, // Array of { passengerId, fare, distance }
      totalDriverFare,
    };
};
  
  // Updated bookRide function to integrate dynamic fare calculation
export const bookRide = async (req, res) => {
    try {
      const userId = req.user._id;
      const { pickup, dropoff } = req.body;
      const user = req.user;
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const nearbyRides = await Ride.find({ status: "pending" });
      let matchedRide = null;
  
      for (let ride of nearbyRides) {
        const distance = getDistance(
          pickup.latitude,
          pickup.longitude,
          ride.pickup.latitude,
          ride.pickup.longitude
        );
        if (distance <= 3 && ride.passengers.length < 3) { // Check capacity
          matchedRide = ride;
          break;
        }
      }
  
      if (matchedRide) {
        matchedRide.passengers.push(userId);
  
        // Calculate total distance and segment distances
        const totalDistance = getDistance(
          matchedRide.pickup.latitude,
          matchedRide.pickup.longitude,
          matchedRide.dropoff.latitude,
          matchedRide.dropoff.longitude
        );
  
        // Define segments dynamically based on passenger pickup points
        const segments = {
          'A': { distanceFromStart: 0 }, // Starting point
        };
        matchedRide.passengers.forEach((p, idx) => {
          if (idx === 0) return; // Skip first passenger (A)
          const pickupPoint = String.fromCharCode(67 + idx - 1); // C, D, etc.
          segments[pickupPoint] = {
            distanceFromStart: getDistance(
              matchedRide.pickup.latitude,
              matchedRide.pickup.longitude,
              idx === matchedRide.passengers.length - 1 ? pickup.latitude : matchedRide.passengers[idx].pickup.latitude,
              idx === matchedRide.passengers.length - 1 ? pickup.longitude : matchedRide.passengers[idx].pickup.longitude
            ),
          };
        });
  
        const rideDetails = {
          totalDistance,
          segments,
          passengers: matchedRide.passengers.map((p, idx) => ({
            id: p,
            from: idx === 0 ? 'A' : String.fromCharCode(66 + idx), // A, C, D
            to: 'B',
          })),
        };
  
        const fareResult = calculateFare(rideDetails);
        matchedRide.fare = fareResult.totalDriverFare;
        matchedRide.fareDetails = fareResult.fares;
  
        await matchedRide.save();
  
        io.to(matchedRide._id.toString()).emit("rideUpdated", {
          message: "A new passenger has joined the ride.",
          ride: matchedRide,
        });
  
        await sendEmail(
          user.email,
          "Ride Booking Confirmation",
          `You have joined a ride. Your fare: ₹${fareResult.fares.find(f => f.passengerId.toString() === userId.toString()).fare.toFixed(2)}`
        );
  
        return res.status(200).json({ message: "Ride booked!", ride: matchedRide });
      } else {
        const totalDistance = getDistance(
          pickup.latitude,
          pickup.longitude,
          dropoff.latitude,
          dropoff.longitude
        );
  
        const rideDetails = {
          totalDistance,
          segments: { 'A': { distanceFromStart: 0 } },
          passengers: [{ id: userId, from: 'A', to: 'B' }],
        };
  
        const fareResult = calculateFare(rideDetails);
        const newRide = new Ride({
          driver: userId,
          passengers: [userId],
          pickup,
          dropoff,
          fare: fareResult.totalDriverFare,
          fareDetails: fareResult.fares,
          status: "pending",
        });
  
        await newRide.save();
        io.to(userId.toString()).emit("rideCreated", {
          message: "New ride created successfully.",
          ride: newRide,
        });
  
        await sendEmail(
          user.email,
          "New Ride Created",
          `You have created a new ride. Your fare: ₹${fareResult.fares[0].fare.toFixed(2)}`
        );
  
        return res.status(201).json({ message: "New ride created!", ride: newRide });
      }
    } catch (error) {
      console.error("Error in bookRide:", error);
      res.status(500).json({ message: "Server error" });
    }
};
  

// Controller to find available rides
export const findAvailableRides = async (req, res) => {
  try {
    let { pickup, dropoff } = req.body;

    // Convert address to coordinates if necessary
    if (pickup.address) {
      const coordinates = await getCoordinatesFromAddress(pickup.address);
      if (!coordinates)
        return res.status(400).json({ message: "Invalid pickup address" });
      pickup = { ...coordinates, location: pickup.address };
    }
    if (dropoff.address) {
      const coordinates = await getCoordinatesFromAddress(dropoff.address);
      if (!coordinates)
        return res.status(400).json({ message: "Invalid dropoff address" });
      dropoff = { ...coordinates, location: dropoff.address };
    }

    // Find rides with nearby pickup locations (within 3km radius)
    let availableRides = await Ride.find({ status: "pending" });

    availableRides = availableRides.filter((ride) => {
      const pickupDistance = getDistance(
        pickup.latitude,
        pickup.longitude,
        ride.pickup.latitude,
        ride.pickup.longitude
      );

      const dropoffDistance = getDistance(
        dropoff.latitude,
        dropoff.longitude,
        ride.dropoff.latitude,
        ride.dropoff.longitude
      );

      return pickupDistance <= 3 && dropoffDistance <= 3;
    });

    // Sort by nearest pickup location
    availableRides.sort((a, b) => {
      const distanceA = getDistance(
        pickup.latitude,
        pickup.longitude,
        a.pickup.latitude,
        a.pickup.longitude
      );
      const distanceB = getDistance(
        pickup.latitude,
        pickup.longitude,
        b.pickup.latitude,
        b.pickup.longitude
      );
      return distanceA - distanceB;
    });

    return res.status(200).json({ rides: availableRides });
  } catch (error) {
    console.error("Error finding available rides:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const userId = req.user._id;
    const { rideId } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    // Remove user from passengers
    ride.passengers = ride.passengers.filter(
      (passengerId) => passengerId.toString() !== userId.toString()
    );

    if (ride.passengers.length === 0) {
      // Delete ride if no passengers remain (except driver)
      await Ride.findByIdAndDelete(rideId);
      io.to(rideId.toString()).emit("rideCancelled", {
        message: "Ride has been cancelled.",
      });

      await sendEmail(
        req.user.email,
        "Ride Cancelled",
        `Your ride has been cancelled successfully.`
      );

      return res.status(200).json({ message: "Ride cancelled successfully." });
    }

    // Recalculate fare for remaining passengers
    const rideDistance = getDistance(
      ride.pickup.latitude,
      ride.pickup.longitude,
      ride.dropoff.latitude,
      ride.dropoff.longitude
    );
    ride.farePerPerson = calculateFare(rideDistance, ride.passengers);

    await ride.save();

    io.to(rideId.toString()).emit("rideUpdated", {
      message: "A passenger cancelled the ride. Fare updated.",
      ride,
    });

    await sendEmail(
      req.user.email,
      "Ride Cancellation",
      `You have successfully cancelled your ride.`
    );

    return res
      .status(200)
      .json({ message: "Ride cancelled and fare updated.", ride });
  } catch (error) {
    console.error("Error in cancelRide:", error);
    res.status(500).json({ message: "Server error" });
  }
};
