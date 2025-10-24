import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Settings</h1>
            <p>Configure your account and application preferences</p>
          </header>
          <div className="content-placeholder">
            <h2>⚙️ Account Settings</h2>
            <p>This page will show account settings, preferences, and configuration options.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
