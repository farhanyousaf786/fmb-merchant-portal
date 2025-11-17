import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: 'Hassan',
    lastName: 'Bashar',
    email: 'hassanbashar@gmail.com',
    phone: '08054679108',
    country: 'Saudi Arabia',
    address: '098 Siwak Bake and Food',
    role: 'Merchant'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    // Handle save logic here
  };

  const handleCancel = () => {
    // Reset form or navigate away
    console.log('Cancelled changes');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="settings-container">
          {/* Header with Search */}
          <div className="settings-header">
            <div className="search-section">
              <input 
                type="text" 
                placeholder="Search by Invoice ID or Customer Name"
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <button className="notification-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#6B7280" strokeWidth="2" fill="none"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#6B7280" strokeWidth="2" fill="none"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="settings-content">
            <h1>Profile & Settings</h1>
            
            <div className="settings-layout">
              {/* Left Sidebar */}
              <div className="settings-sidebar">
                <button 
                  className={`sidebar-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile Info
                </button>
                <button 
                  className={`sidebar-tab ${activeTab === 'business' ? 'active' : ''}`}
                  onClick={() => setActiveTab('business')}
                >
                  Business Details
                </button>
                <button 
                  className={`sidebar-tab ${activeTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delivery')}
                >
                  Delivery Address
                </button>
                <button 
                  className={`sidebar-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  Notifications
                </button>
                <button 
                  className={`sidebar-tab ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  Security
                </button>
                <button 
                  className={`sidebar-tab delete ${activeTab === 'delete' ? 'active' : ''}`}
                  onClick={() => setActiveTab('delete')}
                >
                  Delete account
                </button>
              </div>

              {/* Right Content */}
              <div className="settings-main-content">
                {activeTab === 'profile' && (
                  <div className="profile-section">
                    <h2>Profile info</h2>
                    
                    <div className="avatar-section">
                      <label>Avatar</label>
                      <div className="avatar-container">
                        <div className="avatar-image">
                          <img 
                            src="https://via.placeholder.com/80x80/3B82F6/FFFFFF?text=HB" 
                            alt="Profile Avatar"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="avatar-fallback"
                            style={{ display: 'none' }}
                          >
                            HB
                          </div>
                          <button className="avatar-edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 20h9" stroke="white" strokeWidth="2"/>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="white" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-with-edit">
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                          <button className="edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 20h9" stroke="#F59E0B" strokeWidth="2"/>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#F59E0B" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Last Name</label>
                        <div className="input-with-edit">
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                          <button className="edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 20h9" stroke="#F59E0B" strokeWidth="2"/>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#F59E0B" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label>Email Address</label>
                        <div className="input-with-status">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                          <span className="verified-badge">Verified</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Phone Number</label>
                        <div className="input-with-edit">
                          <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                          <button className="edit-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 20h9" stroke="#F59E0B" strokeWidth="2"/>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="#F59E0B" strokeWidth="2"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Role/Account type</label>
                        <input
                          type="text"
                          name="role"
                          value={formData.role}
                          className="form-input"
                          readOnly
                        />
                      </div>

                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                      </button>
                      <button className="save-btn" onClick={handleSave}>
                        Save changes
                      </button>
                    </div>
                  </div>
                )}

                {activeTab !== 'profile' && (
                  <div className="placeholder-content">
                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h2>
                    <p>This section is under development.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
