import React from 'react';
import Sidebar from '../sidebar/Sidebar';
import './Dashboard.css';
import WelcomeBar from './components/WelcomeBar/WelcomeBar';
import FiltersBar from './components/FiltersBar/FiltersBar';
import StatsRow from './components/StatsRow/StatsRow';
import PaymentsSnapshots from './components/PaymentsSnapshots/PaymentsSnapshots';
import RecentOrders from './components/RecentOrders/RecentOrders';

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
              <PaymentsSnapshots />
            </div>
          </div>
          <RecentOrders />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
