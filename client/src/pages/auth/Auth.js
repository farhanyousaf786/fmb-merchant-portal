import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Auth = ({ setUser }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [role, setRole] = useState('merchant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!isSignIn) {
        // Handle signup
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/admin/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            business_name: businessName,
            email: email,
            password: password,
            phone: phone,
            legal_address: address,
            country: 'N/A',
            city: city,
            zip: zip,
            role: role,
            primary_contact_name: `${firstName} ${lastName}`
          })
        });

        const data = await response.json();
        if (data.success) {
          // Redirect to pending page after successful signup
          navigate('/pending');
        } else {
          setError(data.error || 'Failed to submit application');
        }
        setLoading(false);
        return;
      }

      // Handle signin
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Check if user exists but is inactive
        if (data.error === 'Account is inactive') {
          navigate('/pending');
          return;
        }
        setError(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      // Save token and user from backend (AdminUser)
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      if (setUser && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          status: data.user.status,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          businessName: data.user.business_name,
          userType: data.user.user_type,
        });
      }

      navigate('/dashboard');
      setLoading(false);
    } catch (err) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setBusinessName('');
    setPhone('');
    setAddress('');
    setCity('');
    setZip('');
    setRole('merchant');
    setError('');
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
      

          {/* White Card Container for form content */}
          <div className="auth-card-content">
            {/* Auth Toggle */}
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
              <h2>
                {isSignIn 
                  ? 'Welcome Back!' 
                  : 'Join FMB Merchant Portal'
                }
              </h2>
              <p>
                {isSignIn 
                  ? 'Sign in to access your dashboard, manage orders, and grow your business.' 
                  : 'Apply for merchant access and start selling with FMB. Manual approval required.'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              {!isSignIn && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">First Name *</label>
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
                      <label htmlFor="lastName" className="form-label">Last Name *</label>
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

                  <div className="form-group">
                    <label htmlFor="businessName" className="form-label">Business Name *</label>
                    <input
                      type="text"
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Enter your business name"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone number"
                        required
                        disabled={loading}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="city" className="form-label">City *</label>
                      <input
                        type="text"
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        required
                        disabled={loading}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Address *</label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your business address"
                      required
                      disabled={loading}
                      className="form-input"
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="zip" className="form-label">Zip *</label>
                    <input
                      type="text"
                      id="zip"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="ZIP code"
                      required
                      disabled={loading}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role" className="form-label">Role *</label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      disabled={loading}
                      className="form-input"
                    >
                      <option value="merchant">Merchant</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                </>
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
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                    disabled={loading}
                    className="form-input"
                    minLength={!isSignIn ? 6 : undefined}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-button" disabled={loading}>
                {loading 
                  ? (isSignIn ? 'Signing in...' : 'Submitting Application...') 
                  : (isSignIn ? 'Sign In' : 'Submit Application')
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
