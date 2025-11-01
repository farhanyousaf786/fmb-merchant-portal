import express from "express";
import { getCurrentUser, getAllUsers, deleteUser, updateUserPassword } from "../controllers/userController.js";
import { updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// Get current user data
router.get("/me", getCurrentUser);

// Get all users
router.get("/", getAllUsers);

// Update user profile
router.put("/profile", updateProfile);

// Admin: Update a user's password
router.put("/:id/password", updateUserPassword);

// Delete user (cascade deletes media)
router.delete("/:id", deleteUser);

export default router;
