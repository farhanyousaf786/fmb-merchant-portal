# 🚀 Replit Setup Guide for FMB Portal

## Step-by-Step Instructions

### 1. Create New Replit Project

1. Go to [Replit.com](https://replit.com)
2. Click **"Create Repl"**
3. Choose **"Import from GitHub"**
4. Paste your repository URL: `https://github.com/farhanyousaf786/fmb-portal`
5. Name it: **"fmb"**
6. Click **"Import from GitHub"**

### 2. Configure Secrets (Important!)

In your Replit project:

1. Click **"Tools"** (🔧 icon on left sidebar)
2. Click **"Secrets"** 
3. Add these secrets:

```
PORT = 5001
NODE_ENV = production
FIREBASE_SERVICE_ACCOUNT_PATH = ./serviceAccountKey.json
```

### 3. Upload Firebase Service Account Key

1. In Replit, go to the `server` folder
2. Click **"Upload file"**
3. Upload your `serviceAccountKey.json` file
4. Make sure it's inside the `server` folder

### 4. Update Client Environment

1. Open `client/.env`
2. Change the API URL to:
```
REACT_APP_API_URL=/api
```

This tells the frontend to use the same domain for API calls (since everything is on one Replit now).

### 5. Run the Project

Simply click the **"Run"** button at the top!

Replit will:
- Install all dependencies
- Build the React frontend
- Start the server
- Your app will be live!

### 6. Access Your App

After it starts, you'll see:
- **Main URL**: Your app's public URL (looks like: `fmb.username.repl.co`)
- This URL serves both the website AND the API

### 7. Test It

1. Open the Replit URL
2. You should see the Sign In page
3. Try creating an account
4. Test signing in
5. Check the dashboard

---

## Important Notes

### ✅ What's Different on Replit:

1. **Single URL**: Frontend and backend run on the same URL
2. **Automatic HTTPS**: Replit provides secure HTTPS automatically
3. **Always On**: Keep the Repl alive by using "Always On" feature (paid)
4. **Public Access**: Anyone with the link can access it

### 🔒 Security on Replit:

- ✅ Firebase credentials stored as Secrets (safe)
- ✅ `.env` files not exposed
- ✅ Service account key not in public code
- ✅ All API calls secure

### 💡 Free Tier Limitations:

- Repl goes to sleep after inactivity
- May be slow to wake up
- Limited CPU/memory
- For testing/demo purposes

### 🚀 To Keep It Always On:

Upgrade to Replit Hacker plan ($7/month) for:
- Always on
- Faster performance
- More resources
- Custom domains

---

## Troubleshooting

### If "Run" button doesn't work:

Open Shell and run:
```bash
npm run start:replit
```

### If Firebase fails:

1. Check Secrets are set correctly
2. Make sure `serviceAccountKey.json` is uploaded to `server` folder
3. Check file path in Secrets matches the file location

### If frontend doesn't load:

1. Make sure build completed successfully
2. Check `client/build` folder exists
3. Try running: `cd client && npm run build`

---

## File Structure on Replit

```
fmb/  (your Replit project)
├── .replit              # Replit config (tells how to run)
├── replit.nix           # Replit environment
├── package.json         # Root package file
│
├── client/              # React frontend
│   ├── build/          # Built files (created automatically)
│   ├── src/
│   └── package.json
│
└── server/              # Node.js backend
    ├── serviceAccountKey.json  # Upload this!
    ├── .env
    ├── server-replit.js        # Server for Replit
    └── package.json
```

---

## Quick Commands

In Replit Shell:

```bash
# Install everything
npm run install-all

# Build frontend
npm run build-client

# Start server (development)
cd server && npm run dev

# Start for Replit (production)
npm run start:replit
```

---

## Your Replit URL

Once deployed, your URL will be something like:
- `https://fmb.yourusername.repl.co`

Share this URL with your client to test!

---

## Need Help?

If you encounter issues:
1. Check the Replit console for errors
2. Make sure all secrets are set
3. Verify Firebase file is uploaded
4. Try clicking "Run" again

---

**Your project is ready for Replit! Just follow the steps above.** 🎉
