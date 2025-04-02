// server.js
import express from "express";
import http from "http"; // Import HTTP module for WebSocket support
import { Server } from "socket.io"; // Import Socket.IO
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables from .env file
dotenv.config();

// Import API route handlers
import authRouter from "./routes/auth.routes.js";
import rideRouter from "./routes/ride.routes.js";
import driverAuthRouter from "./routes/driverAuth.routes.js";
import chatRouter from "./routes/chat.routes.js"; // Import Chat Routes
import driverRouter from "./routes/driver.route.js";

// Initialize Express app
const app = express();
const server = http.createServer(app); // Create an HTTP server

// Configure CORS to allow frontend access
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from frontend
    credentials: true, // Allow cookies and authentication headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed request methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// Middleware to parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware for handling cookies

// Define API routes
app.use("/api/v1/auth", authRouter); // User authentication routes
app.use("/api/v1/ride", rideRouter); // Ride-related routes
app.use("/api/v1/driverAuth", driverAuthRouter); // Driver authentication routes
app.use("/api/v1/chat", chatRouter); // Register Chat Routes
app.use("/api/v1/driver", driverRouter);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Update as per your frontend
    credentials: true,
  },
});

// Store online users and their locations
const onlineUsers = new Map();
const userLocations = new Map(); // Stores user locations
const driverLocations = new Map(); // Stores driver locations

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Handle User Joining (Store in Map)
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} is online`);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  // Handle User Location Updates
  socket.on("updateUserLocation", ({ userId, location }) => {
    userLocations.set(userId, location); // Store user location
    io.emit("userLocationUpdated", { userId, location }); // Broadcast to all clients
  });

  // Handle Driver Location Updates
  socket.on("updateDriverLocation", ({ driverId, location }) => {
    driverLocations.set(driverId, location); // Store driver location
    io.emit("driverLocationUpdated", { driverId, location }); // Broadcast to all clients
  });

  // Handle Sending Messages
  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    try {
      // Save message in DB
      const chatMessage = new Message({ sender, receiver, message });
      await chatMessage.save();

      // Find receiver socket ID
      const receiverSocketId = onlineUsers.get(receiver);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          sender,
          message,
          timestamp: chatMessage.timestamp,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Fetch Chat History
  socket.on("fetchMessages", async ({ sender, receiver }) => {
    try {
      const messages = await Message.find({
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender },
        ],
      }).sort({ timestamp: 1 });

      socket.emit("chatHistory", messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  });

  // Handle User Disconnect
  socket.on("disconnect", () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        userLocations.delete(userId); // Remove user location on disconnect
        console.log(`User ${userId} went offline`);
      }
    });
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

// Set the port number from environment variables or default to 3000
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Start the server and listen for incoming requests
server.listen(PORT, () => {
  // Connect to MongoDB database
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));
  console.log(`\n Backend Server is running at: http://localhost:${PORT}`);
  console.log(` WebSocket server is running on the same server!`);
});