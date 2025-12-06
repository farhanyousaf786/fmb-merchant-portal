import React, { useState } from 'react';
import './CancelConfirmDialog.css';

const CancelConfirmDialog = ({ isOpen, onClose, onConfirm, timeLeft, loading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="cancel-modal-overlay" onClick={onClose}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-modal-header">
          <h3>Cancel Order</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="cancel-modal-body">
          {timeLeft !== null && (
            <div className="timer-warning">
              <span className="timer-icon">⏰</span>
              <div className="timer-text">
                <strong>Time remaining: {timeLeft} minutes</strong>
                <p>After this time, you'll need to call the merchant to cancel</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Reason for cancellation (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this order..."
                rows={4}
                maxLength={500}
              />
              <small>{reason.length}/500 characters</small>
            </div>
            
            <div className="cancel-modal-footer">
              <button 
                type="button" 
                className="cancel-btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                Keep Order
              </button>
              <button 
                type="submit" 
                className="cancel-btn-danger" 
                disabled={loading}
              >
                {loading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmDialog;
