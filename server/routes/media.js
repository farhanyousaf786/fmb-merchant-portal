import express from "express";
import multer from "multer";
import { uploadFile, getAllMedia, getMediaByUser, deleteMedia } from "../controllers/mediaController.js";

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and documents
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, videos, and documents are allowed!'));
    }
  }
});

// Upload file
router.post("/upload", upload.single("file"), uploadFile);

// Get all media
router.get("/", getAllMedia);

// Get media by user
router.get("/user/:userId", getMediaByUser);

// Delete media
router.delete("/:id", deleteMedia);

export default router;
