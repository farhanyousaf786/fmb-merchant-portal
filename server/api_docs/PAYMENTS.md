# Payments API

Base URL: `http://localhost:4000/api/payments`

---

## 1. Test Endpoint

**GET** `/test`

**Auth Required:** No

**Description:** Verify payment routes are working

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment routes are working!"
}
```

---

## 2. Get Payment Methods

**GET** `/methods`

**Auth Required:** Yes (Bearer Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Description:** Get user's saved payment methods (cards)

**Success Response (200):**
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": 1,
      "user_id": 1,
      "stripe_payment_method_id": "pm_card_visa",
      "type": "card",
      "brand": "Visa",
      "last4": "4242",
      "expiry_month": 12,
      "expiry_year": 2025,
      "is_default": true,
      "created_at": "2025-12-05T00:00:00.000Z"
    }
  ]
}
```

**Payment Method Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | number | Payment method ID |
| stripe_payment_method_id | string | Stripe PM ID |
| type | string | `card` or `bank_account` |
| brand | string | Card brand (Visa, Mastercard, etc.) |
| last4 | string | Last 4 digits |
| expiry_month | number | Expiration month |
| expiry_year | number | Expiration year |
| is_default | boolean | Default payment method |

---

## 3. Create Payment Intent

**POST** `/create-payment-intent`

**Auth Required:** Yes (Bearer Token)

**Description:** Create a Stripe payment intent for checkout

**Request Body:**
```json
{
  "amount": 105.50,
  "currency": "usd"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| amount | number | Amount in dollars (e.g., 105.50) |

**Optional Fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| currency | string | `usd` | Currency code |

**Success Response (200):**
```json
{
  "success": true,
  "clientSecret": "pi_mock_1764968598551_secret_abc123xyz",
  "paymentIntentId": "pi_mock_1764968598551"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Valid amount is required"
}
```

---

## 4. Save Payment Method

**POST** `/methods`

**Auth Required:** Yes (Bearer Token)

**Description:** Save a new payment method (card) for the user

**Request Body:**
```json
{
  "stripePaymentMethodId": "pm_card_visa",
  "type": "card",
  "brand": "Visa",
  "last4": "4242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": true
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| stripePaymentMethodId | string | Stripe payment method ID |
| type | string | `card` or `bank_account` |
| last4 | string | Last 4 digits |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| brand | string | Card brand |
| expiryMonth | number | Expiration month |
| expiryYear | number | Expiration year |
| isDefault | boolean | Set as default (default: false) |

**Success Response (200):**
```json
{
  "success": true,
  "paymentMethodId": 1
}
```

---

## 5. Delete Payment Method

**DELETE** `/methods/:methodId`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| methodId | number | Payment method ID |

**Example:** `DELETE /api/payments/methods/1`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Payment method not found"
}
```

---

## 6. Set Default Payment Method

**PUT** `/methods/:methodId/default`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| methodId | number | Payment method ID |

**Example:** `PUT /api/payments/methods/1/default`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Default payment method updated"
}
```

---

## 7. Get Payment History

**GET** `/history`

**Auth Required:** Yes (Bearer Token)

**Description:** Get all payment transactions for the user

**Success Response (200):**
```json
{
  "success": true,
  "payments": [
    {
      "id": 1,
      "order_id": 17,
      "stripe_payment_intent_id": "pi_mock_1764968598551",
      "stripe_payment_method_id": "1",
      "amount": "105.00",
      "currency": "USD",
      "status": "succeeded",
      "payment_method_type": "card",
      "receipt_url": "https://pay.stripe.com/receipt/mock/pi_mock_1764968598551",
      "created_at": "2025-12-05T20:06:33.000Z",
      "invoice_number": "INV-00017",
      "order_total": "105.00",
      "order_status": "submitted"
    }
  ]
}
```

---

## 8. Get Payment for Order

**GET** `/order/:orderId`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | number | Order ID |

**Example:** `GET /api/payments/order/17`

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "id": 17,
    "payment_status": "paid",
    "stripe_payment_intent_id": "pi_mock_1764968598551",
    "total_amount": "105.00"
  },
  "payments": [
    {
      "id": 1,
      "order_id": 17,
      "amount": "105.00",
      "status": "succeeded",
      "receipt_url": "https://pay.stripe.com/receipt/mock/pi_mock_1764968598551"
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

---

## API Summary

| # | Method | Endpoint | Auth | Purpose |
|---|--------|----------|------|---------|
| 1 | GET | /test | No | Test endpoint |
| 2 | GET | /methods | Yes | Get saved payment methods |
| 3 | POST | /create-payment-intent | Yes | Create payment intent |
| 4 | POST | /methods | Yes | Save payment method |
| 5 | DELETE | /methods/:id | Yes | Delete payment method |
| 6 | PUT | /methods/:id/default | Yes | Set default method |
| 7 | GET | /history | Yes | Get payment history |
| 8 | GET | /order/:orderId | Yes | Get payment for order |

---

## Payment Flow

```
1. User selects payment method
         ↓
2. POST /create-payment-intent (amount)
         ↓
3. Receive paymentIntentId
         ↓
4. Create order with paymentIntentId
         ↓
5. Payment record created in database
```

---

## Test Card Numbers (Stripe Sandbox)

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 9995 | Insufficient funds |

- **Expiry:** Any future date
- **CVC:** Any 3 digits
- **ZIP:** Any 5 digits
