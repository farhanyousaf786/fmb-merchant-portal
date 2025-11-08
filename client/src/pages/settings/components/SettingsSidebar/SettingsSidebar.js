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
      {isAdmin && (
        <button
          className={`settings-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management
        </button>
      )}
    </div>
  );
};

export default SettingsSidebar;
