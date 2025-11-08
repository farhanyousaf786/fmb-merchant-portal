import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/SignUp/SignUp';
import Dashboard from './pages/dashboard/Dashboard';
import Users from './pages/users/Users';
import Orders from './pages/orders/Orders';
import Catalogs from './pages/catalogs/Catalogs';
import Checkouts from './pages/checkout_page/Checkouts';
import Invoices from './pages/invoices/Invoices';
import Trackings from './pages/tracking_page/Trackings';
import Support from './pages/support_page/Support';
import Settings from './pages/settings/Settings';

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
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signin" element={<SignIn setUser={setUser} />} />
          <Route path="/signup" element={<SignUp />} />
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
      </div>
    </Router>
  );
}

export default App;
