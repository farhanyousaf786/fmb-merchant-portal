import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import EditDialog from './components/EditDialog/EditDialog';
import BusinessDetails from './components/BusinessDetails';
import DeliveryAddress from './components/DeliveryAddress';
import Toast from '../../components/Toast/Toast';
import './Settings.css';

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
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
    role: '',
    avatar_url: ''
  });

  // Populate form with user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log('👤 User data received:', user);
      console.log('🖼️ Avatar URL from user:', user.avatar_url);
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.country || '',
        address: user.legal_address || user.address || '',
        role: user.role || '',
        avatar_url: user.avatar_url || ''
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
      let avatarUrl = null;

      // Upload avatar if selected
      if (selectedAvatarFile) {
        console.log('📤 Uploading avatar...');
        const formData = new FormData();
        formData.append('avatar', selectedAvatarFile);

        const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL}/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: formData
        });

        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);

        if (uploadResponse.ok && uploadData.success) {
          avatarUrl = uploadData.url;
          console.log('✅ Avatar uploaded:', avatarUrl);
        } else {
          setToast({ type: 'error', message: 'Failed to upload avatar' });
          return;
        }
      }

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

      // Add avatar URL if uploaded
      if (avatarUrl) {
        snakeCaseFormData.avatar_url = avatarUrl;
      }

      console.log('📝 Sending to backend:', snakeCaseFormData);

      // Send to backend API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(snakeCaseFormData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success) {
        // Update local state with new data
        setFormData({ ...editFormData });
        setIsEditDialogOpen(false);
        setSelectedAvatarFile(null);
        setAvatarPreview(null);
        setToast({ type: 'success', message: '✅ Profile updated successfully!' });
        console.log('✅ Profile saved successfully');
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to save changes' });
        console.error('❌ Save failed:', data.error);
      }
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setToast({ type: 'error', message: 'Error saving profile. Please try again.' });
    }
  };

  // Handle avatar selection from dialog
  const handleAvatarSelect = (file, preview) => {
    setSelectedAvatarFile(file);
    setAvatarPreview(preview);
    console.log('📷 Avatar selected:', file.name);
  };

  // Close dialog without saving
  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setSelectedAvatarFile(null);
    setAvatarPreview(null);
  };

  // Save business details
  const handleBusinessSave = async (businessData) => {
    try {
      console.log('📝 Saving business details:', businessData);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(businessData)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        // Update local state
        setFormData(prev => ({ ...prev, ...businessData }));
        setToast({ type: 'success', message: '✅ Business details updated successfully!' });
      } else {
        setToast({ type: 'error', message: data.error || 'Failed to update business details' });
      }
    } catch (error) {
      console.error('❌ Error saving business details:', error);
      setToast({ type: 'error', message: 'Error updating business details' });
    }
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
                {user?.role !== 'merchant' && (
                  <>
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
                  </>
                )}
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
                      <div className="avatar-container">
                        <div className="avatar-image">
                          {formData.avatar_url ? (
                            <>
                              {console.log('✅ Showing uploaded avatar:', formData.avatar_url)}
                              {console.log('🌐 Full avatar URL:', `http://localhost:4000${formData.avatar_url}`)}
                              <img 
                                src={`http://localhost:4000${formData.avatar_url}`}
                                alt="Profile Avatar"
                                onError={(e) => {
                                  console.error('❌ Avatar image failed to load from:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            </>
                          ) : (
                            <>
                              {console.log('ℹ️ No avatar URL, showing initials')}
                              <img 
                                src={`https://via.placeholder.com/80x80/DEAD25/FFFFFF?text=${getUserInitials()}`}
                                alt="Profile Avatar"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            </>
                          )}
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
                )

}

                {activeTab === 'business' && (
                  <BusinessDetails user={user} onSave={handleBusinessSave} />
                )}

                {activeTab === 'delivery' && (
                  <DeliveryAddress />
                )}

                {activeTab !== 'profile' && activeTab !== 'business' && activeTab !== 'delivery' && (
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
        onAvatarSelect={handleAvatarSelect}
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
