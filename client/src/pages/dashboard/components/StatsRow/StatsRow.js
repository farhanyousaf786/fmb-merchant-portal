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
      <StatCard title="Ongoing Orders" value="0" note="Active orders" tone="tone-blue" iconSrc="/assets/icons/orders-icon.png" />
      <StatCard title="To be delivered" value="0" note="arriving" tone="tone-green" iconSrc="/assets/icons/tracking-icon.png" />
      <StatCard title="Unpaid Invoices" value="$0" note="pending payment" tone="tone-yellow" iconSrc="/assets/icons/invoice-icon.png" />
    </div>
  );
};

export default StatsRow;
