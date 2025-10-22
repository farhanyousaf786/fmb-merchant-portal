import React, { useState } from 'react';
import './Dashboard.css';
import Orders from './Orders';

function Dashboard({ merchant, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>FanMunch Merchant</h1>
        <div className="header-right">
          <span>{merchant.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button 
            className={activeTab === 'menu' ? 'active' : ''}
            onClick={() => setActiveTab('menu')}
          >
            🍔 Menu
          </button>
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            📊 Stats
          </button>
        </nav>

        <main className="main-content">
          {activeTab === 'orders' && <Orders />}
          {activeTab === 'menu' && <div className="placeholder">Menu Management Coming Soon</div>}
          {activeTab === 'stats' && <div className="placeholder">Statistics Coming Soon</div>}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
