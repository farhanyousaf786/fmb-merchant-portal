import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast/ToastContext';
import Sidebar from '../sidebar/Sidebar';
import './SupportPage.css';

const SupportPage = ({ user, onLogout }) => {
  const toast = useToast();
  const [supportInfo, setSupportInfo] = useState({
    notice: '',
    email: 'support@fmb.com',
    phone: '+234 800 000 0000'
  });
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupportInfo();
  }, []);

  const fetchSupportInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/support`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.support) {
        setSupportInfo({
          notice: data.support.notice || '',
          email: data.support.email || 'support@fmb.com',
          phone: data.support.phone || '+234 800 000 0000'
        });
      }
    } catch (error) {
      console.error('Error fetching support info:', error);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For now, just show a success message
    // In production, you'd send this to a support ticket system
    toast.success('Support request submitted successfully!');
    setFormData({ subject: '', message: '' });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="support-page-container">
          <h1>Support</h1>
          
          <div className="support-page-grid">
            {/* Contact Information */}
            <div className="support-info-card">
              <div className="support-icon-large">
                <img src="/assets/icons/support-icon.png" alt="Support" onError={(e) => e.target.style.display = 'none'} />
              </div>
              <h2>Contact Information</h2>
              
              {supportInfo.notice && (
                <div className="support-notice-box">
                  <h3>Notice</h3>
                  <p>{supportInfo.notice}</p>
                </div>
              )}
              
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <a href={`mailto:${supportInfo.email}`} className="contact-value">
                    {supportInfo.email}
                  </a>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <a href={`tel:${supportInfo.phone}`} className="contact-value">
                    {supportInfo.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="support-form-card">
              <h2>Send us a message</h2>
              <form onSubmit={handleSubmit} className="support-form">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What do you need help with?"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question..."
                    rows="6"
                    required
                    className="form-textarea"
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
