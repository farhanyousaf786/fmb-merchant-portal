import React from 'react';
import './WelcomeBar.css';

const WelcomeBar = ({ user }) => {
  return (
    <div className="welcome-bar">
      <div className="welcome-text">
        <h2>Welcome back, Manager!</h2>
        <p>Here's what is happening in today.</p>
      </div>
      <div className="welcome-actions">
        <div className="search-container">
          <input 
            className="search-input" 
            placeholder="Search anything"
            type="text"
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="notification-btn" title="Notifications">
          <img 
            src="/assets/icons/notification-icon.svg" 
            alt="Notifications" 
            className="notification-icon"
            onError={(e) => {
              console.log('Notification icon failed to load:', e.target.src);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'inline';
            }}
            onLoad={() => {
              console.log('Notification SVG icon loaded successfully');
            }}
          />
          <span className="notification-fallback" style={{display: 'none'}}>🔔</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeBar;
