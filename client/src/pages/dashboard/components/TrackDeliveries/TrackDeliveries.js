import React from 'react';
import './TrackDeliveries.css';

const DeliveryItem = ({ title, sub, status }) => (
  <div className={`delivery-item ${status || ''}`}>
    <div className="delivery-title">{title}</div>
    <div className="delivery-sub">{sub}</div>
    <div className={`progress ${status || 'pending'}`}></div>
  </div>
);

const TrackDeliveries = () => {
  return (
    <div className="track-deliveries">
      <div className="section-header">
        <h3>Track deliveries</h3>
        <button className="link-btn" disabled>See all</button>
      </div>
      <div className="deliveries-list">
        <DeliveryItem title="#INV-00000 - No items" sub="To be delivered: —" status="pending" />
        <DeliveryItem title="#INV-00000 - No items" sub="To be delivered: —" status="delayed" />
      </div>
    </div>
  );
};

export default TrackDeliveries;
