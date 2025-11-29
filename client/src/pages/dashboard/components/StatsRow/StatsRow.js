import React, { useState, useEffect } from 'react';
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
  const [stats, setStats] = useState({
    submitted: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  useEffect(() => {
    fetchOrderStats();
  }, []);

  const fetchOrderStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const orders = data.orders || [];
        const counts = {
          submitted: orders.filter(o => o.status === 'submitted').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length
        };
        setStats(counts);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  return (
    <div className="dashboard-stats">
      <StatCard 
        title="Submitted" 
        value={stats.submitted} 
        note="new orders" 
        tone="tone-yellow" 
        iconSrc="/assets/icons/orders-icon.png" 
      />
      <StatCard 
        title="Processing" 
        value={stats.processing} 
        note="in progress" 
        tone="tone-blue" 
        iconSrc="/assets/icons/orders-icon.png" 
      />
      <StatCard 
        title="Shipped" 
        value={stats.shipped} 
        note="in transit" 
        tone="tone-purple" 
        iconSrc="/assets/icons/tracking-icon.png" 
      />
      <StatCard 
        title="Delivered" 
        value={stats.delivered} 
        note="completed" 
        tone="tone-green" 
        iconSrc="/assets/icons/tracking-icon.png" 
      />
      <StatCard 
        title="Cancelled" 
        value={stats.cancelled} 
        note="declined" 
        tone="tone-red" 
        iconSrc="/assets/icons/invoice-icon.png" 
      />
    </div>
  );
};

export default StatsRow;
