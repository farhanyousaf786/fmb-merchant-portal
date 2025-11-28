import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/Toast/ToastContext';
import '../Settings.css';

const BusinessDetails = ({ user, onSave }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    business_name: '',
    branch: '',
    legal_address: '',
    phone: '',
    primary_contact_name: ''
  });

  useEffect(() => {
    if (user) {
      console.log('📊 User data received in BusinessDetails:', user);
      console.log('🌿 Branch value from user:', user.branch);
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

  const handleSave = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('✅ Business details updated successfully!');
        if (onSave) onSave(formData); // Notify parent component
        
        // Reload page after a short delay to show the updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || 'Failed to update business details');
      }
    } catch (error) {
      console.error('❌ Error saving business details:', error);
      toast.error('Error updating business details');
    }
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
          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. Cambridge St. Saudi"
          />
        </div>

        <div className="form-group full-width">
          <label>Default delivery Address</label>
          <input
            type="text"
            name="legal_address"
            value={formData.legal_address}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Contact Person</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="form-input"
          />
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
        <button className="save-btn-gold" onClick={handleSave}>Save changes</button>
      </div>
    </div>
  );
};

export default BusinessDetails;
