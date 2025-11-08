import React from 'react';
import './WelcomeBar.css';

const WelcomeBar = ({ user }) => {
  return (
    <div className="welcome-bar">
      <div className="welcome-text">
        <h2>Welcome back{user?.first_name ? `, ${user.first_name}` : ''}!</h2>
        <p>Here’s what is happening today.</p>
      </div>
      <div className="welcome-actions">
        <input className="search-input" placeholder="Search anything" />
        <button className="icon-btn" title="Notifications">🔔</button>
      </div>
    </div>
  );
};

export default WelcomeBar;
