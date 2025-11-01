import express from "express";
import { signIn, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Login  
router.post("/login", signIn);

// Verify token
router.post("/verify", verifyToken);

// Legacy route for compatibility
router.post("/signin", signIn);

export default router;
