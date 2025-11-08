import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/db.js";
import UserFactory from "../models/UserFactory.js";
import Merchant from "../models/Merchant.js";

// Sign Up - Create new business registration (pending approval)
const signUp = async (req, res) => {
  try {
    console.log("🔍 SignUp request received:", req.body);
    
    const { 
      first_name,
      last_name,
      email, 
      password, 
      phone,
      business_name, 
      legal_address, 
      primary_contact_name 
    } = req.body;

    console.log("📋 Extracted fields:", {
      first_name,
      last_name,
      email,
      password: password ? "***" : "missing",
      phone,
      business_name,
      legal_address,
      primary_contact_name
    });

    // Validate input - allow empty last_name if only first name provided
    if (!first_name || !email || !password || !phone || !business_name || !legal_address || !primary_contact_name) {
      console.log("❌ Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields: Business Name, Legal Address, Primary Contact, Email, Phone, and Password'
      });
    }

    // Handle case where last_name is empty (single name provided)
    const finalLastName = last_name || '';

    console.log("✅ Input validation passed");

    // Check if user already exists
    const existingUser = await UserFactory.findByEmail(email);
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    console.log("✅ User does not exist, proceeding with creation");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("✅ Password hashed");

    // Create new merchant using Merchant model
    console.log("👤 Creating merchant...");
    const merchant = await Merchant.create({
      first_name: first_name.trim(),
      last_name: finalLastName.trim(),
      email: email.trim(),
      password: hashedPassword,
      phone: phone.trim(),
      business_name: business_name.trim(),
      legal_address: legal_address.trim(),
      primary_contact_name: primary_contact_name.trim()
    });

    console.log("✅ Merchant created successfully:", merchant.id);

    res.status(201).json({
      success: true,
      message: 'Sign-up submitted successfully. Your account is pending approval by FMB.',
      user: merchant.toSafeObject()
    });
  } catch (error) {
    console.error('❌ Sign-up error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to submit sign-up: ' + error.message
    });
  }
};

// Sign In - Authenticate user
const signIn = async (req, res) => {
  try {
    console.log("🔍 SignIn request received:", { email: req.body.email, password: req.body.password ? "***" : "missing" });
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("❌ SignIn validation failed - missing email or password");
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    console.log("✅ SignIn validation passed");

    // Find user by email using UserFactory
    const user = await UserFactory.findByEmail(email);
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log("✅ User found:", { id: user.id, role: user.role, status: user.status });

    // Check if user is approved
    if (!user.isApproved()) {
      console.log("❌ User not approved:", user.status);
      return res.status(401).json({
        success: false,
        error: 'Your account is pending approval. Please wait for admin approval.'
      });
    }

    // Check if user is rejected
    if (user.isRejected()) {
      console.log("❌ User rejected:", user.status);
      return res.status(401).json({
        success: false,
        error: 'Your account has been rejected. Please contact support.'
      });
    }

    console.log("✅ User status approved");

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("❌ Invalid password");
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log("✅ Password validated");

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log("✅ SignIn successful for:", email);

    res.json({
      success: true,
      message: 'Sign-in successful',
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('❌ Sign-in error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to sign in'
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
