import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CurrentOrderTracker.css';

const CurrentOrderTracker = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Take the first 3 orders (assuming API returns sorted by date DESC)
        const orders = data.orders || [];
        setRecentOrders(orders.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    if (status === 'submitted') return 'New Order';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="current-order-tracker">
        <h2>Current order tracker</h2>
        <div className="tracker-empty">Loading...</div>
      </div>
    );
  }

  if (recentOrders.length === 0) {
    return (
      <div className="current-order-tracker">
        <h2>Current order tracker</h2>
        <div className="tracker-empty">
          <p>No orders yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="current-order-tracker">
      <h2>Current order tracker</h2>
      <div className="tracker-cards">
        {recentOrders.map((order) => (
          <div key={order.id} className={`tracker-card status-${order.status}`}>
            <div className="order-info">
              <h3>#{String(order.id).padStart(5, '0')} - {order.total_quantity} items</h3>
              <p>Placed: {formatDate(order.created_at)}</p>
            </div>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill"></div>
            </div>

            <div className="order-actions">
              <span className="status-badge">
                {getStatusLabel(order.status)}
              </span>
              <button 
                className="view-btn"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentOrderTracker;
