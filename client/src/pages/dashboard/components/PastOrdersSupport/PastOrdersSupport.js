import React from 'react';
import './PastOrdersSupport.css';

const PastOrdersSupport = () => {
  const pastOrders = [
    {
      orderId: '#09064',
      breadType: 'Unsliced',
      quantity: 100,
      orderDate: '20 Oct, 2025',
      deliveryDate: '20 Oct, 2025'
    },
    {
      orderId: '#09064',
      breadType: 'Unsliced',
      quantity: 100,
      orderDate: '20 Oct, 2025',
      deliveryDate: '20 Oct, 2025'
    },
    {
      orderId: '#09064',
      breadType: 'Sliced',
      quantity: 100,
      orderDate: '20 Oct, 2025',
      deliveryDate: '20 Oct, 2025'
    }
  ];

  return (
    <div className="past-orders-support">
      {/* Past Orders Section */}
      <div className="past-orders-section">
        <h2>Past orders</h2>
        <div className="orders-table">
          <div className="table-header">
            <span>Order ID</span>
            <span>Bread type</span>
            <span>Quantity</span>
            <span>Order date</span>
            <span>Delivery date</span>
            <span>Action</span>
          </div>
          {pastOrders.map((order, index) => (
            <div key={index} className="table-row">
              <span className="order-id">{order.orderId}</span>
              <span className="bread-type">{order.breadType}</span>
              <span className="quantity">{order.quantity}</span>
              <span className="order-date">{order.orderDate}</span>
              <span className="delivery-date">{order.deliveryDate}</span>
              <div className="action-buttons">
                <button className="repeat-order-btn">Repeat order</button>
                <button className="rate-btn">Rate</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <div className="support-card">
          <div className="support-icon">
            <img src="/assets/icons/support-icon.png" alt="Support" />
          </div>
          <h3>Have an issue? Send us a message!</h3>
          <div className="contact-info">
            <p>Email: support@fmb.com</p>
            <p>Phone: +234 800 000 0000</p>
          </div>
          <button className="contact-support-btn">Contact support</button>
        </div>
      </div>
    </div>
  );
};

export default PastOrdersSupport;
