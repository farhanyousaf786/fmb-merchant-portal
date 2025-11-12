import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Dashboard.css';
import WelcomeBar from './components/WelcomeBar/WelcomeBar';
import FiltersBar from './components/FiltersBar/FiltersBar';
import StatsRow from './components/StatsRow/StatsRow';
import CurrentOrderTracker from './components/CurrentOrderTracker/CurrentOrderTracker';
import PastOrdersSupport from './components/PastOrdersSupport/PastOrdersSupport';

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="main-content">
        <div className="dashboard-container">
          <WelcomeBar user={user} />
          <div className="dashboard-header-row">
            <h1>Dashboard</h1>
            <FiltersBar />
          </div>
          <div className="dashboard-main-grid">
            <div className="dashboard-left">
              <StatsRow />
              <CurrentOrderTracker />
            </div>
          </div>
          <PastOrdersSupport />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
