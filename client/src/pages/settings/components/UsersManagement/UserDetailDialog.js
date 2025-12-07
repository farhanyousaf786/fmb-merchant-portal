import React, { useState } from 'react';
import './UserDetailDialog.css';

const UserDetailDialog = ({ user, selectedUser, onClose, onApproveUser, onRejectUser, onAssignRole, onChangePassword }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(selectedUser ? { ...selectedUser } : {});

  if (!selectedUser) return null;

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset to original values
      setEditedUser({ ...selectedUser });
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field, value) => {
    setEditedUser(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          first_name: editedUser.first_name,
          last_name: editedUser.last_name,
          business_name: editedUser.business_name,
          email: editedUser.email,
          phone: editedUser.phone,
          legal_address: editedUser.legal_address,
          city: editedUser.city,
          zip: editedUser.zip,
          country: editedUser.country
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('User details updated successfully!');
        setEditMode(false);
        // Update the selectedUser with new values
        Object.assign(selectedUser, editedUser);
      } else {
        alert(data.error || 'Failed to update user details');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user details');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="user-detail-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>User Details</h2>
          <div className="header-actions">
            <button 
              className={`edit-toggle-btn ${editMode ? 'save-mode' : ''}`}
              onClick={editMode ? handleSaveChanges : handleEditToggle}
            >
              {editMode ? '💾 Save' : '✏️ Edit'}
            </button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        
        <div className="dialog-content">
          {/* Personal Information Section */}
          <div className="detail-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.first_name || ''}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.first_name || '-'}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>Last Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.last_name || ''}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.last_name || '-'}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>Email</label>
                {editMode ? (
                  <input
                    type="email"
                    value={editedUser.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.email || '-'}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>Phone</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={editedUser.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.phone || '-'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Business Information Section */}
          <div className="detail-section">
            <h3>Business Information</h3>
            <div className="info-grid">
              <div className="info-item full-width">
                <label>Business Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.business_name || ''}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.business_name || '-'}</span>
                )}
              </div>
              
              <div className="info-item full-width">
                <label>Address</label>
                {editMode ? (
                  <textarea
                    value={editedUser.legal_address || ''}
                    onChange={(e) => handleInputChange('legal_address', e.target.value)}
                    className="edit-input"
                    rows="2"
                  />
                ) : (
                  <span>{selectedUser.legal_address || '-'}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>City</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.city || '-'}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>ZIP Code</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.zip || ''}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.zip || '-'}</span>
                )}
              </div>
              
              <div className="info-item">
                <label>Country</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="edit-input"
                  />
                ) : (
                  <span>{selectedUser.country || '-'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>User ID</label>
                <span>{selectedUser.id}</span>
              </div>
              
              <div className="info-item">
                <label>Role</label>
                <span className={`role-badge ${selectedUser.role}`}>
                  {selectedUser.role || 'Not assigned'}
                </span>
              </div>
              
              <div className="info-item">
                <label>Status</label>
                <span className={`status-badge ${selectedUser.status}`}>
                  {selectedUser.status === 'pending' ? '🟡 Pending' : 
                   selectedUser.status === 'active' ? '🟢 Active' : 
                   selectedUser.status === 'approved' ? '🟢 Approved' :
                   selectedUser.status === 'inactive' ? '🔴 Inactive' :
                   '🔴 Rejected'}
                </span>
              </div>
              
              <div className="info-item">
                <label>Created Date</label>
                <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : '-'}</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="detail-section">
            <h3>Actions</h3>
            <div className="actions-grid">
              {selectedUser.status === 'pending' && (
                <>
                  <button 
                    className="action-btn approve-action"
                    onClick={() => {
                      onApproveUser(selectedUser.id);
                      onClose();
                    }}
                  >
                    ✓ Approve User
                  </button>
                  <button 
                    className="action-btn reject-action"
                    onClick={() => {
                      onRejectUser(selectedUser.id);
                      onClose();
                    }}
                  >
                    ✗ Reject User
                  </button>
                </>
              )}
              
              {selectedUser.status === 'pending' && (
                <div className="role-assignment">
                  <label>Assign Role:</label>
                  <select 
                    className="role-select-modal"
                    onChange={(e) => {
                      if (e.target.value) {
                        onAssignRole(selectedUser.id, e.target.value);
                        onClose();
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Role</option>
                    <option value="merchant">Merchant</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button 
                className="action-btn password-action"
                onClick={() => {
                  onChangePassword(selectedUser);
                  onClose();
                }}
              >
                🔑 Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailDialog;
