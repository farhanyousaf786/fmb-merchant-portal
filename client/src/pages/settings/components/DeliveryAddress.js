import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/Toast/ToastContext';
import '../Settings.css';

const DeliveryAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    postal: '',
    is_default: false
  });
  const toast = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      country: '',
      postal: '',
      is_default: false
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast.error('Name and address are required');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('✅ Address added successfully!');
        setShowModal(false);
        fetchAddresses(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Error adding address');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ is_default: true })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('✅ Default address updated!');
        fetchAddresses(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Error updating address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('✅ Address deleted successfully!');
        fetchAddresses(); // Refresh the list
      } else {
        toast.error(data.error || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Error deleting address');
    }
  };

  if (loading) return <div className="loading">Loading addresses...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="delivery-section">
      <div className="section-header">
        <h2>Manage your store locations and delivery adresses</h2>
        <button className="add-address-btn" onClick={handleAddAddress}>Add address</button>
      </div>

      <div className="address-list">
        {addresses.length === 0 ? (
          <p>No addresses found.</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className={`address-card ${addr.is_default ? 'default' : ''}`}>
              <div className="address-header">
                <h3>{addr.name}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {Boolean(addr.is_default) && (
                    <span className="verified-badge">Verified legal address</span>
                  )}
                  {!Boolean(addr.is_default) && (
                    <button 
                      className="set-default-btn"
                      onClick={() => handleSetDefault(addr.id)}
                      style={{
                        padding: '4px 12px',
                        background: '#DEAD25',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Set as Default
                    </button>
                  )}
                  <button 
                    className="delete-address-btn"
                    onClick={() => handleDelete(addr.id)}
                    style={{
                      padding: '4px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p>{addr.address}{addr.city ? `, ${addr.city}` : ''}{addr.country ? `, ${addr.country}` : ''}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Address</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Address Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Main Office, Warehouse, Branch 2"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                />
              </div>

              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postal"
                  value={formData.postal}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                />
              </div>

              <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                  id="is_default"
                />
                <label htmlFor="is_default" style={{ margin: 0 }}>Set as default address</label>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddress;
