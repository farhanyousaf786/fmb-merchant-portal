# Payment System Implementation Guide

## Overview

This document explains the payment system implementation for the FMB Merchant Portal using Stripe for payment processing. The system includes:

- Payment method management (save/delete cards)
- Stripe payment integration
- Payment status tracking
- Order payment processing
- Payment history and records

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User adds items to cart                                                  │
│           ↓                                                                  │
│  2. User clicks Checkout                                                     │
│           ↓                                                                  │
│  3. CheckoutDialog opens with:                                               │
│     - Contact info form                                                      │
│     - Delivery address form                                                  │
│     - Order summary                                                          │
│     - PaymentMethod component                                                │
│           ↓                                                                  │
│  4. User selects/adds payment method                                         │
│           ↓                                                                  │
│  5. System creates Payment Intent (Stripe)                                   │
│           ↓                                                                  │
│  6. User confirms payment                                                    │
│           ↓                                                                  │
│  7. Payment processed → Order created with payment info                      │
│           ↓                                                                  │
│  8. Payment record stored in `payments` table                                │
│           ↓                                                                  │
│  9. Invoice generated with payment status                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Database Schema

### Tables Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │     orders      │     │    payments     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │◄────│ user_id         │     │ id              │
│ email           │     │ payment_status  │◄────│ order_id        │
│ ...             │     │ payment_method_id│    │ stripe_intent_id│
└─────────────────┘     │ stripe_intent_id│     │ amount          │
        │               └─────────────────┘     │ status          │
        │                       ▲               │ receipt_url     │
        ▼                       │               └─────────────────┘
┌─────────────────┐             │
│ payment_methods │─────────────┘
├─────────────────┤
│ id              │
│ user_id         │
│ stripe_pm_id    │
│ brand, last4    │
│ is_default      │
└─────────────────┘
```

### New Tables Added

#### 1. `payment_methods` table
Stores user's saved payment methods from Stripe:

```sql
CREATE TABLE payment_methods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type ENUM('card', 'bank_account') NOT NULL,
  brand VARCHAR(50),
  last4 VARCHAR(4),
  expiry_month INT,
  expiry_year INT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. `payments` table
Stores payment transaction records:

```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  stripe_payment_intent_id VARCHAR(255) NOT NULL,
  stripe_payment_method_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status ENUM('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded') NOT NULL DEFAULT 'pending',
  payment_method_type ENUM('card', 'bank_account') NOT NULL,
  failure_reason TEXT,
  receipt_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### Updated `orders` table
Added payment-related columns:

```sql
ALTER TABLE orders 
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
ADD COLUMN payment_method_id INT,
ADD COLUMN stripe_payment_intent_id VARCHAR(255);
```

## API Endpoints

### Payment Routes (`/api/payments`)

#### 1. Get User's Payment Methods
- **GET** `/api/payments/methods`
- **Auth**: Required (Bearer Token)
- **Response**: 
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": 1,
      "stripe_payment_method_id": "pm_xxx",
      "type": "card",
      "brand": "Visa",
      "last4": "4242",
      "expiry_month": 12,
      "expiry_year": 2025,
      "is_default": true,
      "created_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. Create Payment Intent
- **POST** `/api/payments/create-payment-intent`
- **Auth**: Required (Bearer Token)
- **Body**: 
```json
{
  "amount": 25.50,
  "currency": "usd"
}
```
- **Response**:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### 3. Save Payment Method
- **POST** `/api/payments/methods`
- **Auth**: Required (Bearer Token)
- **Body**:
```json
{
  "stripePaymentMethodId": "pm_xxx",
  "type": "card",
  "brand": "Visa",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": false
}
```

#### 4. Confirm Payment
- **POST** `/api/payments/confirm`
- **Auth**: Required (Bearer Token)
- **Body**:
```json
{
  "orderId": 123,
  "paymentIntentId": "pi_xxx",
  "paymentMethodId": 1
}
```

#### 5. Delete Payment Method
- **DELETE** `/api/payments/methods/:methodId`
- **Auth**: Required (Bearer Token)

#### 6. Set Default Payment Method
- **PUT** `/api/payments/methods/:methodId/default`
- **Auth**: Required (Bearer Token)

#### 7. Get Payment History (All User Payments)
- **GET** `/api/payments/history`
- **Auth**: Required (Bearer Token)
- **Response**:
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "order_id": 15,
      "stripe_payment_intent_id": "pi_xxx",
      "amount": "105.00",
      "currency": "USD",
      "status": "succeeded",
      "payment_method_type": "card",
      "receipt_url": "https://pay.stripe.com/receipt/xxx",
      "created_at": "2025-12-01T00:00:00.000Z",
      "invoice_number": "INV-00015",
      "order_total": "105.00",
      "order_status": "delivered"
    }
  ]
}
```

