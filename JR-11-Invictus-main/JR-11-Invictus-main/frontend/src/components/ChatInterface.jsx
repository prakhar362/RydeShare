import React from "react";
import { motion } from "framer-motion";

// Sample static messages for demo purposes
const sampleMessages = [
  { id: 1, sender: "Driver (driver123)", text: "Hey, I’m 5 minutes away!", timestamp: "10:30 AM", isSent: false },
  { id: 2, sender: "You (user123)", text: "Great, I’m at the pickup spot.", timestamp: "10:31 AM", isSent: true },
  { id: 3, sender: "Passenger (user456)", text: "Can we stop for coffee?", timestamp: "10:32 AM", isSent: false },
];

const ChatInterface = ({ rideId = "xyz123" }) => {
  return (
    <motion.div
      className={`fixed inset-0 bg-white z-50 flex flex-col ${
        isOpen ? "block" : "hidden"
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Header */}
      <div className="bg-blue-600 text-white p-4 text-center relative">
        <h2 className="text-xl font-medium">Ride Chat</h2>
        <p className="text-xs opacity-80 mt-1">Ride ID: {rideId}</p>
        <motion.button
          className="absolute right-4 top-4 text-2xl text-white focus:outline-none"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ×
        </motion.button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {sampleMessages.map((message) => (
          <motion.div
            key={message.id}
            className={`flex flex-col mb-4 p-3 rounded-lg max-w-[75%] ${
              message.isSent ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-gray-800"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: message.id * 0.1 }}
          >
            <span className="font-bold text-sm">{message.sender}</span>
            <p className="text-base">{message.text}</p>
            <span className="text-xs opacity-70 mt-1">{message.timestamp}</span>
          </motion.div>
        ))}
      </div>

      {/* Message Input */}
      <motion.form
        className="flex p-4 bg-white border-t border-gray-200"
        onSubmit={(e) => e.preventDefault()} // Placeholder for send logic
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.input
          type="text"
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-md mr-2 focus:outline-none focus:border-blue-500"
          whileFocus={{ scale: 1.02, borderColor: "#3b82f6" }}
          transition={{ duration: 0.2 }}
        />
        <motion.button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          Send
        </motion.button>
      </motion.form>
    </motion.div>
  );
};

export default ChatInterface;
