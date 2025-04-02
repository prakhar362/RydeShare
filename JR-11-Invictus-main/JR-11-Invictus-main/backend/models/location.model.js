import mongoose from "mongoose";

const userLocationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

const driverLocationSchema = new mongoose.Schema({
  driverId: { type: String, required: true, unique: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

export const UserLocation = mongoose.model("UserLocation", userLocationSchema);
export const DriverLocation = mongoose.model("DriverLocation", driverLocationSchema);