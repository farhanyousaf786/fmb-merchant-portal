import express from "express";
import { getCurrentUser, getAllUsers, deleteUser, updateUserPassword, assignRole, updateUserStatus, getUserBusinessPhones, getUserShippingAddresses } from "../controllers/userController.js";
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

// Admin: Assign role and approve user
router.put("/:id/role", assignRole);

// Admin: Update user status
router.put("/:id/status", updateUserStatus);

// Admin: Get user's business phones
router.get("/:id/phones", getUserBusinessPhones);

// Admin: Get user's shipping addresses
router.get("/:id/addresses", getUserShippingAddresses);

// Delete user (cascade deletes media)
router.delete("/:id", deleteUser);

export default router;
