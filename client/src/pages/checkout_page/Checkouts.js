import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Checkouts.css';

const Checkouts = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Checkouts</h1>
            <p>Monitor checkout processes and payment flows</p>
          </header>
          <div className="content-placeholder">
            <h2>💳 Checkout Management</h2>
            <p>This page will show checkout analytics and payment processing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkouts;
