import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your Google App Password
  },
});

/**
 * Function to send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - (Optional) HTML content for formatted emails
 */
export const sendEmail = async (to, subject, text, html = "") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender
      to,
      subject,
      text,
      html, // Optional HTML content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(` Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(" Email sending error:", error);
    return false;
  }
};
