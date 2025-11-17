import React from 'react';
import './EditDialog.css';

const EditDialog = ({ 
  isOpen, 
  editFormData, 
  onInputChange, 
  onSave, 
  onCancel 
}) => {
  if (!isOpen) return null;

  const getAvatarInitials = () => {
    const firstName = editFormData.firstName?.charAt(0).toUpperCase() || 'U';
    const lastName = editFormData.lastName?.charAt(0).toUpperCase() || '';
    return firstName + lastName;
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
                <img 
                  src={`https://via.placeholder.com/100x100/DEAD25/FFFFFF?text=${getAvatarInitials()}`}
                  alt="Profile Avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  className="dialog-avatar-fallback"
                  style={{ display: 'none' }}
                >
                  {getAvatarInitials()}
                </div>
                <button className="dialog-avatar-edit-btn" title="Edit avatar">
                  ✎
                </button>
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
