import React, { useState, useEffect } from 'react';

const PersonalInfoTab = ({ selectedUser }) => {
  const [businessPhones, setBusinessPhones] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  
  useEffect(() => {
    if (selectedUser?.role === 'merchant') {
      fetchBusinessPhones();
      fetchShippingAddresses();
    }
  }, [selectedUser]);

  const fetchBusinessPhones = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${selectedUser.id}/phones`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBusinessPhones(data.phones);
      }
    } catch (error) {
      console.error('Error fetching business phones:', error);
    }
  };

  const fetchShippingAddresses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${selectedUser.id}/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setShippingAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Error fetching shipping addresses:', error);
    }
  };
  
  return (
    <div className="tab-content">
      <div className="detail-section">
        <h3>Complete User Information</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>ID:</label>
            <span>{selectedUser.id}</span>
          </div>
          <div className="detail-item">
            <label>First Name:</label>
            <span>{selectedUser.first_name || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Last Name:</label>
            <span>{selectedUser.last_name || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Full Name:</label>
            <span>{selectedUser.first_name && selectedUser.last_name ? `${selectedUser.first_name} ${selectedUser.last_name}` : '-'}</span>
          </div>
          <div className="detail-item">
            <label>Email:</label>
            <span>{selectedUser.email}</span>
          </div>
          <div className="detail-item">
            <label>Phone:</label>
            <span>{selectedUser.phone || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Country:</label>
            <span>{selectedUser.country || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Address:</label>
            <span>{selectedUser.address || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Business Name:</label>
            <span>{selectedUser.business_name || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Legal Address:</label>
            <span>{selectedUser.legal_address || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Primary Contact Name:</label>
            <span>{selectedUser.primary_contact_name || '-'}</span>
          </div>
          <div className="detail-item">
            <label>Account Type:</label>
            <span className={`role-badge ${selectedUser.role}`}>
              {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : '-'}
            </span>
          </div>
          <div className="detail-item">
            <label>Status:</label>
            <span className={`status-badge ${selectedUser.status}`}>
              {selectedUser.status || 'approved'}
            </span>
          </div>
          <div className="detail-item">
            <label>Created Date:</label>
            <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <label>Member Since:</label>
            <span>{new Date(selectedUser.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Business Phones Section */}
      {selectedUser.role === 'merchant' && businessPhones.length > 0 && (
        <div className="detail-section">
          <h3>Business Phone Numbers</h3>
          <div className="phones-list-detail">
            {businessPhones.map((phone) => (
              <div key={phone.id} className="phone-item-detail">
                <span className="phone-number-detail">{phone.phone_number}</span>
                <span className={`phone-type-badge ${phone.phone_type}`}>{phone.phone_type}</span>
                {phone.is_primary && <span className="primary-badge-small">Primary</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Addresses Section */}
      {selectedUser.role === 'merchant' && shippingAddresses.length > 0 && (
        <div className="detail-section">
          <h3>Shipping Addresses</h3>
          <div className="addresses-list-detail">
            {shippingAddresses.map((address) => (
              <div key={address.id} className="address-item-detail">
                <div className="address-label-detail">
                  {address.address_label}
                  {address.is_default && <span className="default-badge-small">Default</span>}
                </div>
                <div className="address-text-detail">
                  <p>{address.full_address}</p>
                  <p>{address.city}, {address.state} {address.postal_code}</p>
                  <p>{address.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;
