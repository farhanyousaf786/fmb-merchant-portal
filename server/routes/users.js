import express from "express";
import { getAllUsers, deleteUser } from "../controllers/userController.js";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Delete user (cascade deletes media)
router.delete("/:id", deleteUser);

export default router;
