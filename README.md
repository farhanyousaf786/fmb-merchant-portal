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
│   ├── config/            # Database configuration
│   ├── controllers/       # API controllers
│   ├── routes/            # API routes
│   ├── .env               # Environment variables (not in git)
│   └── package.json
└── README.md
```

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database server

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

**Configure Database:**
- Set up a MySQL database server
- Create a database named `fmb_portal` (or use your preferred name)
- Copy `.env.example` to `.env` and configure your database connection:

```bash
cp .env.example .env
```

Edit the `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=fmb_portal
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
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

## 🗄️ Database Setup

The application will automatically create the necessary tables when you start the server for the first time. Make sure your MySQL server is running and the database exists.

### Database Schema

The `users` table will be created with the following structure:
- `id` - Auto-incrementing primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (admin or merchant)
- `created_at` - Timestamp of creation
- `updated_at` - Timestamp of last update

## 🌐 API Endpoints

Base URL: `http://localhost:5001/api`

### Authentication Routes

- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Authenticate user and get token
- `POST /auth/verify` - Verify JWT token

## 🛡️ Security Notes

**IMPORTANT:** Never commit these files to Git:
- `server/.env` - Contains database credentials and JWT secret
- Any database credentials or sensitive configuration

These are already in `.gitignore` for your protection.

## 📦 Tech Stack

### Frontend
- React 18.2.0
- React Scripts 5.0.1

### Backend
- Node.js
- Express 4.21.2
- MySQL2 3.6.5
- bcrypt 5.1.1 (password hashing)
- jsonwebtoken 9.0.2 (authentication)
- dotenv 16.6.1
- nodemon 3.0.1 (dev)

## 🚀 Deployment

### Backend
- Deploy to services like Heroku, Railway, or Render
- Set environment variables in deployment platform
- Configure MySQL database connection securely

### Frontend
- Deploy to Vercel, Netlify, or similar
- Update API endpoint URLs to production backend

## 📝 License

Private project for FanMunch delivery system.
