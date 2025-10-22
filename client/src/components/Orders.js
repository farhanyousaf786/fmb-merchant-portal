import React, { useState } from 'react';
import './Orders.css';

function Orders() {
  // Mock orders data
  const [orders] = useState([
    {
      id: '001',
      customer: 'John Doe',
      items: 'Burger, Fries, Coke',
      total: '$25.50',
      status: 'pending',
      time: '2 mins ago'
    },
    {
      id: '002',
      customer: 'Jane Smith',
      items: 'Pizza, Salad',
      total: '$32.00',
      status: 'preparing',
      time: '5 mins ago'
    },
    {
      id: '003',
      customer: 'Mike Johnson',
      items: 'Sandwich, Coffee',
      total: '$15.75',
      status: 'ready',
      time: '10 mins ago'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#ff9800';
      case 'preparing': return '#2196f3';
      case 'ready': return '#4caf50';
      case 'delivering': return '#9c27b0';
      default: return '#666';
    }
  };

  return (
    <div className="orders">
      <h2>Active Orders</h2>
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span 
                className="order-status"
                style={{ background: getStatusColor(order.status) }}
              >
                {order.status}
              </span>
            </div>
            <div className="order-body">
              <p><strong>{order.customer}</strong></p>
              <p className="order-items">{order.items}</p>
              <p className="order-total">{order.total}</p>
              <p className="order-time">{order.time}</p>
            </div>
            <div className="order-actions">
              <button className="btn-accept">Accept</button>
              <button className="btn-reject">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
