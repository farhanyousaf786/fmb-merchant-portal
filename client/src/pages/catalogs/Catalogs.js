import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Catalogs.css';

const Catalogs = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Catalogs</h1>
            <p>Manage your product catalogs and inventory</p>
          </header>
          <div className="content-placeholder">
            <h2>📋 Product Catalogs</h2>
            <p>This page will show your product catalogs and inventory management.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalogs;
