import express from 'express';
import {
  signUp,
  signIn,
  verifyToken
} from '../controllers/authController.js';

const router = express.Router();

// Auth routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verify', verifyToken);

export default router;
