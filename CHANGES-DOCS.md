# Backend Server Integration Changes

## 📅 December 10, 2025

## Required Backend Changes

### 1. Fix Order Tracking Query
**File**: `server/routes/orders.js` - Line 489
```javascript
// Change this:
'ORDER BY updated_at DESC'
// To this:
'ORDER BY created_at DESC'
```

### 2. Add Production React App Serving
**File**: `server/server.js` - Add after API routes (line 64)
```javascript
// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}
```

### 3. Update Package Scripts
**File**: `server/package.json` - Scripts section
```json
{
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "build": "cd ../client && npm run build"
  }
}
```

## Deployment Commands
```bash
cd server
npm run build    # Build React app
npm start        # Start production server
```

## Why These Changes
- Fix database query error (`updated_at` column doesn't exist)
- Enable direct URL access in production (fixes 404 errors)
- Single server deployment (React + API on port 4000)
