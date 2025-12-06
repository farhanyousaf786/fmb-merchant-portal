# FMB Merchant Portal - API Documentation

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 18 (Create React App) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (JSON Web Tokens) |
| **Payments** | Stripe API |
| **File Storage** | Local filesystem (`/uploads`) |
| **PDF Generation** | PDFKit |

## Project Structure

```
fmb-merchant-portal/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── ...
│   ├── .env               # Frontend environment variables
│   └── package.json
│
├── server/                 # Node.js Backend
│   ├── routes/            # API route handlers
│   ├── database/          # Database connection & setup
│   ├── public/uploads/    # Uploaded files
│   ├── api_docs/          # API documentation
│   ├── .env               # Backend environment variables
│   └── package.json
│
└── README.md
```

---

## Deployment Guide

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd fmb-merchant-portal
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fmb_merchant_portal

# Server
PORT=4000

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Stripe (Optional - for live payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Admin Account (created on first run)
ADMIN_EMAIL=fmb@admin.com
ADMIN_PASSWORD=admin
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:4000/api
```

### 4. Database Setup

The database tables are **auto-created** on first server start. Just ensure MySQL is running and the database exists:

```sql
CREATE DATABASE fmb_merchant_portal;
```

### 5. Start Development

**Backend:**
```bash
cd server
npm run dev    # or: nodemon
```

**Frontend:**
```bash
cd client
npm start
```

### 6. Production Build

**Frontend:**
```bash
cd client
npm run build
```

**Backend:**
```bash
cd server
npm start
```

---

## Production Deployment

### Environment Variables (Production)

**Backend `.env`:**
```env
DB_HOST=<production_db_host>
DB_USER=<production_db_user>
DB_PASSWORD=<production_db_password>
DB_NAME=fmb_merchant_portal
PORT=4000
JWT_SECRET=<strong_random_secret>
STRIPE_SECRET_KEY=sk_live_xxx
NODE_ENV=production
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### Recommended Hosting

| Component | Recommended |
|-----------|-------------|
| Frontend | Vercel, Netlify, AWS S3 + CloudFront |
| Backend | AWS EC2, DigitalOcean, Railway, Render |
| Database | AWS RDS, PlanetScale, DigitalOcean MySQL |

### Server Requirements

| Resource | Minimum |
|----------|---------|
| RAM | 1 GB |
| CPU | 1 vCPU |
| Storage | 10 GB |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Categories

| Category | File | Description |
|----------|------|-------------|
| [Authentication](./AUTH.md) | `AUTH.md` | Login, Register, User management |
| [Users](./USERS.md) | `USERS.md` | User profile, All users (admin) |
| [Orders](./ORDERS.md) | `ORDERS.md` | Create, List, Update orders |
| [Payments](./PAYMENTS.md) | `PAYMENTS.md` | Payment methods, Payment intents |
| [Inventory](./INVENTORY.md) | `INVENTORY.md` | Products/Catalog management |
| [Media](./MEDIA.md) | `MEDIA.md` | File uploads |
| [Support](./SUPPORT.md) | `SUPPORT.md` | Tickets & Reviews |

## Quick Reference

### Public Endpoints (No Auth Required)
- `GET /api/health` - Health check
- `POST /api/auth/admin/login` - Login
- `POST /api/auth/admin/register` - Register

### Protected Endpoints (Auth Required)
- All other endpoints require Bearer token

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
