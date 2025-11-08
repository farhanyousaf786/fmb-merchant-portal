import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    legalAddress: '',
    primaryContactName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Split primary contact name into first and last name
    const nameParts = formData.primaryContactName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    console.log("🔍 Submitting sign-up:", {
      firstName,
      lastName,
      email: formData.email,
      businessName: formData.businessName,
      legalAddress: formData.legalAddress,
      primaryContactName: formData.primaryContactName,
      phone: formData.phone
    });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          business_name: formData.businessName,
          legal_address: formData.legalAddress,
          primary_contact_name: formData.primaryContactName
        })
      });

      const data = await response.json();
      console.log("📋 Sign-up response:", data);

      if (data.success) {
        setSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit sign-up');
      }
    } catch (error) {
      console.error('❌ Sign-up error:', error);
      alert('Failed to submit sign-up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="signup-container">
        <div className="signup-card">
          <div className="success-icon">✓</div>
          <h2>Sign-up Submitted Successfully!</h2>
          <p>Your application has been received and is pending manual approval by FMB.</p>
          <p>You will be notified once your account is approved.</p>
          <button className="signin-btn" onClick={() => navigate('/signin')}>
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <div className="logo">F</div>
          <h1>Business Sign-Up</h1>
          <p className="subtitle">Register your business for FMB Merchant Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label>Business Name *</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter your registered business name"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Primary Contact Name *</label>
              <input
                type="text"
                name="primaryContactName"
                value={formData.primaryContactName}
                onChange={handleChange}
                placeholder="Full name of the primary contact person"
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Legal Address *</label>
            <textarea
              name="legalAddress"
              value={formData.legalAddress}
              onChange={handleChange}
              placeholder="Enter your official business address for verification"
              required
              rows="3"
              className="form-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Business email address for communications"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Business contact phone number"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a secure password (min. 6 characters)"
              required
              minLength="6"
              className="form-input"
            />
          </div>

          <div className="approval-note">
            <p><strong>Note:</strong> Sign-up is subject to manual approval by FMB.</p>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Sign-Up'}
          </button>
        </form>

        <div className="signin-link">
          Already have an account? <button onClick={() => navigate('/signin')}>Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
