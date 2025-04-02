import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import BottomNavigation from "../../components/BottomNavigator";

const socket = io("http://localhost:5000"); // Replace with your backend URL

const Contact = ({ rideId = "40521", userId = "lallan10" }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Connect to Socket.IO and listen for messages
  useEffect(() => {
    socket.emit("join", userId); // Notify server that user has joined

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Fetch previous chat history
    socket.emit("fetchMessages", { sender: userId, receiver: "Suhas" });

    socket.on("chatHistory", (chatHistory) => {
      setMessages(chatHistory);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      sender: userId,
      receiver: "driver123", // Change this dynamically as needed
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    socket.emit("sendMessage", newMessage); // Emit message to backend
    setMessages((prevMessages) => [...prevMessages, { ...newMessage, isSent: true }]);
    setInput("");
  };

  return (
    <motion.div className="fixed inset-0 bg-white z-50 flex flex-col h-screen"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 text-center relative">
        <h2 className="text-xl font-medium">Ride Chat</h2>
        <p className="text-xs opacity-80 mt-1">Ride ID: {rideId}</p>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <motion.div key={index} className={`flex flex-col mb-4 p-3 rounded-lg max-w-[75%] ${
              message.sender === userId ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-gray-800"
            }`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <span className="font-bold text-sm">{message.sender}</span>
            <p className="text-base">{message.message}</p>
            <span className="text-xs opacity-70 mt-1">{message.timestamp}</span>
          </motion.div>
        ))}
      </div>

      {/* Message Input */}
      <motion.form className="flex p-4 bg-white border-t border-gray-200" onSubmit={sendMessage} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
        <motion.input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..." className="flex-1 p-2 border border-gray-300 rounded-md mr-2 focus:outline-none focus:border-blue-500"
          whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }} transition={{ duration: 0.2 }} />
        <motion.button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
          Send
        </motion.button>
      </motion.form>

      {/* Bottom Navigation */}
      <div className="flex justify-center p-4 w-full bg-white">
        <BottomNavigation className="w-full max-w-10xl" />
      </div>
    </motion.div>
  );
};

export default Contact;
