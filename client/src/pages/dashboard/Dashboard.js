import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || 'Merchant'}!</p>
          </header>

          <div className="content-placeholder">
            <h2>📊 Dashboard Coming Soon</h2>
            <p>We're working hard to bring you comprehensive analytics and insights. Stay tuned for exciting features including:</p>
            <ul className="coming-soon-list">
              <li>📈 Real-time sales analytics</li>
              <li>💰 Revenue tracking and reports</li>
              <li>📦 Inventory management</li>
              <li>👥 Customer insights</li>
              <li>📊 Performance metrics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
