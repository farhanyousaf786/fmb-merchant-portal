import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = ({ setUser }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Bypass authentication for now - go directly to dashboard
    try {
      // Simulate loading for better UX
      setTimeout(() => {
        // Set a dummy token and user for now
        localStorage.setItem('authToken', 'dummy-token-for-testing');
        if (setUser) {
          setUser({ 
            id: 1, 
            email: email || 'test@example.com', 
            role: 'merchant',
            firstName: 'Test',
            lastName: 'User',
            businessName: 'Famous Moms Bakery',
            merchantId: '007S1260'
          });
        }
        navigate('/dashboard');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error('Navigation error:', err);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError('');
  };

  const switchMode = () => {
    setIsSignIn(!isSignIn);
    resetForm();
  };

  return (
    <div className="auth-container">
      {/* Left Side - Image Only */}
      <div className="auth-left-section">
        <img 
          src="/assets/images/auth-screen-img.png"
          alt="Bread" 
          className="auth-background-image"
          onError={(e) => {
            console.log('Image failed to load:', e.target.src);
            e.target.src = 'https://via.placeholder.com/800x600/f8f9fa/333?text=Image+Not+Found';
          }}
        />
      </div>

      {/* Right Side - Auth Form */}
      <div className="auth-right-section">
        <div className="auth-form-container">
          {/* Top Right - Role Toggle - Outside card */}
          <div className="top-right-toggle">
            <div className="role-toggle">
              <button className="toggle-btn active">Merchant</button>
              <button className="toggle-btn">Admin</button>
            </div>
          </div>

          {/* White Card Container for form content */}
          <div className="auth-card-content">
            {/* Auth Toggle - Inside card */}
            <div className="auth-toggle-container">
              <div className="auth-toggle">
                <button 
                  className={`toggle-btn ${isSignIn ? 'active' : ''}`}
                  onClick={() => setIsSignIn(true)}
                >
                  Sign in
                </button>
                <button 
                  className={`toggle-btn ${!isSignIn ? 'active' : ''}`}
                  onClick={() => setIsSignIn(false)}
                >
                  Sign up
                </button>
              </div>
            </div>

            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Access your orders, invoices, and support in one place.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              {!isSignIn && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter your last name"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  disabled={loading}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <div className="password-input-container">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                    disabled={loading}
                    className="form-input"
                    minLength={isSignIn ? undefined : 6}
                  />
                  <button type="button" className="password-toggle">
                    👁️
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading 
                  ? (isSignIn ? 'Signing in...' : 'Creating account...') 
                  : (isSignIn ? 'Sign In' : 'Sign Up')
                }
              </button>
            </form>

            <div className="auth-footer">
              <p className="trouble-text">
                Trouble logging in? <a href="#" className="contact-admin">Contact Admin.</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
