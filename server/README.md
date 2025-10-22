# FMB Merchant Portal - Server

Backend API server for FMB Merchant Portal with Firebase integration.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials in `.env`
   
   **Option 1:** Use service account JSON file
   - Download your Firebase service account key from Firebase Console
   - Save it as `serviceAccountKey.json` in the server directory
   - Set `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json` in `.env`

   **Option 2:** Use environment variables
   - Set `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, and `FIREBASE_CLIENT_EMAIL` in `.env`

3. **Run the server:**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
- `GET /` - Server status

### Firebase Auth
- `POST /api/firebase/auth/verify` - Verify Firebase auth token

### Firestore Operations
- `GET /api/firebase/:collection` - Get all documents from a collection
- `GET /api/firebase/:collection/:id` - Get a specific document
- `POST /api/firebase/:collection` - Create a new document
- `PUT /api/firebase/:collection/:id` - Update a document
- `DELETE /api/firebase/:collection/:id` - Delete a document

## Project Structure

```
server/
├── config/
│   └── firebase.js          # Firebase configuration
├── controllers/
│   └── firebaseController.js # Firebase API controllers
├── routes/
│   └── firebaseRoutes.js    # Firebase routes
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── server.js                # Main server file
└── package.json             # Dependencies
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to service account JSON file
