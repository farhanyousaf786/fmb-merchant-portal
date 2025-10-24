import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Trackings.css';

const Trackings = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Trackings</h1>
            <p>Track shipments and delivery status</p>
          </header>
          <div className="content-placeholder">
            <h2>📦 Shipment Tracking</h2>
            <p>This page will show shipment tracking and delivery management.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trackings;
