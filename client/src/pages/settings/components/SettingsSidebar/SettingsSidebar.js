import React from 'react';
import './SettingsSidebar.css';

const SettingsSidebar = ({ activeTab, setActiveTab, isAdmin }) => {
  return (
    <div className="settings-sidebar">
      <button
        className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => setActiveTab('profile')}
      >
        Profile Info
      </button>
      <button
        className={`settings-nav-btn ${activeTab === 'business' ? 'active' : ''}`}
        onClick={() => setActiveTab('business')}
      >
        Business Details
      </button>
      <button
        className={`settings-nav-btn ${activeTab === 'preferences' ? 'active' : ''}`}
        onClick={() => setActiveTab('preferences')}
      >
        Preferences
      </button>
      <button
        className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
        onClick={() => setActiveTab('notifications')}
      >
        Notifications
      </button>
      <button
        className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
        onClick={() => setActiveTab('security')}
      >
        Security
      </button>
      {isAdmin && (
        <button
          className={`settings-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management
        </button>
      )}
      {isAdmin && (
        <button className="settings-nav-btn delete-account-btn">
          Delete account
        </button>
      )}
    </div>
  );
};

export default SettingsSidebar;
