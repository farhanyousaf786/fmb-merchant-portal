import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user.businessName || 'Merchant'}!</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Completed Orders</h3>
            <p className="stat-number">0</p>
          </div>
          <div className="stat-card">
            <h3>Revenue</h3>
            <p className="stat-number">$0</p>
          </div>
        </div>

        <div className="orders-section">
          <h2>Recent Orders</h2>
          <div className="empty-state">
            <p>No orders yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
