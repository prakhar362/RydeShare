import express from "express";
import {Message} from "../models/message.model.js";

const router = express.Router();

//  1. Fetch chat history between two users
router.get("/:sender/:receiver", async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//  2. Send a new message (Optional API for REST fallback)
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
