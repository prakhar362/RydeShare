import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import { UserLocation, DriverLocation } from "../models/location.model.js"; // MongoDB models

// Initialize WebSocket server
const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Update as per your frontend
      credentials: true,
    },
  });

  // Store online users and drivers in memory (or MongoDB)
  const onlineUsers = new Map(); // { userId: socketId }
  const onlineDrivers = new Map(); // { driverId: socketId }
  const userLocations = new Map(); // { userId: { lat, lng } }
  const driverLocations = new Map(); // { driverId: { lat, lng } }

  io.on("connection", (socket) => {
    console.log(`A user/driver connected: ${socket.id}`);

    // Handle User Joining
    socket.on("joinAsUser", (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} is online`);
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    });

    // Handle Driver Joining
    socket.on("joinAsDriver", (driverId) => {
      onlineDrivers.set(driverId, socket.id);
      console.log(`Driver ${driverId} is online`);
      io.emit("updateOnlineDrivers", Array.from(onlineDrivers.keys()));
    });

    // Handle User Location Updates
    socket.on("updateUserLocation", async ({ userId, location }) => {
      userLocations.set(userId, location); // Store in memory
      io.emit("userLocationUpdated", { userId, location }); // Broadcast to all clients

      // Optionally save to MongoDB
      await UserLocation.findOneAndUpdate(
        { userId },
        { location },
        { upsert: true, new: true }
      );
    });

    // Handle Driver Location Updates
    socket.on("updateDriverLocation", async ({ driverId, location }) => {
      driverLocations.set(driverId, location); // Store in memory
      io.emit("driverLocationUpdated", { driverId, location }); // Broadcast to all clients

      // Optionally save to MongoDB
      await DriverLocation.findOneAndUpdate(
        { driverId },
        { location },
        { upsert: true, new: true }
      );
    });

    // Handle User/Driver Disconnect
    socket.on("disconnect", () => {
      // Remove user from online users
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          userLocations.delete(userId);
          console.log(`User ${userId} went offline`);
        }
      });

      // Remove driver from online drivers
      onlineDrivers.forEach((socketId, driverId) => {
        if (socketId === socket.id) {
          onlineDrivers.delete(driverId);
          driverLocations.delete(driverId);
          console.log(`Driver ${driverId} went offline`);
        }
      });

      // Broadcast updated lists
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
      io.emit("updateOnlineDrivers", Array.from(onlineDrivers.keys()));
    });
  });

  return io;
};

export default initializeSocket;