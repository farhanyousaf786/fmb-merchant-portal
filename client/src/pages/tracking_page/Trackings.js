import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import FiltersBar from '../dashboard/components/FiltersBar/FiltersBar';
import './Trackings.css';

const Trackings = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="trackings-container">
          <div className="trackings-header-row">
            <h1>Trackings</h1>
            <FiltersBar />
          </div>
          
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="#10B981" strokeWidth="2" fill="none"/>
                <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="#10B981" strokeWidth="2"/>
                <line x1="12" y1="22.08" x2="12" y2="12" stroke="#10B981" strokeWidth="2"/>
              </svg>
            </div>
            <p className="empty-state-message">
              No deliveries in progress — new ones will appear here once dispatched.
            </p>
            <button className="start-new-order-btn">
              Start New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trackings;
