import React, { useState, useEffect } from 'react';
import './ProfileInfo.css';

const ProfileInfo = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [displayData, setDisplayData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    address: user?.address || '',
    email: user?.email || '',
    role: user?.role || ''
  });
  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update state when user data arrives
  useEffect(() => {
    if (user) {
      setDisplayData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        country: user.country || '',
        address: user.address || '',
        email: user.email || '',
        role: user.role || ''
      });
      setProfileData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        phone: user.phone || '',
        country: user.country || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    try {
      const updateData = {
        userId: user?.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        country: profileData.country,
        address: profileData.address
      };

      if (profileData.newPassword) {
        updateData.currentPassword = profileData.currentPassword;
        updateData.newPassword = profileData.newPassword;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        alert('Profile updated successfully!');
        
        // Update display data immediately
        setDisplayData({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          country: profileData.country,
          address: profileData.address,
          email: user?.email || '',
          role: user?.role || ''
        });
        
        // Exit edit mode and clear password fields
        setEditMode(false);
        setProfileData({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          country: profileData.country,
          address: profileData.address,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileData({
      firstName: user?.first_name || '',
      lastName: user?.last_name || '',
      phone: user?.phone || '',
      country: user?.country || '',
      address: user?.address || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Show loading while user data is being fetched
  if (!user) {
    return (
      <div className="profile-form-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-form-container">
      <div className="profile-header">
        <h2 className="form-title">Profile info</h2>
        {!editMode && (
          <button 
            type="button" 
            className="edit-profile-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
      
      {!editMode ? (
        <div className="profile-view">
          <div className="form-section">
            <label className="section-label">Avatar</label>
            <div className="avatar-display">
              <div className="avatar-preview">
                {user?.first_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>First Name</label>
              <div className="field-display">{displayData.first_name || '-'}</div>
            </div>
            <div className="form-field">
              <label>Last Name</label>
              <div className="field-display">{displayData.last_name || '-'}</div>
            </div>
          </div>

          <div className="form-field full-width">
            <label>Email Address</label>
            <div className="field-display">{displayData.email || '-'}</div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Phone Number</label>
              <div className="field-display">{displayData.phone || '-'}</div>
            </div>
            <div className="form-field">
              <label>Role/Account type</label>
              <div className="field-display">{displayData.role || '-'}</div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Country</label>
              <div className="field-display">{displayData.country || '-'}</div>
            </div>
            <div className="form-field">
              <label>Address</label>
              <div className="field-display">{displayData.address || '-'}</div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-section">
            <label className="section-label">Avatar</label>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {user?.first_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button type="button" className="camera-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>First Name</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                placeholder="Enter first name"
              />
            </div>
            <div className="form-field">
              <label>Last Name</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label>Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-field">
              <label>Role/Account type</label>
              <input
                type="text"
                value={user?.role || 'Merchant'}
                disabled
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Country</label>
              <input
                type="text"
                value={profileData.country}
                onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                placeholder="Enter country"
              />
            </div>
            <div className="form-field">
              <label>Address</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="form-actions-bottom">
            <button type="button" className="cancel-btn-outline" onClick={handleCancelEdit}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save changes
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileInfo;
