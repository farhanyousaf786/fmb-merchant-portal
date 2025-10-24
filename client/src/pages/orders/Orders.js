import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Orders.css';

const Orders = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Orders</h1>
            <p>Manage your orders and track their status</p>
          </header>
          <div className="content-placeholder">
            <h2>🛒 Orders Management</h2>
            <p>This page will show all your orders with filtering and search capabilities.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
