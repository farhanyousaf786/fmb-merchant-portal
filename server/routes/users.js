import express from 'express';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../database/auth.js';

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  console.log('🔑 Auth middleware - checking token');
  const token = req.headers.authorization?.split(' ')[1];
  console.log('📋 Authorization header:', req.headers.authorization);
  console.log('🎫 Extracted token:', token ? token.substring(0, 20) + '...' : 'NONE');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, error: 'No token' });
  }
  
  const decoded = verifyToken(token);
  console.log('🔓 Token verification result:', decoded ? 'SUCCESS' : 'FAILED');
  console.log('👤 Decoded user info:', decoded);
  
  if (!decoded) {
    console.log('❌ Invalid token');
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  
  req.user = decoded;
  console.log('✅ Auth middleware passed');
  next();
};

// Admin create new user (simple form)
router.post('/create', auth, async (req, res) => {
  console.log('👤 Admin creating new user');
  console.log('📝 Request body:', { ...req.body, password: '[REDACTED]' });
  
  try {
    const { first_name, last_name, email, password, role, status } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'First name, last name, email, and password are required' 
      });
    }
    
    // Check if admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();
    
    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const [result] = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [first_name, last_name, email, hashedPassword, role || 'merchant', status || 'active']
    );
    
    console.log('✅ User created with ID:', result.insertId);
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
});

// Update user password
router.put('/:userId/password', auth, async (req, res) => {
  console.log('🔐 Password update request received');
  console.log('📝 Request params:', req.params);
  console.log('👤 Current user from token:', req.user);
  console.log('🔑 Request body:', { ...req.body, newPassword: req.body.newPassword ? '[REDACTED]' : 'MISSING' });
  
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    console.log(`🎯 Target user ID: ${userId}`);

    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password validation failed - too short or missing');
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      });
    }

    console.log('✅ Password validation passed');

    // Get current user to verify admin permissions
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();
    
    console.log('🔍 Checking current user permissions...');
    const [currentUser] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.userId]
    );

    console.log('👤 Current user from DB:', currentUser);

    if (currentUser.length === 0) {
      console.log('❌ Current user not found in database');
      return res.status(404).json({ success: false, error: 'Current user not found' });
    }

    // Only admins can change other users' passwords
    if (currentUser[0].role !== 'admin' && parseInt(userId) !== parseInt(req.user.userId)) {
      console.log('❌ Permission denied - not admin and not self');
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can change other users\' passwords' 
      });
    }

    console.log('✅ Permission check passed');

    // Hash the new password
    console.log('🔒 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Password hashed successfully');

    // Update the password
    console.log('💾 Updating password in database...');
    const [result] = await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    console.log('📊 Database update result:', result);

    if (result.affectedRows === 0) {
      console.log('❌ Target user not found for password update');
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log(`✅ Password updated successfully for user ${userId} by admin ${req.user.userId}`);
    res.json({ success: true, message: 'Password updated successfully' });

  } catch (err) {
    console.error('❌ Update password error:', err);
    console.error('❌ Error stack:', err.stack);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
});

// Update user role
router.put('/:userId/role', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, status } = req.body;

    if (!role || !['admin', 'merchant', 'staff'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid role is required (admin, merchant, staff)' 
      });
    }

    // Get current user to verify admin permissions
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();
    
    const [currentUser] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({ success: false, error: 'Current user not found' });
    }

    // Only admins can assign roles
    if (currentUser[0].role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can assign roles' 
      });
    }

    // Update the user role and optionally status
    const fields = ['role = ?'];
    const values = [role];

    if (status) {
      fields.push('status = ?');
      values.push(status);
    }

    values.push(userId);

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log(`✅ Role updated for user ${userId} to ${role} by admin ${req.user.userId}`);
    res.json({ success: true, message: 'Role assigned successfully' });

  } catch (err) {
    console.error('❌ Update role error:', err);
    res.status(500).json({ success: false, error: 'Failed to assign role' });
  }
});

// Update user information
router.put('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      first_name, last_name, email, phone, legal_address, 
      city, zip, country, business_name 
    } = req.body;

    // Get current user to verify admin permissions
    const { getPool } = await import('../database/db.js');
    const pool = await getPool();
    
    const [currentUser] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (currentUser.length === 0) {
      return res.status(404).json({ success: false, error: 'Current user not found' });
    }

    // Only admins can update other users' information
    if (currentUser[0].role !== 'admin' && parseInt(userId) !== parseInt(req.user.userId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only admins can update other users\' information' 
      });
    }

    // Construct dynamic update query
    const fields = [];
    const values = [];

    if (first_name !== undefined) { fields.push('first_name = ?'); values.push(first_name); }
    if (last_name !== undefined) { fields.push('last_name = ?'); values.push(last_name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone); }
    if (legal_address !== undefined) { fields.push('legal_address = ?'); values.push(legal_address); }
    if (city !== undefined) { fields.push('city = ?'); values.push(city); }
    if (zip !== undefined) { fields.push('zip = ?'); values.push(zip); }
    if (country !== undefined) { fields.push('country = ?'); values.push(country); }
    if (business_name !== undefined) { fields.push('business_name = ?'); values.push(business_name); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    values.push(userId);

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log(`✅ User information updated for user ${userId} by admin ${req.user.userId}`);
    res.json({ success: true, message: 'User information updated successfully' });

  } catch (err) {
    console.error('❌ Update user error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user information' });
  }
});

export default router;
