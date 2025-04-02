import express from "express";
import { login, logout, signup, authCheck,profile } from "../controllers/driverAuth.controller.js";
import protectRoute from "../middleware/protectroute.js";

const router = express.Router();

router.post("/signup",signup );
router.post("/login",login);
router.post("/logout",logout);
router.get("/authCheck",protectRoute,authCheck);
router.get("/profile/:driverId",profile);

export default router;