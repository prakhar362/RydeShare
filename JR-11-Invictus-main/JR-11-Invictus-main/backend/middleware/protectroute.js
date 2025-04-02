import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ENV_VARS } from '../config/envVars.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies["jwt-riding"];

        if (!token) {
            console.warn("No token provided in request");
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, ENV_VARS.JWT_SECRET);

        if (!decoded) {
            console.warn("Invalid token");
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            console.warn("User not found for decoded token ID");
            return res.status(404).json({ success: false, message: "User not found" });
        }

        req.user = user; // Attach user to request
        next(); // Proceed to the next middleware
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default protectRoute;