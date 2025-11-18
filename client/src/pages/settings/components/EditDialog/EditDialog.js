import React, { useState } from 'react';
import './EditDialog.css';

const EditDialog = ({ 
  isOpen, 
  editFormData, 
  onInputChange, 
  onSave, 
  onCancel,
  onAvatarSelect
}) => {
  const [avatarPreview, setAvatarPreview] = useState(null);

  if (!isOpen) return null;

  const getAvatarInitials = () => {
    const firstName = editFormData.firstName?.charAt(0).toUpperCase() || 'U';
    const lastName = editFormData.lastName?.charAt(0).toUpperCase() || '';
    return firstName + lastName;
  };

  const handleAvatarClick = () => {
    console.log('🖼️ Avatar edit button clicked');
    const input = document.getElementById('avatar-file-input');
    console.log('File input element:', input);
    if (input) {
      input.click();
    } else {
      console.error('❌ File input element not found');
    }
  };

  const handleAvatarFileChange = (e) => {
    console.log('📁 File change event triggered');
    const file = e.target.files?.[0];
    console.log('Selected file:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    console.log('✅ File validation passed, creating preview...');
    const reader = new FileReader();
    reader.onload = (event) => {
      console.log('📷 Preview created');
      setAvatarPreview(event.target.result);
      if (onAvatarSelect) {
        console.log('📤 Calling onAvatarSelect callback');
        onAvatarSelect(file, event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="edit-dialog-overlay" onClick={onCancel}>
      <div className="edit-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Edit Profile</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="dialog-content">
          {/* Avatar Section in Dialog */}
          <div className="dialog-avatar-section">
            <label>Avatar</label>
            <div className="dialog-avatar-container">
              <div className="dialog-avatar-image">
                {avatarPreview ? (
                  <>
                    {console.log('📷 Showing new avatar preview in dialog')}
                    <img 
                      src={avatarPreview}
                      alt="Profile Avatar"
                    />
                  </>
                ) : (
                  <img 
                    src={`https://via.placeholder.com/100x100/DEAD25/FFFFFF?text=${getAvatarInitials()}`}
                    alt="Profile Avatar"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                )}
                <div 
                  className="dialog-avatar-fallback"
                  style={{ display: avatarPreview ? 'none' : 'flex' }}
                >
                  {getAvatarInitials()}
                </div>
                <button className="dialog-avatar-edit-btn" title="Edit avatar" onClick={handleAvatarClick}>
                  ✎
                </button>
                <input 
                  type="file" 
                  id="avatar-file-input" 
                  accept="image/*"
                  style={{ display: 'none' }} 
                  onChange={handleAvatarFileChange} 
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="dialog-form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={editFormData.firstName}
                onChange={onInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={editFormData.lastName}
                onChange={onInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={onInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={editFormData.phone}
                onChange={onInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={editFormData.country}
                onChange={onInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={editFormData.address}
                onChange={onInputChange}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={onSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;