#### 8. Get Payment Details for Specific Order
- **GET** `/api/payments/order/:orderId`
- **Auth**: Required (Bearer Token)
- **Response**:
```json
{
  "success": true,
  "order": {
    "id": 15,
    "payment_status": "paid",
    "stripe_payment_intent_id": "pi_xxx",
    "total_amount": "105.00"
  },
  "payments": [
    {
      "id": 1,
      "order_id": 15,
      "amount": "105.00",
      "status": "succeeded",
      "receipt_url": "https://pay.stripe.com/receipt/xxx"
    }
  ],
  "paymentMethod": {
    "id": 1,
    "type": "card",
    "brand": "Visa",
    "last4": "4242",
    "expiry_month": 12,
    "expiry_year": 2025
  }
}
```

## API Summary Table

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | GET | /api/payments/methods | Yes | Get saved payment methods |
| 2 | POST | /api/payments/create-payment-intent | Yes | Create Stripe payment intent |
| 3 | POST | /api/payments/methods | Yes | Save new payment method |
| 4 | POST | /api/payments/confirm | Yes | Confirm payment for order |
| 5 | DELETE | /api/payments/methods/:id | Yes | Delete payment method |
| 6 | PUT | /api/payments/methods/:id/default | Yes | Set default payment method |
| 7 | GET | /api/payments/history | Yes | Get all payment history |
| 8 | GET | /api/payments/order/:orderId | Yes | Get payment for specific order |

## Frontend Components

### 1. PaymentMethod Component
Location: `client/src/pages/catalog/components/PaymentMethod.js`

Features:
- Display saved payment methods
- Select payment method for checkout
- Add new payment method (integration ready for Stripe Elements)
- Show payment status and validation

### 2. Updated CheckoutDialog
Integrated payment method selection into the checkout flow:
- Payment method validation before order submission
- Payment completion tracking
- Integration with order creation

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install stripe
```

### 2. Environment Variables
Add to your `.env` file:
```env
STRIPE_SECRET_KEY=sk_test_xxx  # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Your Stripe publishable key (for frontend)
```

### 3. Stripe Integration
To enable actual Stripe payments:

1. **Update PaymentMethod.js**:
   - Install Stripe.js: `npm install @stripe/stripe-js`
   - Initialize Stripe with publishable key
   - Replace mock card form with Stripe Elements
   - Implement actual payment confirmation

2. **Update payments.js routes**:
   - Uncomment Stripe imports and initialization
   - Replace mock responses with actual Stripe API calls
   - Add proper error handling for Stripe failures

3. **Frontend Integration**:
   - Add Stripe.js to your React app
   - Use Stripe Elements for secure card input
   - Handle 3D Secure authentication if required

### 4. Database Migration
The database schema updates are handled automatically in `setup.js`. When you restart your server, the new tables and columns will be created if they don't exist.

## Payment Flow

### 1. Checkout Process
1. User fills contact and delivery information
2. User selects or adds a payment method
3. System creates Stripe Payment Intent
4. User confirms payment (via Stripe Elements)
5. Payment is processed and confirmed
6. Order is created with payment information
7. Invoice is generated with payment status

### 2. Payment Status Tracking
- **pending**: Payment intent created, awaiting confirmation
- **paid**: Payment successfully processed
- **failed**: Payment failed (card declined, etc.)
- **refunded**: Payment was refunded

### 3. Order Status Updates
Orders automatically update based on payment status:
- Successful payment → Order status: "processing"
- Failed payment → Order status: "declined"

## Security Considerations

1. **PCI Compliance**: Never store raw card details. Use Stripe Elements for secure card input.
2. **Token Security**: All payment operations require valid JWT tokens
3. **Webhook Integration**: Consider implementing Stripe webhooks for real-time payment status updates
4. **Error Handling**: Proper error messages without exposing sensitive information

## Testing

### Test Cards (Stripe Sandbox)
Use these test card numbers for testing:
- **Visa**: 4242 4242 4242 4242
- **Mastercard**: 5555 5555 5555 4444
- **Declined**: 4000 0000 0000 0002

Expiry: Any future date
CVC: Any 3 digits
Postal: Any 5 digits

### Mock Mode
The current implementation includes mock responses for testing without actual Stripe payments. To enable real payments:

1. Set up Stripe account and get API keys
2. Update environment variables
3. Uncomment Stripe code in payment routes
4. Add Stripe.js to frontend

## Future Enhancements

1. **Subscription Payments**: Add recurring payment support
2. **Multiple Currencies**: Support international payments
3. **Refund Management**: Admin interface for processing refunds
4. **Payment Analytics**: Dashboard for payment metrics
5. **ACH/Bank Transfers**: Additional payment method types
6. **Apple Pay/Google Pay**: Digital wallet integration

## Troubleshooting

### Common Issues
1. **Payment Intent Creation Fails**: Check Stripe API keys and network connectivity
2. **Payment Method Not Saving**: Verify Stripe Payment Method ID is valid
3. **Order Status Not Updating**: Check payment confirmation webhook or API response
4. **Database Errors**: Ensure database migrations ran successfully

### Error Codes
- **400**: Invalid request data
- **401**: Authentication required
- **404**: Payment method or order not found
- **500**: Server error (check logs for details)

## Support

For payment-related issues:
1. Check Stripe Dashboard for payment status
2. Review server logs for error details
3. Verify database schema is up to date
4. Test with mock mode before using live Stripe keys
