import db from "../models/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get current user data
const getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Get user data
    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, role, phone, country, address FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Admin: update a user's password
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Ensure user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update user password error:', error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC');
    
    res.json({
      success: true,
      users: rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Delete user (will cascade delete their media)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if user exists
    const [users] = await db.query('SELECT id, first_name, last_name FROM users WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = users[0];
    
    // Delete user (this will cascade delete their media due to ON DELETE CASCADE)
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: `User "${user.first_name} ${user.last_name}" and all their media files have been deleted (cascade)`
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

export {
  getCurrentUser,
  getAllUsers,
  deleteUser,
  updateUserPassword
};
