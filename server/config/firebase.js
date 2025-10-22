const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let firebaseApp;

const initializeFirebase = () => {
  try {
    // Option 1: Using service account file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(serviceAccountPath);
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully with service account');
    } 
    // Option 2: Using environment variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
      console.log('Firebase Admin initialized successfully with environment variables');
    } else {
      console.warn('⚠️  Firebase credentials not configured. Firebase APIs will not work.');
      console.warn('   Please configure .env file with your Firebase credentials.');
    }

    return firebaseApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    return null;
  }
};

const getFirestore = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.firestore();
};

const getAuth = () => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getFirestore,
  getAuth,
  admin
};
