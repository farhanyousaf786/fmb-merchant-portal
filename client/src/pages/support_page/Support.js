import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Support.css';

const Support = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Support/Issues</h1>
            <p>Get help and manage support tickets</p>
          </header>
          <div className="content-placeholder">
            <h2>❓ Support Center</h2>
            <p>This page will show support tickets, help documentation, and contact options.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;
