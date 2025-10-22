# FMB Merchant Portal

A full-stack merchant portal for the FanMunch delivery system with React frontend and Node.js backend.

## 🚀 Project Structure

```
fmb-merchant-portal/
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Firebase configuration
│   ├── controllers/       # API controllers
│   ├── routes/            # API routes
│   ├── .env               # Environment variables (not in git)
│   ├── serviceAccountKey.json  # Firebase credentials (not in git)
│   └── package.json
└── README.md
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account with Firestore enabled

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fmb-merchant-portal
```

### 2. Setup Server

```bash
cd server
npm install
```

**Configure Firebase:**
- Get your Firebase service account key from [Firebase Console](https://console.firebase.google.com/)
- Save it as `serviceAccountKey.json` in the `server/` directory
- Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Start the server:**
```bash
npm run dev    # Development with nodemon
npm start      # Production
```

Server runs on: `http://localhost:5001`

### 3. Setup Client

```bash
cd client
npm install
npm start
```

Client runs on: `http://localhost:3000`

## 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Click "Generate new private key"
6. Save the downloaded JSON as `serviceAccountKey.json` in `server/` directory

## 🌐 API Endpoints

Base URL: `http://localhost:5001/api`

### Firebase Routes

- `GET /firebase/:collection` - Get all documents
- `GET /firebase/:collection/:id` - Get document by ID
- `POST /firebase/:collection` - Create new document
- `PUT /firebase/:collection/:id` - Update document
- `DELETE /firebase/:collection/:id` - Delete document
- `POST /firebase/auth/verify` - Verify Firebase auth token

## 🛡️ Security Notes

**IMPORTANT:** Never commit these files to Git:
- `server/.env`
- `server/serviceAccountKey.json`
- Any Firebase credentials

These are already in `.gitignore` for your protection.

## 📦 Tech Stack

### Frontend
- React 18.2.0
- React Scripts 5.0.1

### Backend
- Node.js
- Express 4.18.2
- Firebase Admin SDK 11.11.0
- dotenv 16.3.1
- nodemon 3.0.1 (dev)

## 🚀 Deployment

### Backend
- Deploy to services like Heroku, Railway, or Render
- Set environment variables in deployment platform
- Upload Firebase service account key securely

### Frontend
- Deploy to Vercel, Netlify, or similar
- Update API endpoint URLs to production backend

## 📝 License

Private project for FanMunch delivery system.
