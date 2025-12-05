import React, { useState, useEffect } from 'react';
import './PaymentMethod.css';

const PaymentMethod = ({ onPaymentMethodSelect, selectedAmount, onPaymentComplete }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${process.env.REACT_APP_API_URL}/payments/methods`;
      
      console.log('💳 Fetching payment methods...');
      console.log('🔑 Token:', token ? 'Found' : 'NOT FOUND');
      console.log('🌐 API URL:', apiUrl);
      
      if (!token) {
        console.error('❌ No auth token found in localStorage');
        return;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        setPaymentMethods(data.paymentMethods);
        console.log('✅ Payment methods loaded:', data.paymentMethods.length);
      } else {
        console.error('❌ API Error:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = `${process.env.REACT_APP_API_URL}/payments/create-payment-intent`;
      
      console.log('\n💰 Creating payment intent...');
      console.log('🔑 Token:', token ? 'Found' : 'NOT FOUND');
      console.log('💵 Amount:', selectedAmount);
      console.log('🌐 API URL:', apiUrl);
      
      if (!token) {
        console.error('❌ No auth token found');
        throw new Error('Authentication required. Please login again.');
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: selectedAmount,
          currency: 'usd'
        })
      });
      
      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);
      
      if (data.success) {
        console.log('✅ Payment intent created:', data.paymentIntentId);
        return data.clientSecret;
      } else {
        console.error('❌ API Error:', data.error);
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('❌ Error creating payment intent:', error.message);
      throw error;
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (onPaymentMethodSelect) {
      onPaymentMethodSelect(method);
    }
  };

  const handleNewCard = async () => {
    setShowNewCardForm(true);
    // In a real implementation, you would initialize Stripe Elements here
    // For now, we'll show a mock card form
  };

  const handlePayNow = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setProcessingPayment(true);
    
    try {
      // Create payment intent
      const secret = await createPaymentIntent();
      if (!secret) {
        throw new Error('Failed to create payment intent');
      }

      // In a real implementation, you would confirm the payment with Stripe here
      // For now, we'll simulate a successful payment
      setTimeout(async () => {
        // Mock successful payment
        if (onPaymentComplete) {
          onPaymentComplete({
            paymentIntentId: 'pi_mock_' + Date.now(),
            paymentMethodId: selectedMethod.id,
            status: 'succeeded'
          });
        }
        setProcessingPayment(false);
      }, 2000);
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setProcessingPayment(false);
      const errorMessage = error.message || 'Payment failed. Please try again.';
      alert(`❌ Payment Error: ${errorMessage}`);
    }
  };

  const getCardDisplay = (method) => {
    if (method.type === 'card') {
      return (
        <div className="card-display">
          <div className="card-brand">{method.brand || 'Card'}</div>
          <div className="card-number">•••• •••• •••• {method.last4}</div>
          {method.expiry_month && method.expiry_year && (
            <div className="card-expiry">Expires {method.expiry_month}/{method.expiry_year}</div>
          )}
        </div>
      );
    }
    return <div className="method-type">{method.type}</div>;
  };

  if (loading) {
    return <div className="payment-method-loading">Loading payment methods...</div>;
  }

  return (
    <div className="payment-method-container">
      <h3>Payment Method</h3>
      
      {!showNewCardForm ? (
        <>
          <div className="payment-methods-list">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`payment-method-item ${selectedMethod?.id === method.id ? 'selected' : ''} ${method.is_default ? 'default' : ''}`}
                onClick={() => handleMethodSelect(method)}
              >
                <div className="method-info">
                  {getCardDisplay(method)}
                  {method.is_default && <span className="default-badge">Default</span>}
                </div>
                <div className="method-radio">
                  <input
                    type="radio"
                    name="payment-method"
                    checked={selectedMethod?.id === method.id}
                    onChange={() => handleMethodSelect(method)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="payment-actions">
            <button 
              className="add-card-btn"
              onClick={handleNewCard}
            >
              + Add New Card
            </button>
          </div>
        </>
      ) : (
        <div className="new-card-form">
          <h4>Add New Card</h4>
          <div className="card-form-mock">
            <p>Stripe Elements would be integrated here for secure card input.</p>
            <p>For demo purposes, this would include:</p>
            <ul>
              <li>Card Number input</li>
              <li>Expiry Date input</li>
              <li>CVC input</li>
              <li>Postal Code input</li>
            </ul>
          </div>
          <div className="form-actions">
            <button 
              className="cancel-btn"
              onClick={() => setShowNewCardForm(false)}
            >
              Cancel
            </button>
            <button 
              className="save-card-btn"
              onClick={() => {
                // Mock saving card
                const newMethod = {
                  id: Date.now(),
                  type: 'card',
                  brand: 'Visa',
                  last4: '4242',
                  expiry_month: 12,
                  expiry_year: 2025,
                  is_default: paymentMethods.length === 0
                };
                setPaymentMethods([...paymentMethods, newMethod]);
                setShowNewCardForm(false);
                handleMethodSelect(newMethod);
              }}
            >
              Save Card
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethod;
