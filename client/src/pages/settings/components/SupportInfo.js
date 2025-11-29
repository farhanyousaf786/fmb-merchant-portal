import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/Toast/ToastContext';
import './SupportInfo.css';

const SupportInfo = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    notice: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/support`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success && data.support) {
        setFormData({
          notice: data.support.notice || '',
          email: data.support.email || '',
          phone: data.support.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching support info:', error);
      toast.error('Failed to load support info');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Support info updated successfully');
      } else {
        toast.error('Failed to update support info');
      }
    } catch (error) {
      console.error('Error updating support info:', error);
      toast.error('Error updating support info');
    }
  };

  if (loading) {
    return <div className="support-info-loading">Loading...</div>;
  }

  return (
    <div className="support-info-container">
      <div className="support-header">
        <h2>Support Info</h2>
        <p>Manage the support information displayed to your customers.</p>
      </div>

      <form onSubmit={handleSubmit} className="support-form">
        <div className="form-group">
          <label>Support Notice</label>
          <textarea
            name="notice"
            value={formData.notice}
            onChange={handleChange}
            placeholder="Enter a notice message for your customers (e.g., 'We are experiencing high volume...')"
            rows="4"
            className="form-textarea"
          />
          <span className="help-text">This message will be displayed in the support section of the dashboard.</span>
        </div>

        <div className="form-group">
          <label>Support Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="support@example.com"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Support Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 234 567 8900"
            className="form-input"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupportInfo;
