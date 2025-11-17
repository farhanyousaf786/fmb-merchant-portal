import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import EditDialog from './components/EditDialog/EditDialog';
import Toast from '../../components/Toast/Toast';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    role: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    address: '',
    role: ''
  });

  // Populate form with user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        address: user.legal_address || user.address || '',
        role: user.role || ''
      });
    }
  }, [user]);

  // Generate user initials for avatar
  const getUserInitials = () => {
    const firstName = formData.firstName || user?.first_name || '';
    const lastName = formData.lastName || user?.last_name || '';
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial || 'U';
  };

  // Open edit dialog and populate with current data
  const handleEditClick = () => {
    setEditFormData({ ...formData });
    setIsEditDialogOpen(true);
  };

  // Handle input changes in edit dialog
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`Updated ${name} to ${value}`); // Updated console logging
  };

  // Save changes from dialog
  const handleSaveChanges = async () => {
    try {
      // Convert camelCase to snake_case
      const snakeCaseFormData = Object.keys(editFormData).reduce((acc, key) => {
        const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        if (snakeCaseKey === 'address') {
          acc['legal_address'] = editFormData[key];
        } else {
          acc[snakeCaseKey] = editFormData[key];
        }
        return acc;
      }, {});

      // Update local state
      setFormData({ ...editFormData });
      console.log('Updated profile data:', editFormData); // Updated console logging

      // Send to backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(snakeCaseFormData)
      });

      const data = await response.json();
      if (data.success) {
        setToast({ type: 'success', message: 'Changes saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save changes' });
      }

      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({ type: 'error', message: 'Failed to save changes' });
    }
  };

  // Close dialog without saving
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
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
                value=""
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
                    <div className="profile-header">
                      <h2>Profile info</h2>
                      <button className="edit-profile-btn" onClick={handleEditClick}>
                        Edit
                      </button>
                    </div>
                    
                    <div className="avatar-section">
                      <label>Avatar</label>
                      <div className="avatar-container">
                        <div className="avatar-image">
                          <img 
                            src={`https://via.placeholder.com/80x80/DEAD25/FFFFFF?text=${getUserInitials()}`}
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
                            {getUserInitials()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          readOnly
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          readOnly
                          className="form-input"
                        />
                      </div>

                      <div className="form-group full-width">
                        <label>Email Address</label>
                        <div className="input-with-status">
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            readOnly
                            className="form-input"
                          />
                          <span className="verified-badge">Verified</span>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          readOnly
                          className="form-input"
                        />
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
                          readOnly
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          readOnly
                          className="form-input"
                        />
                      </div>
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

      {/* Edit Dialog Component */}
      <EditDialog
        isOpen={isEditDialogOpen}
        editFormData={editFormData}
        onInputChange={handleEditInputChange}
        onSave={handleSaveChanges}
        onCancel={handleCancelEdit}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;
