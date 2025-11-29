import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PastOrdersSupport.css';

const PastOrdersSupport = () => {
  const navigate = useNavigate();
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportInfo, setSupportInfo] = useState({
    notice: '',
    email: 'support@fmb.com',
    phone: '+234 800 000 0000'
  });

  useEffect(() => {
    fetchPastOrders();
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
    }
  };

  const fetchPastOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // Show last 3 orders regardless of status for now
        const allOrders = data.orders || [];
        setPastOrders(allOrders.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching past orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="past-orders-support">
      {/* Past Orders Section */}
      <div className="past-orders-section">
        <h2>Past orders</h2>
        <div className="orders-table">
          <div className="table-header">
            <span>Order ID</span>
            <span>Bread type</span>
            <span>Quantity</span>
            <span>Order date</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          
          {loading ? (
            <div className="table-row" style={{ justifyContent: 'center', padding: '20px' }}>
              Loading...
            </div>
          ) : pastOrders.length === 0 ? (
            <div className="table-row" style={{ justifyContent: 'center', padding: '20px', color: '#6b7280' }}>
              No past orders found
            </div>
          ) : (
            pastOrders.map((order) => (
              <div key={order.id} className="table-row">
                <span className="order-id">#{String(order.id).padStart(5, '0')}</span>
                <span className="bread-type" title={order.item_names}>
                  {order.item_names || 'Mixed Items'}
                </span>
                <span className="quantity">{order.total_quantity}</span>
                <span className="order-date">{formatDate(order.created_at)}</span>
                <span className="delivery-date">
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </span>
                <div className="action-buttons">
                  <button 
                    className="repeat-order-btn"
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <div className="support-card">
          <div className="support-icon">
            <img src="/assets/icons/support-icon.png" alt="Support" onError={(e) => e.target.style.display = 'none'} />
          </div>
          <h3>Have an issue? Send us a message!</h3>
          {supportInfo.notice && (
            <div className="support-notice">
              <p>{supportInfo.notice}</p>
            </div>
          )}
          <div className="contact-info">
            <p>Email: {supportInfo.email}</p>
            <p>Phone: {supportInfo.phone}</p>
          </div>
          <button 
            className="contact-support-btn"
            onClick={() => navigate('/support-page')}
          >
            Contact support
          </button>
        </div>
      </div>
    </div>
  );
};

export default PastOrdersSupport;
