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
    const { 
      first_name, last_name, email, phone, country, legal_address, avatar_url,
      business_name, primary_contact_name, branch 
    } = req.body;
    const userId = req.user.userId;

    console.log('Update data:', req.body);
    // No strict validation - allow partial updates

    console.log('Updating user profile with data:', req.body);
    const { default: AdminUser } = await import('../models/AdminUser.js');
    const { getPool } = await import('../database/db.js');

    const pool = await getPool();

    // Construct dynamic update query
    const fields = [];
    const values = [];

    if (first_name) { fields.push('first_name = ?'); values.push(first_name); }
    if (last_name) { fields.push('last_name = ?'); values.push(last_name); }
    if (email) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (country !== undefined) { fields.push('country = ?'); values.push(country); }
    if (legal_address !== undefined) { fields.push('legal_address = ?'); values.push(legal_address); }
    if (avatar_url !== undefined) { fields.push('avatar_url = ?'); values.push(avatar_url); }
    if (business_name !== undefined) { fields.push('business_name = ?'); values.push(business_name); }
    if (primary_contact_name !== undefined) { fields.push('primary_contact_name = ?'); values.push(primary_contact_name); }
    if (branch !== undefined) { fields.push('branch = ?'); values.push(branch); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(userId);

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
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

// --- Address Management Routes ---

// Get all addresses
router.get('/addresses', auth, async (req, res) => {
  try {
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();
    const [addresses] = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, addresses });
  } catch (err) {
    console.error('Get addresses error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/addresses', auth, async (req, res) => {
  try {
    const { name, address, city, country, postal, is_default } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, error: 'Name and address are required' });
    }

    const { getPool } = await import('../database/db.js');
    const pool = await getPool();

    // If setting as default, unset other defaults
    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [req.user.userId]);
    }

    const [result] = await pool.query(
      `INSERT INTO user_addresses (user_id, name, address, city, country, postal, is_default) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.userId, name, address, city || null, country || null, postal || null, is_default || false]
    );

    res.json({ success: true, message: 'Address added', id: result.insertId });
  } catch (err) {
    console.error('Add address error:', err);
    res.status(500).json({ success: false, error: 'Failed to add address' });
  }
});

// Update address (e.g. set default)
router.put('/addresses/:id', auth, async (req, res) => {
  try {
    const { name, address, city, country, postal, is_default } = req.body;
    const addressId = req.params.id;
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();

    // Verify ownership
    const [existing] = await pool.query('SELECT id FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, req.user.userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [req.user.userId]);
    }

    const fields = [];
    const values = [];
    if (name) { fields.push('name = ?'); values.push(name); }
    if (address) { fields.push('address = ?'); values.push(address); }
    if (city !== undefined) { fields.push('city = ?'); values.push(city); }
    if (country !== undefined) { fields.push('country = ?'); values.push(country); }
    if (postal !== undefined) { fields.push('postal = ?'); values.push(postal); }
    if (is_default !== undefined) { fields.push('is_default = ?'); values.push(is_default); }

    if (fields.length > 0) {
      values.push(addressId);
      await pool.query(`UPDATE user_addresses SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, message: 'Address updated' });
  } catch (err) {
    console.error('Update address error:', err);
    res.status(500).json({ success: false, error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:id', auth, async (req, res) => {
  try {
    const addressId = req.params.id;
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();

    const [result] = await pool.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, req.user.userId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    console.error('Delete address error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete address' });
  }
});

// Get all users (admin only)
router.get('/all-users', auth, async (req, res) => {
  console.log('📋 Get all users request received');
  try {
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();

    const [rows] = await pool.query(
      'SELECT id, business_name, primary_contact_name, first_name, last_name, email, phone, legal_address, country, city, postal, zip, avatar_url, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    console.log('✅ Users retrieved:', rows.length);
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error('❌ Get all users error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// Update user status (admin only)
router.put('/update-user-status', auth, async (req, res) => {
  console.log('🔄 Update user status request received');
  try {
    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ success: false, error: 'Missing userId or status' });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const { getPool } = await import('../database/db.js');
    const pool = await getPool();

    const [result] = await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log(`✅ User ${userId} status updated to ${status}`);
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (err) {
    console.error('❌ Update user status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

export default router;
