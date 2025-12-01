import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderSuccessDialog.css';

const OrderSuccessDialog = ({ isOpen, orderId, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleRefundPolicy = () => {
    // Navigate to settings page with refund policy section
    navigate('/settings');
    onClose();
  };

  const handleClose = () => {
    // Navigate to order detail page
    if (orderId) {
      navigate(`/orders/${orderId}`);
    } else {
      navigate('/orders');
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="order-success-overlay" onClick={handleOverlayClick}>
      <div className="order-success-dialog">
        <button className="order-success-close" onClick={handleClose}>
          ×
        </button>

        <div className="success-icon">
          <div className="success-circle">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <h2 className="success-title">Order Placed Successfully!</h2>
        <p className="success-subtitle">Order confirmed within 2hours.</p>

        <p className="success-message">
          Your order has been received and is being processed.<br />
          We'll notify you once it's ready for delivery.
        </p>

        <button className="refund-policy-link" onClick={handleRefundPolicy}>
          Refund & Cancellation Policy
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessDialog;
