import express from 'express';
import { adminLogin, adminRegister, getUserByToken, verifyToken } from '../database/auth.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ success: false, error: 'Invalid token' });
  
  req.user = decoded;
  next();
};

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    
    const result = await adminLogin(email, password);
    res.status(result.success ? 200 : 401).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Admin register (business signup form from portal)
router.post('/admin/register', async (req, res) => {
  try {
    const {
      business_name,
      primary_contact_name,
      first_name,
      last_name,
      email,
      password,
      phone,
      legal_address,
      country,
      city,
      postal,
      zip
    } = req.body;

    if (
      !business_name ||
      !primary_contact_name ||
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !legal_address ||
      !country ||
      !city
    ) {
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    const result = await adminRegister(req.body);
    res.status(result.success ? 201 : 409).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await getUserByToken(req.user.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

export default router;
