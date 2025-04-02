import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    rideId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Ride", required: true 
    },
    senderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true 
    },
    text: { 
        type: String, 
        required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.model("Message", messageSchema);
