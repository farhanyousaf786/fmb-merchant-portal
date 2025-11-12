import React from 'react';
import './CurrentOrderTracker.css';

const CurrentOrderTracker = () => {
  const orders = [
    {
      id: '#INV-09064',
      description: '68 pics sliced',
      deliveryDate: '20th Oct. 22:30 CT',
      status: 'In Production',
      statusColor: 'purple'
    },
    {
      id: '#INV-09064',
      description: '68 pics sliced',
      deliveryDate: '20th Oct. 22:30 CT',
      status: 'Packed',
      statusColor: 'blue'
    },
    {
      id: '#INV-09064',
      description: '68 pics sliced',
      deliveryDate: '20th Oct. 22:30 CT',
      status: 'Cancelled',
      statusColor: 'red'
    }
  ];

  return (
    <div className="current-order-tracker">
      <h2>Current order tracker</h2>
      <div className="tracker-cards">
        {orders.map((order, index) => (
          <div key={index} className="tracker-card">
            <div className={`progress-bar ${order.statusColor}`}></div>
            <div className="order-info">
              <h3>{order.id} - {order.description}</h3>
              <p>To be delivered: {order.deliveryDate}</p>
            </div>
            <div className="order-actions">
              <span className={`status-badge ${order.statusColor}`}>
                {order.status}
              </span>
              <button className="view-btn">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentOrderTracker;
