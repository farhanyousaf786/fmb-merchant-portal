import express from "express";
import { signUp, signIn, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Register
router.post("/register", signUp);

// Login  
router.post("/login", signIn);

// Verify token
router.post("/verify", verifyToken);

// Legacy routes for compatibility
router.post("/signup", signUp);
router.post("/signin", signIn);

export default router;
