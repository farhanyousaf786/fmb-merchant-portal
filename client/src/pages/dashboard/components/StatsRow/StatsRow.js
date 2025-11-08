import React from 'react';
import './StatsRow.css';

const StatCard = ({ title, value, note, tone, iconSrc }) => (
  <div className={`stat-card ${tone || ''}`}>
    <div className="stat-icon">
      <img
        className="stat-icon-img"
        src={iconSrc || '/assets/icons/orders-icon.png'}
        alt="stat"
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    </div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p className="stat-number">{value}</p>
      {note ? <span className="stat-note">{note}</span> : null}
    </div>
  </div>
);

const StatsRow = () => {
  return (
    <div className="dashboard-stats">
      <StatCard title="Active orders" value="0 Ongoing" tone="tone-blue" iconSrc="/assets/icons/orders-icon.png" />
      <StatCard title="To be delivered" value="0 arriving" tone="tone-green" iconSrc="/assets/icons/tracking-icon.png" />
      <StatCard title="Unpaid invoices" value="$0" tone="tone-yellow" iconSrc="/assets/icons/invoice-icon.png" />
    </div>
  );
};

export default StatsRow;
