# 🚀 Heroku Deployment Guide for FMB Portal

## Prerequisites
- Heroku CLI installed
- Git repository
- Heroku account

## Quick Deployment Steps

### 1. Install Heroku CLI (if not installed)
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Create Heroku App
```bash
heroku create fmb-merchant-portal
# Or use your preferred app name: heroku create your-app-name
```

### 4. Set Environment Variables
```bash
# Set Node environment
heroku config:set NODE_ENV=production

# Add Firebase credentials (replace with your actual values)
heroku config:set FIREBASE_PROJECT_ID=fmc-merchant-portal
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fmc-merchant-portal.iam.gserviceaccount.com

# Or upload service account file (recommended)
# You'll need to convert your serviceAccountKey.json to environment variables
```

### 5. Deploy to Heroku
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### 6. Open Your App
```bash
heroku open
```

## Environment Variables Setup

### Option A: Using Service Account File
Upload your `serviceAccountKey.json` content as environment variables:

```bash
# Extract values from your serviceAccountKey.json and set them:
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="your-private-key"
heroku config:set FIREBASE_CLIENT_EMAIL=your-client-email
```

### Option B: Using Config Vars in Heroku Dashboard
1. Go to your Heroku app dashboard
2. Click "Settings" tab
3. Click "Reveal Config Vars"
4. Add the Firebase credentials manually

## Troubleshooting

### View Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Check Build Status
```bash
heroku ps
```

## Production URLs
- **Your App:** `https://your-app-name.herokuapp.com`
- **API:** `https://your-app-name.herokuapp.com/api`

## Important Notes
- The app will automatically build the React frontend during deployment
- Environment variables are set via Heroku config vars
- The server serves both API and React build files
- Make sure your Firebase credentials are properly set

## Support
If you encounter issues, check:
1. Heroku logs: `heroku logs --tail`
2. Build logs in Heroku dashboard
3. Environment variables are correctly set
