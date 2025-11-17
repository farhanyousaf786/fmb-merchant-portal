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

    console.log('Registration data:', req.body);
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
      console.log('Required fields missing');
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    const result = await adminRegister(req.body);
    console.log('Registration result:', result);
    res.status(result.success ? 201 : 409).json(result);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  console.log('Get current user request received');
  try {
    const user = await getUserByToken(req.user.userId);
    console.log('User data:', user);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  console.log('Update user profile request received');
  try {
    console.log('Received profile update request from user:', req.user.userId);
    const { first_name, last_name, email, phone, country, legal_address } = req.body;
    const userId = req.user.userId;

    console.log('Update data:', req.body);
    if (!first_name || !last_name || !email) {
      console.log('Required fields missing');
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    }

    console.log('Updating user profile with data:', req.body);
    const { default: AdminUser } = await import('../models/AdminUser.js');
    const { getPool } = await import('../database/db.js');

    const pool = await getPool();

    const [result] = await pool.query(
      `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, country = ?, legal_address = ? WHERE id = ?`,
      [first_name, last_name, email, phone || null, country || null, legal_address || null, userId]
    );

    console.log('Profile update query result:', result);
    if (result.affectedRows === 0) {
      console.log('User not found');
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log('Fetching updated user profile...');
    const updatedUser = await AdminUser.findById(userId);
    console.log('Updated user profile:', updatedUser.toJSON());
    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser.toJSON() });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

export default router;
