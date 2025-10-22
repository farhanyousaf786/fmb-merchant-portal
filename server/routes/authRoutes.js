const express = require('express');
const router = express.Router();
const {
  signUp,
  signIn,
  verifyToken
} = require('../controllers/authController');

// Auth routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/verify', verifyToken);

module.exports = router;
