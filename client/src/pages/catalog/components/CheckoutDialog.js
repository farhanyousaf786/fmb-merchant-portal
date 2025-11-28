import React, { useMemo, useState, useEffect, useCallback } from 'react';
import './CheckoutDialog.css';

const CheckoutDialog = ({ isOpen, cart, user, onClose, onPlaceOrder }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal: '',
    notes: '',
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Helper to fill address fields
  const fillAddressForm = useCallback((addr) => {
    setForm(prev => ({
      ...prev,
      address: addr.address,
      city: addr.city || '',
      country: addr.country || '',
      postal: addr.postal || ''
    }));
  }, []);

  // Fetch addresses and pre-fill user info when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Pre-fill contact info from user prop
      if (user) {
        setForm(prev => ({
          ...prev,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.phone || ''
        }));
      }

      // Fetch saved addresses
      const fetchAddresses = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/addresses`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setAddresses(data.addresses);
            
            // Find default address and auto-fill
            const defaultAddr = data.addresses.find(a => a.is_default);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              fillAddressForm(defaultAddr);
            }
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
        }
      };

      fetchAddresses();
    }
  }, [isOpen, user, fillAddressForm]);

  const handleAddressSelect = (e) => {
    const addrId = parseInt(e.target.value);
    setSelectedAddressId(addrId);
    
    if (addrId === -1) {
      // Clear address fields if "New Address" selected
      setForm(prev => ({
        ...prev,
        address: '',
        city: '',
        country: '',
        postal: ''
      }));
    } else {
      const selected = addresses.find(a => a.id === addrId);
      if (selected) {
        fillAddressForm(selected);
      }
    }
  };

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxRate = 0.05;
    const tax = +(subtotal * taxRate).toFixed(2);
    const delivery = 0;
    const discount = 0;
    const total = subtotal + tax + delivery - discount;
    return { subtotal, tax, delivery, discount, total, taxRate };
  }, [cart]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      alert('Please fill in all required contact fields.');
      return;
    }
    if (!form.address || !form.city || !form.country) {
      alert('Please provide delivery address, city, and country.');
      return;
    }
    onPlaceOrder({ form, totals });
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>Order Details</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="checkout-body">
          <div className="checkout-left">
            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="section-title">Point of Contact Info</div>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    First Name<span className="required">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                </div>
                <div className="form-field">
                  <label>
                    Last Name<span className="required">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>
                    Email<span className="required">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-field">
                  <label>
                    Phone number<span className="required">*</span>
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+234 ..."
                  />
                </div>
              </div>

              <div className="section-title">Delivery Address</div>
              
              {/* Saved Addresses Dropdown */}
              {addresses.length > 0 && (
                <div className="form-field full" style={{ marginBottom: '15px' }}>
                  <label>Saved Addresses</label>
                  <select 
                    value={selectedAddressId} 
                    onChange={handleAddressSelect}
                    className="address-select"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      backgroundColor: '#f9fafb',
                      fontSize: '14px'
                    }}
                  >
                    <option value="-1">-- Select or Enter New Address --</option>
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.name} {addr.is_default ? '(Default)' : ''} - {addr.address}, {addr.city}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field full">
                <label>
                  Address<span className="required">*</span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street address"
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    City<span className="required">*</span>
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-field">
                  <label>
                    Country<span className="required">*</span>
                  </label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Country"
                  />
                </div>
                <div className="form-field">
                  <label>Postal code</label>
                  <input
                    name="postal"
                    value={form.postal}
                    onChange={handleChange}
                    placeholder="Postal"
                  />
                </div>
              </div>

              <div className="section-title">Additional Note (Optional)</div>
              <div className="form-field full">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="e.g. Deliver to loading dock before 8AM..."
                  rows={3}
                />
              </div>

              <div className="section-title">Order Summary</div>
              <div className="order-summary-box">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Type</th>
                      <th>Unit Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, idx) => (
                      <tr key={`${item.inventoryId}-${item.type}-${idx}`}>
                        <td>{item.name}</td>
                        <td>{item.type === 'sliced' ? 'Sliced' : 'Unsliced'}</td>
                        <td>${item.unitPrice.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="checkout-actions">
                <button type="submit" className="primary-btn">
                  Place Order
                </button>
              </div>
            </form>
          </div>
          <div className="checkout-right">
            <div className="invoice-card">
              <div className="invoice-header">
                <div>
                  <div className="invoice-title">Invoice Preview</div>
                  <div className="invoice-subtitle">
                    You can download this later from your orders.
                  </div>
                </div>
              </div>
              <div className="invoice-body">
                <div className="invoice-section">
                  <div className="invoice-label">Bill To</div>
                  <div className="invoice-value">
                    {form.firstName || form.lastName
                      ? `${form.firstName} ${form.lastName}`.trim()
                      : 'Your name'}
                  </div>
                  <div className="invoice-value small">
                    {form.address || 'Delivery address'}
                  </div>
                  <div className="invoice-value small">
                    {[form.city, form.postal].filter(Boolean).join(' ') || 'City / Postal'}
                  </div>
                  <div className="invoice-value small">
                    {form.country || 'Country'}
                  </div>
                </div>

                <div className="invoice-section">
                  <div className="invoice-table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Item(s)</th>
                          <th>Type</th>
                          <th>Unit</th>
                          <th>Qty</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={`${item.inventoryId}-${item.type}-${idx}`}>
                            <td>{item.name}</td>
                            <td>{item.type === 'sliced' ? 'Sliced' : 'Unsliced'}</td>
                            <td>${item.unitPrice.toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="invoice-section totals">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="row">
                    <span>Tax ({(totals.taxRate * 100).toFixed(0)}%)</span>
                    <span>${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="row">
                    <span>Delivery</span>
                    <span>${totals.delivery.toFixed(2)}</span>
                  </div>
                  <div className="row">
                    <span>Discount</span>
                    <span>-${totals.discount.toFixed(2)}</span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDialog;
