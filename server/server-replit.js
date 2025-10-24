const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
const firebaseRoutes = require('./routes/firebaseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase
initializeFirebase();

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'FMB Portal API',
    version: '1.0.0',
    status: 'running'
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Firebase routes
app.use('/api/firebase', firebaseRoutes);

// Serve React frontend
app.use(express.static(path.join(__dirname, '../client/build')));

// All other routes go to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 FMB Portal is running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});
