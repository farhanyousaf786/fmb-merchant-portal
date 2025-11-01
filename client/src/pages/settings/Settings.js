import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import SettingsSidebar from './components/SettingsSidebar/SettingsSidebar';
import ProfileInfo from './components/ProfileInfo/ProfileInfo';
import UsersManagement from './components/UsersManagement/UsersManagement';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const isAdmin = user?.role === 'admin';

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="settings-container">
          <header className="settings-header">
            <h1>Profile & Settings</h1>
          </header>

          <div className="settings-layout">
            <SettingsSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              isAdmin={isAdmin} 
            />

            <div className="settings-content-area">
              {activeTab === 'profile' && <ProfileInfo user={user} />}

              {(activeTab === 'business' || activeTab === 'preferences' || 
                activeTab === 'notifications' || activeTab === 'security') && (
                <div className="placeholder-content">
                  <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                  <p>This section is under development.</p>
                </div>
              )}

              {activeTab === 'users' && isAdmin && <UsersManagement user={user} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
