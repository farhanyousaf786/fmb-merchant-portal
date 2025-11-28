import React, { useState, useEffect } from 'react';
import './OrderDetailModal.css';

const OrderDetailModal = ({ orderId, isOpen, onClose, userRole }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form states for admin
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOrder(data.order);
        setNewStatus(data.order.status);
        setTrackingNumber(data.order.tracking_number || '');
      } else {
        alert('Failed to load order details');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }

    if (newStatus === 'declined' && !declineReason) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          notes,
          decline_reason: declineReason
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Status updated successfully');
        setNotes('');
        setDeclineReason('');
        fetchOrderDetails(); // Refresh
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
          notes: notes || 'Tracking number updated'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Tracking number updated successfully');
        setNotes('');
        fetchOrderDetails(); // Refresh
      } else {
        alert(data.error || 'Failed to update tracking number');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Failed to update tracking number');
    } finally {
      setUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details #{orderId}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="modal-body">
            <p>Loading order details...</p>
          </div>
        ) : !order ? (
          <div className="modal-body">
            <p>Order not found</p>
          </div>
        ) : (
          <div className="modal-body">
            {/* Order Info */}
            <section className="order-section">
              <h3>Order Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="info-item">
                  <label>Total Amount:</label>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="info-item">
                  <label>Created:</label>
                  <span>{new Date(order.created_at).toLocaleString()}</span>
                </div>
                {order.tracking_number && (
                  <div className="info-item">
                    <label>Tracking Number:</label>
                    <span>{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Customer Info */}
            <section className="order-section">
              <h3>Customer Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{order.contact_first_name} {order.contact_last_name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{order.contact_email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{order.contact_phone}</span>
                </div>
                <div className="info-item full-width">
                  <label>Delivery Address:</label>
                  <span>
                    {order.delivery_address}, {order.delivery_city}, {order.delivery_country} {order.delivery_postal}
                  </span>
                </div>
              </div>
            </section>

            {/* Order Items */}
            <section className="order-section">
              <h3>Order Items</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.product_name || `Product #${item.inventory_id}`}</td>
                      <td>{item.type}</td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unit_price).toFixed(2)}</td>
                      <td>${Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Admin Controls */}
            {isAdmin && (
              <section className="order-section admin-controls">
                <h3>Admin Controls</h3>
                
                <div className="control-group">
                  <label>Update Status:</label>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>

                {newStatus === 'declined' && (
                  <div className="control-group">
                    <label>Decline Reason:</label>
                    <textarea
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="Enter reason for declining..."
                      rows="3"
                    />
                  </div>
                )}

                <div className="control-group">
                  <label>Notes (optional):</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this status change..."
                    rows="2"
                  />
                </div>

                <button
                  className="primary-btn"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>

                <hr />

                <div className="control-group">
                  <label>Tracking Number:</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number..."
                  />
                </div>

                <button
                  className="secondary-btn"
                  onClick={handleUpdateTracking}
                  disabled={updating}
                >
                  {updating ? 'Updating...' : 'Update Tracking Number'}
                </button>
              </section>
            )}

            {/* Tracking History */}
            {order.tracking_history && order.tracking_history.length > 0 && (
              <section className="order-section">
                <h3>Tracking History</h3>
                <div className="timeline">
                  {order.tracking_history.map((entry, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <span className={`status-badge status-${entry.status}`}>
                            {entry.status}
                          </span>
                          <span className="timeline-date">
                            {new Date(entry.created_at).toLocaleString()}
                          </span>
                        </div>
                        {entry.tracking_number && (
                          <p className="timeline-tracking">
                            Tracking: {entry.tracking_number}
                          </p>
                        )}
                        {entry.notes && (
                          <p className="timeline-notes">{entry.notes}</p>
                        )}
                        {entry.first_name && (
                          <p className="timeline-admin">
                            Updated by: {entry.first_name} {entry.last_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
