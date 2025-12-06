# Orders API

Base URL: `http://localhost:4000/api/orders`

---

## 1. Get All Orders

**GET** `/`

**Auth Required:** Yes (Bearer Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Behavior:**
- **Admin:** Returns all orders
- **Merchant/Staff:** Returns only their own orders

**Success Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "id": 17,
      "total_amount": "105.00",
      "created_at": "2025-12-05T20:06:33.000Z",
      "invoice_pdf_url": "/invoices/invoice-17.pdf",
      "payment_status": "paid",
      "stripe_payment_intent_id": "pi_mock_1764968598551",
      "total_quantity": "2",
      "item_names": "Raisin Bread (sliced)",
      "status": "submitted",
      "tracking_number": null
    }
  ]
}
```

**Order Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | number | Order ID |
| total_amount | string | Total order amount |
| created_at | datetime | Order creation date |
| invoice_pdf_url | string | Invoice download URL |
| payment_status | string | `pending`, `paid`, `failed`, `refunded` |
| stripe_payment_intent_id | string | Stripe payment ID |
| total_quantity | string | Total items quantity |
| item_names | string | Comma-separated item names |
| status | string | Order status |
| tracking_number | string | Shipping tracking number |

---

## 2. Get Order Details

**GET** `/:id`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Order ID |

**Example:** `GET /api/orders/17`

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "id": 17,
    "user_id": 1,
    "status": "submitted",
    "contact_first_name": "Muhammad",
    "contact_last_name": "Yousaf",
    "contact_email": "kamran@gmail.com",
    "contact_phone": "9292318782",
    "delivery_address": "84-34 LITTLE NECK PKWY",
    "delivery_city": "FLORAL PARK",
    "delivery_country": "United States",
    "delivery_postal": "11001",
    "notes": "Deliver to loading dock before 8AM...",
    "subtotal_amount": "100.00",
    "tax_amount": "5.00",
    "delivery_fee": "0.00",
    "discount_amount": "0.00",
    "total_amount": "105.00",
    "payment_status": "paid",
    "payment_method_id": 1,
    "stripe_payment_intent_id": "pi_mock_1764968598551",
    "invoice_number": "INV-00017",
    "invoice_pdf_url": "/invoices/invoice-17.pdf",
    "tracking_number": null,
    "created_at": "2025-12-05T20:06:33.000Z",
    "items": [
      {
        "id": 1,
        "inventory_id": 1,
        "name": "Raisin Bread",
        "type": "sliced",
        "unit_price": "50.00",
        "quantity": 2,
        "total": "100.00"
      }
    ],
    "tracking_history": [
      {
        "id": 1,
        "status": "submitted",
        "notes": "Order created",
        "tracking_number": null,
        "updated_at": "2025-12-05T20:06:33.000Z",
        "updated_by_name": "Master Admin"
      }
    ]
  }
}
```

---

## 3. Create Order

**POST** `/`

**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "status": "submitted",
  "contact_first_name": "Muhammad",
  "contact_last_name": "Yousaf",
  "contact_email": "kamran@gmail.com",
  "contact_phone": "9292318782",
  "delivery_address": "84-34 LITTLE NECK PKWY",
  "delivery_city": "FLORAL PARK",
  "delivery_country": "United States",
  "delivery_postal": "11001",
  "notes": "Deliver to loading dock before 8AM...",
  "items": [
    {
      "inventory_id": 1,
      "type": "sliced",
      "unit_price": 50.00,
      "quantity": 2
    }
  ],
  "payment_method_id": 1,
  "stripe_payment_intent_id": "pi_mock_1764968598551",
  "payment_status": "paid"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| items | array | Array of order items |
| items[].inventory_id | number | Product ID |
| items[].type | string | `sliced` or `unsliced` |
| items[].unit_price | number | Price per unit |
| items[].quantity | number | Quantity |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| status | string | Default: `submitted` |
| contact_first_name | string | Customer first name |
| contact_last_name | string | Customer last name |
| contact_email | string | Customer email |
| contact_phone | string | Customer phone |
| delivery_address | string | Delivery address |
| delivery_city | string | City |
| delivery_country | string | Country |
| delivery_postal | string | Postal code |
| notes | string | Order notes |
| payment_method_id | number | Saved payment method ID |
| stripe_payment_intent_id | string | Stripe payment intent ID |
| payment_status | string | `pending`, `paid` |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "orderId": 17,
  "invoiceUrl": "/invoices/invoice-17.pdf"
}
```

---

## 4. Cancel Order

**Endpoint**: `PUT /orders/{id}/cancel`
**Authentication**: Required (Bearer Token)
**Description**: Cancel an order (merchants only, within 10 minutes of placement)

### Request Body (JSON)

```json
{
  "reason": "Customer requested cancellation"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Order ID |
| reason | string | No | Cancellation reason (optional) |

**Rules:**
- Only merchants can cancel their own orders
- Orders can only be cancelled within 10 minutes of placement
- Valid statuses for cancellation: `submitted`, `processing`
- Once admin changes status to `processing` or `shipped`, cancellation is blocked

### Success Response (200)

```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### Error Responses

**Order not found (404)**:
```json
{
  "success": false,
  "error": "Order not found"
}
```

**Cannot cancel (400)**:
```json
{
  "success": false,
  "error": "Order can only be cancelled within 10 minutes of placement"
}
```

**Invalid status (400)**:
```json
{
  "success": false,
  "error": "Cannot cancel order with status: shipped"
}
```

---

## 5. Update Order Status (Admin Only)

**PUT** `/:id/status`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Order ID |

**Request Body:**
```json
{
  "status": "processing",
  "notes": "Order is being prepared",
  "decline_reason": ""
}
```

**Status Options:**
| Status | Description |
|--------|-------------|
| `draft` | Order saved but not submitted |
| `submitted` | Order submitted, awaiting processing |
| `processing` | Order being prepared |
| `shipped` | Order shipped |
| `delivered` | Order delivered |
| `cancelled` | Order cancelled |
| `declined` | Order declined (requires reason) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order status updated successfully"
}
```

---

## 5. Update Tracking Number (Admin Only)

**PUT** `/:id/tracking`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Request Body:**
```json
{
  "tracking_number": "1Z999AA10123456784"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tracking number updated successfully"
}
```

---

## 6. Download Invoice

**GET** `/:id/invoice`

**Auth Required:** Yes (Bearer Token)

**Response:** PDF file download

**Alternative:** Access invoice directly via URL:
```
http://localhost:4000/invoices/invoice-17.pdf
```

---

## Order Status Flow

```
draft → submitted → processing → shipped → delivered
                 ↘ cancelled
                 ↘ declined
```

## Payment Status

| Status | Description |
|--------|-------------|
| `pending` | Payment not yet received |
| `paid` | Payment successful |
| `failed` | Payment failed |
| `refunded` | Payment refunded |
