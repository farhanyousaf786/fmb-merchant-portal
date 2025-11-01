import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/db.js";

// Sign Up - Create new user
const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: name, email, password, role'
      });
    }

    // Validate role
    if (!['admin', 'merchant'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "admin" or "merchant"'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password should be at least 6 characters'
      });
    }

    // Check if user already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email, 
        role: role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token: token,
      user: {
        id: result.insertId,
        name: name,
        email: email,
        role: role,
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to create user. Please try again.'
    });
  }
};

// Sign In - Authenticate user
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Get user by email
    const [users] = await db.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to sign in. Please try again.'
    });
  }
};

// Verify Token
const verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Verify JWT token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    // Get user data from database
    const [users] = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decodedToken.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = users[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export {
  signUp,
  signIn,
  verifyToken
};
