const { getFirestore, getAuth } = require('../config/firebase');
const admin = require('firebase-admin');

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

    const auth = getAuth();
    const db = getFirestore();

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name: name,
      email: email,
      role: role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create custom token for authentication
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token: token,
      user: {
        uid: userRecord.uid,
        name: name,
        email: email,
        role: role,
      }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        error: 'Password should be at least 6 characters'
      });
    }

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

    const auth = getAuth();
    const db = getFirestore();

    // Get user by email
    const userRecord = await auth.getUserByEmail(email);

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User data not found'
      });
    }

    const userData = userDoc.data();

    // Create custom token for authentication
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({
      success: true,
      message: 'Sign in successful',
      token: token,
      user: {
        uid: userRecord.uid,
        name: userData.name,
        email: userRecord.email,
        role: userData.role,
      }
    });
  } catch (error) {
    console.error('Sign in error:', error);

    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

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

    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    const db = getFirestore();

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        name: userData.name,
        email: decodedToken.email,
        role: userData.role,
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

module.exports = {
  signUp,
  signIn,
  verifyToken
};
