import React, { useState, useEffect } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ onPaymentMethodSelect, selectedAmount, onPaymentComplete }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentType, setPaymentType] = useState(null); // 'card' or 'cash'
  const [loading, setLoading] = useState(true);
  const [newCardData, setNewCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: ''
  });

  // Check if we're in testing/development mode
  const isTestMode = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' ||
                     process.env.REACT_APP_API_URL?.includes('localhost');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Auto-fill test card when card payment is selected in test mode
  useEffect(() => {
    if (paymentType === 'card' && isTestMode && !newCardData.cardNumber) {
      // Auto-fill test card data in test mode
      setNewCardData({
        cardholderName: 'Test User',
        cardNumber: '4242 4242 4242 4242',
        expiryMonth: '12',
        expiryYear: String(new Date().getFullYear() + 3),
        cvc: '123'
      });
    }
  }, [paymentType, isTestMode]);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${process.env.REACT_APP_API_URL}/payments/methods`;
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentTypeSelect = (type) => {
    setPaymentType(type);
    if (type === 'cash') {
      setSelectedMethod({ type: 'cash', id: 'cash_on_delivery' });
      if (onPaymentMethodSelect) {
        onPaymentMethodSelect({ type: 'cash', id: 'cash_on_delivery', paymentType: 'cash_on_delivery' });
      }
    } else if (type === 'card') {
      // In test mode, auto-select the test card
      if (isTestMode) {
        const testCard = {
          id: 'test_card',
          type: 'card',
          brand: 'Visa',
          last4: '4242',
          expiry_month: 12,
          expiry_year: new Date().getFullYear() + 3,
          cardholderName: 'Test User',
          isTestCard: true
        };
        setSelectedMethod(testCard);
        if (onPaymentMethodSelect) {
          onPaymentMethodSelect({ ...testCard, paymentType: 'card' });
        }
      } else {
        setSelectedMethod(null);
        if (onPaymentMethodSelect) {
          onPaymentMethodSelect(null);
        }
      }
    }
  };

  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setNewCardData(prev => ({ ...prev, [name]: formatted.slice(0, 19) }));
      
      // Auto-update selected method
      const cardNum = formatted.replace(/\s/g, '');
      if (cardNum.length >= 15) {
        const cardMethod = {
          id: Date.now(),
          type: 'card',
          brand: getCardBrand(cardNum),
          last4: cardNum.slice(-4),
          expiry_month: parseInt(newCardData.expiryMonth) || 12,
          expiry_year: parseInt(newCardData.expiryYear) || new Date().getFullYear() + 1,
          cardholderName: newCardData.cardholderName
        };
        setSelectedMethod(cardMethod);
        if (onPaymentMethodSelect) {
          onPaymentMethodSelect({ ...cardMethod, paymentType: 'card' });
        }
      }
      return;
    }
    
    setNewCardData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Update selected method when form is complete
      const cardNum = updated.cardNumber.replace(/\s/g, '');
      if (cardNum.length >= 15 && updated.expiryMonth && updated.expiryYear && updated.cvc) {
        const cardMethod = {
          id: Date.now(),
          type: 'card',
          brand: getCardBrand(cardNum),
          last4: cardNum.slice(-4),
          expiry_month: parseInt(updated.expiryMonth),
          expiry_year: parseInt(updated.expiryYear),
          cardholderName: updated.cardholderName
        };
        setSelectedMethod(cardMethod);
        if (onPaymentMethodSelect) {
          onPaymentMethodSelect({ ...cardMethod, paymentType: 'card' });
        }
      }
      
      return updated;
    });
  };

  const getCardBrand = (cardNumber) => {
    const num = cardNumber.replace(/\s/g, '');
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    if (/^6(?:011|5)/.test(num)) return 'Discover';
    return 'Card';
  };

  if (loading) {
    return <div className="payment-method-loading">Loading payment methods...</div>;
  }

  return (
    <div className="payment-method-container">
      <h3>Payment Method</h3>
      
      {/* Test Mode Indicator */}
      {isTestMode && (
        <div className="test-mode-banner">
          🧪 Test Mode - Card details auto-filled for testing
        </div>
      )}
      
      {/* Payment Type Selection */}
      <div className="payment-type-selection">
        <div 
          className={`payment-type-option ${paymentType === 'card' ? 'selected' : ''}`}
          onClick={() => handlePaymentTypeSelect('card')}
        >
          <div className="payment-type-icon card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#3b82f6" strokeWidth="2"/>
              <path d="M2 10H22" stroke="#3b82f6" strokeWidth="2"/>
              <rect x="5" y="14" width="4" height="2" rx="0.5" fill="#3b82f6"/>
            </svg>
          </div>
          <div className="payment-type-info">
            <span className="payment-type-title">Pay with Card</span>
            <span className="payment-type-desc">Credit or Debit Card</span>
          </div>
          <div className={`radio-circle ${paymentType === 'card' ? 'checked' : ''}`}>
            {paymentType === 'card' && <div className="radio-dot"></div>}
          </div>
        </div>
        
        <div 
          className={`payment-type-option ${paymentType === 'cash' ? 'selected' : ''}`}
          onClick={() => handlePaymentTypeSelect('cash')}
        >
          <div className="payment-type-icon cash-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="#10b981" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="#10b981" strokeWidth="2"/>
              <path d="M6 9V9.01M18 15V15.01" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="payment-type-info">
            <span className="payment-type-title">Cash on Delivery</span>
            <span className="payment-type-desc">Pay when you receive</span>
          </div>
          <div className={`radio-circle ${paymentType === 'cash' ? 'checked' : ''}`}>
            {paymentType === 'cash' && <div className="radio-dot"></div>}
          </div>
        </div>
      </div>

      {/* Card Form - Shows directly when card is selected */}
      {paymentType === 'card' && (
        <div className="card-form-inline">
          <div className="card-form-fields">
            <div className="form-field">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardholderName"
                value={newCardData.cardholderName}
                onChange={handleNewCardChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="form-field">
              <label>Card Number</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  name="cardNumber"
                  value={newCardData.cardNumber}
                  onChange={handleNewCardChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                />
                {newCardData.cardNumber && (
                  <span className="card-brand-indicator">
                    {getCardBrand(newCardData.cardNumber)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="form-row-three">
              <div className="form-field">
                <label>Month</label>
                <select
                  name="expiryMonth"
                  value={newCardData.expiryMonth}
                  onChange={handleNewCardChange}
                >
                  <option value="">MM</option>
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={String(m).padStart(2, '0')}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-field">
                <label>Year</label>
                <select
                  name="expiryYear"
                  value={newCardData.expiryYear}
                  onChange={handleNewCardChange}
                >
                  <option value="">YYYY</option>
                  {Array.from({length: 10}, (_, i) => new Date().getFullYear() + i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-field">
                <label>CVC</label>
                <input
                  type="text"
                  name="cvc"
                  value={newCardData.cvc}
                  onChange={handleNewCardChange}
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
          
          {/* Card Preview */}
          {newCardData.cardNumber && (
            <div className="card-preview">
              <div className="card-preview-brand">{getCardBrand(newCardData.cardNumber)}</div>
              <div className="card-preview-number">•••• •••• •••• {newCardData.cardNumber.slice(-4)}</div>
              <div className="card-preview-details">
                <span>{newCardData.cardholderName || 'CARDHOLDER'}</span>
                <span>{newCardData.expiryMonth}/{newCardData.expiryYear?.slice(-2) || 'YY'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cash on Delivery Info */}
      {paymentType === 'cash' && (
        <div className="cash-on-delivery-info">
          <div className="cod-check-icon">✓</div>
          <div className="cod-content">
            <p className="cod-amount">Pay <strong>${selectedAmount?.toFixed(2) || '0.00'}</strong> on delivery</p>
            <p className="cod-note">Please have the exact amount ready for the delivery person.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
