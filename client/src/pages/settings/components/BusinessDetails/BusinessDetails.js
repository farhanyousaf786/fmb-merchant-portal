import React, { useState, useEffect } from 'react';
import AlertDialog from '../../../../universal_components/AlertDialog/AlertDialog';
import './BusinessDetails.css';

const BusinessDetails = ({ user }) => {
  const [businessPhones, setBusinessPhones] = useState([]);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingPhone, setEditingPhone] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'confirm' });
  
  const [phoneData, setPhoneData] = useState({
    phone_number: '',
    phone_type: 'office',
    is_primary: false
  });

  const [addressData, setAddressData] = useState({
    address_label: '',
    full_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });

  useEffect(() => {
    if (user?.role === 'merchant') {
      fetchBusinessPhones();
      fetchShippingAddresses();
    }
  }, [user]);

  const fetchBusinessPhones = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/merchant/phones`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/merchant/addresses`, {
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

  const handleAddPhone = () => {
    setEditingPhone(null);
    setPhoneData({ phone_number: '', phone_type: 'office', is_primary: false });
    setShowPhoneModal(true);
  };

  const handleEditPhone = (phone) => {
    setEditingPhone(phone);
    setPhoneData({
      phone_number: phone.phone_number,
      phone_type: phone.phone_type,
      is_primary: phone.is_primary
    });
    setShowPhoneModal(true);
  };

  const handleSavePhone = async (e) => {
    e.preventDefault();
    try {
      const url = editingPhone 
        ? `${process.env.REACT_APP_API_URL}/merchant/phones/${editingPhone.id}`
        : `${process.env.REACT_APP_API_URL}/merchant/phones`;
      
      const response = await fetch(url, {
        method: editingPhone ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(phoneData)
      });

      const data = await response.json();
      if (data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: editingPhone ? 'Phone updated successfully!' : 'Phone added successfully!',
          type: 'alert',
          onConfirm: () => {}
        });
        setShowPhoneModal(false);
        fetchBusinessPhones();
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Error',
          message: data.error || 'Failed to save phone',
          type: 'alert',
          onConfirm: () => {}
        });
      }
    } catch (error) {
      console.error('Error saving phone:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save phone',
        type: 'alert',
        onConfirm: () => {}
      });
    }
  };

  const handleDeletePhone = async (phoneId) => {
    setAlertDialog({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this phone number?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/merchant/phones/${phoneId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });

          const data = await response.json();
          if (data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'Phone deleted successfully!',
              type: 'alert',
              onConfirm: () => {}
            });
            fetchBusinessPhones();
          } else {
            setAlertDialog({
              isOpen: true,
              title: 'Error',
              message: data.error || 'Failed to delete phone',
              type: 'alert',
              onConfirm: () => {}
            });
          }
        } catch (error) {
          console.error('Error deleting phone:', error);
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: 'Failed to delete phone',
            type: 'alert',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressData({
      address_label: '',
      full_address: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressData({
      address_label: address.address_label,
      full_address: address.full_address,
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || '',
      is_default: address.is_default
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const url = editingAddress 
        ? `${process.env.REACT_APP_API_URL}/merchant/addresses/${editingAddress.id}`
        : `${process.env.REACT_APP_API_URL}/merchant/addresses`;
      
      const response = await fetch(url, {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();
      if (data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: editingAddress ? 'Address updated successfully!' : 'Address added successfully!',
          type: 'alert',
          onConfirm: () => {}
        });
        setShowAddressModal(false);
        fetchShippingAddresses();
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Error',
          message: data.error || 'Failed to save address',
          type: 'alert',
          onConfirm: () => {}
        });
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to save address',
        type: 'alert',
        onConfirm: () => {}
      });
    }
  };

  const handleDeleteAddress = async (addressId) => {
    setAlertDialog({
      isOpen: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this address?',
      type: 'confirm',
      onConfirm: async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/merchant/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });

          const data = await response.json();
          if (data.success) {
            setAlertDialog({
              isOpen: true,
              title: 'Success',
              message: 'Address deleted successfully!',
              type: 'alert',
              onConfirm: () => {}
            });
            fetchShippingAddresses();
          } else {
            setAlertDialog({
              isOpen: true,
              title: 'Error',
              message: data.error || 'Failed to delete address',
              type: 'alert',
              onConfirm: () => {}
            });
          }
        } catch (error) {
          console.error('Error deleting address:', error);
          setAlertDialog({
            isOpen: true,
            title: 'Error',
            message: 'Failed to delete address',
            type: 'alert',
            onConfirm: () => {}
          });
        }
      }
    });
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/merchant/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAlertDialog({
          isOpen: true,
          title: 'Success',
          message: 'Default address updated!',
          type: 'alert',
          onConfirm: () => {}
        });
        fetchShippingAddresses();
      } else {
        setAlertDialog({
          isOpen: true,
          title: 'Error',
          message: data.error || 'Failed to set default address',
          type: 'alert',
          onConfirm: () => {}
        });
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: 'Failed to set default address',
        type: 'alert',
        onConfirm: () => {}
      });
    }
  };

  if (user?.role !== 'merchant') {
    return (
      <div className="business-details-container">
        <p>Business details are only available for merchant accounts.</p>
      </div>
    );
  }

  return (
    <div className="business-details-container">
      {/* Business Phones Section */}
      <div className="business-section">
        <div className="section-header">
          <h2>Business Phone Numbers</h2>
          <button className="add-btn" onClick={handleAddPhone}>
            + Add Phone Number
          </button>
        </div>

        <div className="phones-list">
          {businessPhones.length === 0 ? (
            <p className="empty-message">No phone numbers added yet.</p>
          ) : (
            businessPhones.map((phone) => (
              <div key={phone.id} className="phone-card">
                <div className="phone-info">
                  <div className="phone-number">{phone.phone_number}</div>
                  <div className="phone-meta">
                    <span className={`phone-type ${phone.phone_type}`}>{phone.phone_type}</span>
                    {phone.is_primary && <span className="primary-badge">Primary</span>}
                  </div>
                </div>
                <div className="phone-actions">
                  <button className="edit-btn" onClick={() => handleEditPhone(phone)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeletePhone(phone.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shipping Addresses Section */}
      <div className="business-section">
        <div className="section-header">
          <h2>Shipping Addresses</h2>
          <button className="add-btn" onClick={handleAddAddress}>
            + Add Address
          </button>
        </div>

        <div className="addresses-list">
          {shippingAddresses.length === 0 ? (
            <p className="empty-message">No shipping addresses added yet.</p>
          ) : (
            shippingAddresses.map((address) => (
              <div key={address.id} className="address-card">
                <div className="address-info">
                  <div className="address-label">
                    {address.address_label}
                    {address.is_default && <span className="default-badge">Default</span>}
                  </div>
                  <div className="address-details">
                    <p>{address.full_address}</p>
                    <p>{address.city}, {address.state} {address.postal_code}</p>
                    <p>{address.country}</p>
                  </div>
                </div>
                <div className="address-actions">
                  {!address.is_default && (
                    <button className="default-btn" onClick={() => handleSetDefaultAddress(address.id)}>
                      Set as Default
                    </button>
                  )}
                  <button className="edit-btn" onClick={() => handleEditAddress(address)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Phone Modal */}
      {showPhoneModal && (
        <div className="modal-overlay" onClick={() => setShowPhoneModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPhone ? 'Edit Phone Number' : 'Add Phone Number'}</h2>
              <button className="close-btn" onClick={() => setShowPhoneModal(false)}>×</button>
            </div>
            <form onSubmit={handleSavePhone} className="phone-form">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={phoneData.phone_number}
                  onChange={(e) => setPhoneData({...phoneData, phone_number: e.target.value})}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Type *</label>
                <select
                  value={phoneData.phone_type}
                  onChange={(e) => setPhoneData({...phoneData, phone_type: e.target.value})}
                  required
                >
                  <option value="mobile">Mobile</option>
                  <option value="office">Office</option>
                  <option value="fax">Fax</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={phoneData.is_primary}
                    onChange={(e) => setPhoneData({...phoneData, is_primary: e.target.checked})}
                  />
                  Set as primary phone
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowPhoneModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingPhone ? 'Update' : 'Add'} Phone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddress ? 'Edit Address' : 'Add Address'}</h2>
              <button className="close-btn" onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveAddress} className="address-form">
              <div className="form-group">
                <label>Address Label *</label>
                <input
                  type="text"
                  value={addressData.address_label}
                  onChange={(e) => setAddressData({...addressData, address_label: e.target.value})}
                  placeholder="e.g., Home, Office, Warehouse"
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Address *</label>
                <textarea
                  value={addressData.full_address}
                  onChange={(e) => setAddressData({...addressData, full_address: e.target.value})}
                  placeholder="Enter complete address"
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={addressData.postal_code}
                    onChange={(e) => setAddressData({...addressData, postal_code: e.target.value})}
                    placeholder="Postal Code"
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={addressData.country}
                    onChange={(e) => setAddressData({...addressData, country: e.target.value})}
                    placeholder="Country"
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={addressData.is_default}
                    onChange={(e) => setAddressData({...addressData, is_default: e.target.checked})}
                  />
                  Set as default shipping address
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingAddress ? 'Update' : 'Add'} Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
        onConfirm={alertDialog.onConfirm}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
      />
    </div>
  );
};

export default BusinessDetails;
