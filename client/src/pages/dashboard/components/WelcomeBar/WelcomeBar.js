import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomeBar.css';

const WelcomeBar = ({ user }) => {
  const navigate = useNavigate();
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (newOrderCount > 0) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [newOrderCount]);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          if (isAdmin) {
            // Admin: Count orders in 'submitted' status
            const count = data.orders.filter(order => order.status === 'submitted').length;
            setNewOrderCount(count);
            setNotificationMessage('orders need your attention');
          } else {
            // Merchant: Check for status changes
            const lastSeenStatuses = JSON.parse(localStorage.getItem('lastSeenOrderStatuses') || '{}');
            let changedCount = 0;
            
            data.orders.forEach(order => {
              const lastStatus = lastSeenStatuses[order.id];
              if (lastStatus && lastStatus !== order.status) {
                changedCount++;
              }
            });
            
            setNewOrderCount(changedCount);
            setNotificationMessage(changedCount === 1 ? 'order status updated' : 'order statuses updated');
            
            // Update last seen statuses
            const newStatuses = {};
            data.orders.forEach(order => {
              newStatuses[order.id] = order.status;
            });
            localStorage.setItem('lastSeenOrderStatuses', JSON.stringify(newStatuses));
          }
        }
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    // Poll every minute
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleNotificationClick = () => {
    setNewOrderCount(0);
    navigate('/orders');
  };

  return (
    <div className="welcome-bar">
      <div className="welcome-text">
        <h2>Welcome back, Manager!</h2>
        <p>Here's what is happening in today.</p>
      </div>
      <div className="welcome-actions">
        <div className="search-container">
          <input 
            className="search-input" 
            placeholder="Search anything"
            type="text"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="notification-wrapper">
          <button 
            className={`notification-btn ${newOrderCount > 0 ? 'has-new-orders' : ''}`} 
            title="Notifications"
            onClick={handleNotificationClick}
          >
            <img 
              src="/assets/icons/notification-icon.svg" 
              alt="Notifications" 
              className="notification-icon"
              onError={(e) => {
                console.log('Notification icon failed to load:', e.target.src);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
              onLoad={() => {
                console.log('Notification SVG icon loaded successfully');
              }}
            />
            <span className="notification-fallback" style={{display: 'none'}}>🔔</span>
          </button>

          {showPopup && newOrderCount > 0 && (
            <div className="notification-popup" onClick={handleNotificationClick} style={{cursor: 'pointer'}}>
              <div className="notification-popup-content">
                <span className="notification-count-badge">{newOrderCount}</span>
                <span>{notificationMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WelcomeBar;
