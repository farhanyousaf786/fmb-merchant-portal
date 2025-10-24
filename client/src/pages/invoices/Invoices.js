import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Invoices.css';

const Invoices = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <header className="dashboard-header">
            <h1>Invoice/Payments</h1>
            <p>Manage invoices and payment transactions</p>
          </header>
          <div className="content-placeholder">
            <h2>🧾 Invoice & Payment Management</h2>
            <p>This page will show invoices, payments, and financial reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
