import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Support.css';

const Support = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    relatedOrder: '',
    issueCategory: '',
    trackingStatus: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Support form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="support-container">
          {/* Header with Search */}
          <div className="support-header">
            <div className="search-section">
              <input 
                type="text" 
                placeholder="Search by Invoice ID or Customer Name"
                className="search-input"
              />
            </div>
            <div className="filter-buttons">
              <button className="filter-btn">
                Today
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="filter-btn">
                Filter by
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="notification-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="#6B7280" strokeWidth="2" fill="none"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#6B7280" strokeWidth="2" fill="none"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="support-content">
            <h1>Support</h1>
            
            <div className="support-form-section">
              <h2>What's your concern?</h2>
              <p className="form-subtitle">Fill up all your concern and we'll attend to you shortly.</p>
              
              <form onSubmit={handleSubmit} className="support-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="relatedOrder">Select Related Order*</label>
                    <select
                      id="relatedOrder"
                      name="relatedOrder"
                      value={formData.relatedOrder}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select</option>
                      <option value="ORD-2356">#ORD-2356</option>
                      <option value="ORD-2357">#ORD-2357</option>
                      <option value="ORD-2358">#ORD-2358</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="issueCategory">Issue Category*</label>
                    <select
                      id="issueCategory"
                      name="issueCategory"
                      value={formData.issueCategory}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select</option>
                      <option value="delivery">Delivery Issue</option>
                      <option value="quality">Product Quality</option>
                      <option value="payment">Payment Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="trackingStatus">Tracking Status</label>
                    <select
                      id="trackingStatus"
                      name="trackingStatus"
                      value={formData.trackingStatus}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      <option value="pending">Pending</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Description*</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Tell us what happened..."
                    className="form-textarea"
                    rows="4"
                    required
                  />
                </div>
                
                <button type="submit" className="submit-btn">
                  Send message
                </button>
              </form>
            </div>
            
            <div className="no-issues-section">
              <div className="no-issues-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 13l3 3 7-7" stroke="#10B981" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <p className="no-issues-message">
                You have no reported issues.<br />
                Everything looks good!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
