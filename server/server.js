const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
const firebaseRoutes = require('./routes/firebaseRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase
initializeFirebase();

// Routes
app.get('/', (req, res) => {
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

// Serve static files from React build (Production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
