import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Lazy load components for better performance
const Auth = React.lazy(() => import('./pages/auth/Auth'));
const SignUp = React.lazy(() => import('./pages/SignUp/SignUp'));
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Users = React.lazy(() => import('./pages/users/Users'));
const Orders = React.lazy(() => import('./pages/orders/Orders'));
const Catalogs = React.lazy(() => import('./pages/catalog/Catalog'));
const Checkouts = React.lazy(() => import('./pages/checkout_page/Checkouts'));
const Invoices = React.lazy(() => import('./pages/invoices/Invoices'));
const Trackings = React.lazy(() => import('./pages/tracking_page/Trackings'));
const Reviews = React.lazy(() => import('./pages/reviews/reviews'));
const Support = React.lazy(() => import('./pages/support_page/Support'));
const Settings = React.lazy(() => import('./pages/settings/Settings'));

// Loading component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/signin" />;
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in and fetch user data from server
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserData(token);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        // Token invalid, logout
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/auth" element={<Auth setUser={setUser} />} />
            <Route path="/signin" element={<Auth setUser={setUser} />} />
            <Route path="/signup" element={<Auth setUser={setUser} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Users user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalogs"
              element={
                <ProtectedRoute>
                  <Catalogs user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkouts"
              element={
                <ProtectedRoute>
                  <Checkouts user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <Invoices user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trackings"
              element={
                <ProtectedRoute>
                  <Trackings user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <Reviews user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support-page"
              element={
                <ProtectedRoute>
                  <Support user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings user={user} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
