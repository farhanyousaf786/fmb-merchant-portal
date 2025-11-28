import React, { useState, useEffect } from 'react';
import '../Settings.css';

const BusinessDetails = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    business_name: '',
    branch: '',
    legal_address: '',
    phone: '',
    primary_contact_name: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        business_name: user.business_name || '',
        branch: user.branch || '',
        legal_address: user.legal_address || '',
        phone: user.phone || '',
        primary_contact_name: user.primary_contact_name || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="business-section">
      <h2>Business Details</h2>
      
      {/* Avatar section removed as requested */}

      <div className="form-grid">
        <div className="form-group">
          <label>Store Name</label>
          <input
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Branch</label>
          <div className="input-with-edit">
            <input
              type="text"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Cambridge St. Saudi"
            />
            <button className="edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEAD25" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Default delivery Address</label>
          <div className="input-with-edit">
            <input
              type="text"
              name="legal_address"
              value={formData.legal_address}
              onChange={handleChange}
              className="form-input"
            />
            <button className="edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEAD25" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Contact Person</label>
          <div className="input-with-edit">
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
            />
            <button className="edit-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DEAD25" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Contact Name</label>
          <input
            type="text"
            name="primary_contact_name"
            value={formData.primary_contact_name}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="cancel-btn-outline" onClick={() => window.location.reload()}>Cancel</button>
        <button className="save-btn-gold" onClick={() => onSave(formData)}>Save changes</button>
      </div>
    </div>
  );
};

export default BusinessDetails;
