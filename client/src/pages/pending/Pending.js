import React from 'react';
import { useNavigate } from 'react-router-dom';
import colors from '../../utils/colors';
import './Pending.css';

const Pending = () => {
  const navigate = useNavigate();

  return (
    <div className="pending-container">
      <div className="pending-card">
        <div className="pending-icon">
          <div className="clock-icon">⏳</div>
        </div>
        
        <div className="pending-content">
          <h1>Application Under Review</h1>
          <p className="pending-subtitle">
            Your merchant application is being reviewed by our team
          </p>
          
          <div className="status-info">
            <div className="status-item">
              <div className="status-dot pending"></div>
              <span>Application Submitted</span>
            </div>
            <div className="status-item">
              <div className="status-dot pending"></div>
              <span>Under Review</span>
            </div>
            <div className="status-item">
              <div className="status-dot inactive"></div>
              <span>Approval Pending</span>
            </div>
          </div>

          <div className="info-box">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your application within 1-2 business days</li>
              <li>You'll receive an email notification once approved</li>
              <li>After approval, you can sign in to access your dashboard</li>
            </ul>
          </div>

          <div className="contact-info">
            <p>Need help? Contact our support team:</p>
            <a href="mailto:support@fmb.com" className="contact-link">
              support@fmb.com
            </a>
          </div>

          <button 
            className="back-btn"
            onClick={() => navigate('/auth')}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pending;
