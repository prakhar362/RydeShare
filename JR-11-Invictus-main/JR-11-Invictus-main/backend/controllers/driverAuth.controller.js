import Driver from '../models/driver.model.js';
import bcryptjs from 'bcryptjs';
import { generateTokenAndSetCookie } from '../utils/generateTokens.js';

export async function signup(req, res) {
    try {
        const { email, password, username , vehicleType , vehicleNumber , vehicleName , licenceNumber,phoneNumber } = req.body;

        // Validation checks
        if (!email || !password || !username || !vehicleType || !vehicleNumber || !vehicleName || !licenceNumber || !phoneNumber) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(404).json({ success: false, message: "Invalid email format" });
        }

        if(vehicleNumber.length < 9){
            return res.status(400).json({ success: false, message: "Vehicle type should be at least 3 characters" });
        }

        if(vehicleName.length < 3){
            return res.status(400).json({ success: false, message: "Vehicle type should be at least 3 characters" });
        }

        if(licenceNumber.length < 16){
            return res.status(400).json({ success: false, message: "Vehicle type should be at least 3 characters" });
        }

        // Password length check
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password should be at least 6 characters" });
        }

        // Check if email already exists
        const existingUserByEmail = await Driver.findOne({ email: email });
        if (existingUserByEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Hashing the password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Creating a new user without the Image field
        const newUser = new Driver({
            email: email,
            password: hashedPassword,
            username: username,
            vehicleType: vehicleType,
            vehicleNumber: vehicleNumber,
            vehicleName: vehicleName,
            licenceNumber: licenceNumber,
            phoneNumber:phoneNumber,
        });

        // Generating token and setting cookie
        generateTokenAndSetCookie(newUser._id, res);
        
        // Saving the new user to the database
        await newUser.save();

        // Responding with the new user data (password omitted)
        res.status(201).json({
            success: true,
            user: {
                ...newUser._doc,
                password: "" // Omit password from response
            }
        });

    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        
        // Validation checks
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Find user by email
        const user = await Driver.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        // Check password match
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(404).json({ success: false, message: "Invalid credentials" });
        }

        // Generating token and setting cookie
        generateTokenAndSetCookie(user._id, res);

        // Responding with user data (password omitted)
        res.status(200).json({
            success: true,
            user: {
                ...user._doc,
                password: "" // Omit password from response
            }
        });

    } catch (error) {
        console.log("Error in login controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function logout(req, res) {
    try {
        // Clearing the authentication cookie
        res.clearCookie("jwt-netflix");
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export async function authCheck(req, res) {
    try {
        console.log("req.user:", req.user); // For debugging
        res.status(200).json({ success: true, user: req.user });
    } catch (error) {
        console.log("Error in authCheck controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
export async function profile(req, res) {
    try {
        const { driverId } = req.params; // ✅ Extract driverId from URL params

        if (!driverId) {
            return res.status(400).json({ success: false, message: "Driver ID is required" });
        }

        // Find the driver by ID and exclude the password from the response
        const driver = await Driver.findById(driverId).select("-password");

        if (!driver) {
            return res.status(404).json({ success: false, message: "Driver not found" });
        }

        res.status(200).json({ success: true, user: driver });

    } catch (error) {
        console.error("Error in profile controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}
