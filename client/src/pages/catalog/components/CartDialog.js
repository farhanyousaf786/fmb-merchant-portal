import React from 'react';
import './CartDialog.css';

const CartDialog = ({ isOpen, cart, cartTotal, onClose, onCheckout }) => {
  if (!isOpen) return null;

  const hasItems = cart && cart.length > 0;

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h2>Order Summary</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="order-modal-body">
          {hasItems ? (
            <table className="order-summary-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Unit Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.inventoryId}-${item.type}-${index}`}>
                    <td>{item.name}</td>
                    <td>{item.type === 'sliced' ? 'Sliced' : 'Unsliced'}</td>
                    <td>${item.unitPrice.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="order-summary-total-row">
                  <td colSpan="4" className="label">Total</td>
                  <td className="value">${cartTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="order-empty-state">No items in cart yet.</div>
          )}
        </div>
        <div className="order-modal-footer">
          <button
            className="primary-btn"
            onClick={() => hasItems && onCheckout()}
            disabled={!hasItems}
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDialog;
