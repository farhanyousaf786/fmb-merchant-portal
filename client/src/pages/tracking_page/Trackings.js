import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Trackings.css';

const Trackings = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [trackingInput, setTrackingInput] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTrackingOrders();
  }, []);

  const fetchTrackingOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Show all orders regardless of status
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTracking = async (orderId) => {
    if (!trackingInput.trim()) {
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
          tracking_number: trackingInput,
          notes: 'Tracking number updated from tracking page'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Tracking number updated successfully');
        setEditingId(null);
        setTrackingInput('');
        fetchTrackingOrders();
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

  const startEdit = (order) => {
    setEditingId(order.id);
    setTrackingInput(order.tracking_number || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTrackingInput('');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="trackings-container">
          <div className="trackings-header-row">
            <h1>Trackings</h1>
          </div>
          
          {loading ? (
            <div className="trackings-loading">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#10B981" strokeWidth="2" fill="none"/>
                  <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="#10B981" strokeWidth="2"/>
                  <line x1="12" y1="22.08" x2="12" y2="12" stroke="#10B981" strokeWidth="2"/>
                </svg>
              </div>
              <p className="empty-state-message">
                No deliveries in progress — new ones will appear here once dispatched.
              </p>
            </div>
          ) : (
            <div className="tracking-table-card">
              <table className="tracking-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Tracking Number</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{String(order.id).padStart(5, '0')}</td>
                      <td>
                        <span className={`status-pill status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                      <td>
                        {editingId === order.id ? (
                          <input
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="Enter tracking number..."
                            className="tracking-input"
                          />
                        ) : (
                          <span className="tracking-number">
                            {order.tracking_number ? (
                              <span style={{ 
                                color: '#DEAD25', 
                                fontWeight: '500'
                              }}>
                                {order.tracking_number}
                              </span>
                            ) : (
                              <span style={{ 
                                color: '#9CA3AF', 
                                fontStyle: 'italic'
                              }}>
                                Not provided yet
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          {editingId === order.id ? (
                            <div className="action-buttons">
                              <button
                                className="save-btn"
                                onClick={() => handleUpdateTracking(order.id)}
                                disabled={updating}
                              >
                                {updating ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                className="cancel-btn-small"
                                onClick={cancelEdit}
                                disabled={updating}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              className="edit-btn"
                              onClick={() => startEdit(order)}
                            >
                              {order.tracking_number ? 'Edit' : 'Add'} Tracking
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trackings;

