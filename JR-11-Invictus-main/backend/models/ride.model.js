import mongoose from "mongoose";

const RideSchema = new mongoose.Schema({
    driver: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Driver", required: true 
        },
    passengers: 
        [{  
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" }],
    pickup : { 
        latitude: Number, 
        longitude: Number 
        },
    dropoff: { 
        latitude: Number,
        longitude: Number },
    fare: { 
        type: Number, 
        required: true 
    },
    farePerPerson: { 
        type: Number, 
        required: true },
    status: { type: String, enum: ["pending", "completed", "canceled"], default: "pending" },
}, { timestamps: true });


const Ride =  mongoose.model("Ride", RideSchema);

export default Ride;