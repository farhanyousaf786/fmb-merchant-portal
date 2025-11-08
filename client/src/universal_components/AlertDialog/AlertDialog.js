import React from 'react';
import './AlertDialog.css';

const AlertDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="alert-dialog-overlay" onClick={onClose}>
      <div className="alert-dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="alert-dialog-header">
          <h3>{title}</h3>
          <button className="alert-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="alert-dialog-body">
          <p>{message}</p>
        </div>
        
        <div className="alert-dialog-footer">
          {type === 'confirm' ? (
            <>
              <button className="alert-btn alert-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="alert-btn alert-btn-confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </>
          ) : (
            <button className="alert-btn alert-btn-ok" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertDialog;
