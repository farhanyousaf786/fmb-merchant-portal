# Pages Directory

This directory contains all the main page components for the FMB Merchant Portal.

## Pages

### 📝 SignIn.js
- **Route:** `/signin`
- **Purpose:** User authentication page
- **Features:**
  - Email and password login
  - Remember me option
  - Forgot password link
  - Link to sign up page
  - Form validation
  - Loading states
  - Error handling

### 📝 SignUp.js
- **Route:** `/signup`
- **Purpose:** New merchant registration
- **Features:**
  - Business name and owner name fields
  - Email and phone number
  - Password with confirmation
  - Terms and conditions checkbox
  - Form validation (password match, length)
  - Loading states
  - Error handling
  - Link to sign in page

### 📊 Dashboard.js
- **Route:** `/dashboard` (Protected)
- **Purpose:** Main merchant dashboard
- **Features:**
  - Welcome message with business name
  - Statistics cards (orders, revenue)
  - Recent orders section
  - Logout functionality
  - Protected route (requires authentication)

## Styling

Each page has its own CSS file:
- `SignIn.css` - Sign in page styles
- `SignUp.css` - Sign up page styles
- `Dashboard.css` - Dashboard styles

All pages use a consistent design with:
- Purple gradient theme (#667eea to #764ba2)
- Modern card-based layouts
- Smooth animations
- Responsive design
- Hover effects

## Authentication Flow

1. User visits `/` → Redirected to `/signin`
2. User can navigate to `/signup` to create account
3. After successful login/signup → Redirected to `/dashboard`
4. Dashboard is protected - requires valid token in localStorage
5. Logout clears token and redirects to `/signin`

## API Integration

Pages are configured to connect to backend at `http://localhost:5001/api`

**Endpoints used:**
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up

## Local Storage

The app stores:
- `authToken` - JWT authentication token
- `user` - User object with business details

## TODO

- [ ] Connect to Firebase Authentication
- [ ] Implement real-time order updates
- [ ] Add forgot password functionality
- [ ] Add email verification
- [ ] Add profile settings page
- [ ] Add order management pages
