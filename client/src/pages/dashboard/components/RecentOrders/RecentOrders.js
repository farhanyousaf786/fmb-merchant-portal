import React from 'react';
import './RecentOrders.css';

const RecentOrders = () => {
  return (
    <div className="recent-orders-card">
      <div className="section-header">
        <h3>Recent orders</h3>
      </div>
      <div className="orders-table">
        <div className="orders-head">
          <div>Order ID</div>
          <div>Bread type</div>
          <div>Quantity</div>
          <div>Order date</div>
          <div>Delivery date</div>
          <div>Status</div>
        </div>
        <div className="orders-empty">No data yet</div>
      </div>
    </div>
  );
};

export default RecentOrders;
