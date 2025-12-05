# Support & Tickets API

Base URL: `http://localhost:4000/api`

---

# Support Tickets

Base URL: `http://localhost:4000/api/tickets`

---

## 1. Get All Tickets

**GET** `/`

**Auth Required:** Yes (Bearer Token)

**Behavior:**
- **Admin:** Returns all tickets
- **User:** Returns only their own tickets

**Success Response (200):**
```json
{
  "success": true,
  "tickets": [
    {
      "id": 1,
      "user_id": 2,
      "subject": "Order Issue",
      "description": "My order was damaged",
      "status": "open",
      "priority": "high",
      "created_at": "2025-12-01T00:00:00.000Z",
      "updated_at": "2025-12-01T00:00:00.000Z",
      "user_name": "John Doe",
      "user_email": "john@example.com"
    }
  ]
}
```

**Ticket Status:**
| Status | Description |
|--------|-------------|
| `open` | New ticket, awaiting response |
| `in_progress` | Being worked on |
| `resolved` | Issue resolved |
| `closed` | Ticket closed |

**Priority Levels:**
| Priority | Description |
|----------|-------------|
| `low` | Non-urgent issue |
| `medium` | Normal priority |
| `high` | Urgent issue |

---

## 2. Get Single Ticket

**GET** `/:id`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Ticket ID |

**Success Response (200):**
```json
{
  "success": true,
  "ticket": {
    "id": 1,
    "user_id": 2,
    "subject": "Order Issue",
    "description": "My order was damaged",
    "status": "open",
    "priority": "high",
    "created_at": "2025-12-01T00:00:00.000Z",
    "messages": [
      {
        "id": 1,
        "ticket_id": 1,
        "user_id": 2,
        "message": "Please help with my order",
        "is_admin": false,
        "created_at": "2025-12-01T00:00:00.000Z",
        "user_name": "John Doe"
      },
      {
        "id": 2,
        "ticket_id": 1,
        "user_id": 1,
        "message": "We are looking into this",
        "is_admin": true,
        "created_at": "2025-12-01T01:00:00.000Z",
        "user_name": "Admin"
      }
    ]
  }
}
```

---

## 3. Create Ticket

**POST** `/`

**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "subject": "Order Issue",
  "description": "My order #00015 was damaged during shipping",
  "priority": "high"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| subject | string | Ticket subject |
| description | string | Issue description |

**Optional Fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| priority | string | `medium` | `low`, `medium`, `high` |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Ticket created successfully",
  "ticketId": 1
}
```

---

## 4. Add Message to Ticket

**POST** `/:id/messages`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Ticket ID |

**Request Body:**
```json
{
  "message": "Here are more details about the issue..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message added successfully",
  "messageId": 3
}
```

---

## 5. Update Ticket Status (Admin Only)

**PUT** `/:id/status`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket status updated"
}
```

---

## 6. Close Ticket

**PUT** `/:id/close`

**Auth Required:** Yes (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket closed successfully"
}
```

---

# Reviews API

Base URL: `http://localhost:4000/api/reviews`

---

## 1. Get All Reviews (Admin Only)

**GET** `/`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Success Response (200):**
```json
{
  "success": true,
  "reviews": [
    {
      "id": 1,
      "rating": 5,
      "feedback": "Great service!",
      "created_at": "2025-12-01T00:00:00.000Z",
      "order_number": 15,
      "first_name": "John",
      "last_name": "Doe",
      "business_name": "Bakery Inc"
    }
  ]
}
```

---

## 2. Submit Review

**POST** `/`

**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "order_id": 15,
  "rating": 5,
  "feedback": "Great service! The bread was fresh and delicious."
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| order_id | number | Order ID being reviewed |
| rating | number | 1-5 star rating |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| feedback | string | Written feedback |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "reviewId": 1
}
```

---

## API Summary

### Tickets

| # | Method | Endpoint | Auth | Permission | Purpose |
|---|--------|----------|------|------------|---------|
| 1 | GET | /tickets | Yes | All | Get all tickets |
| 2 | GET | /tickets/:id | Yes | All | Get single ticket |
| 3 | POST | /tickets | Yes | All | Create ticket |
| 4 | POST | /tickets/:id/messages | Yes | All | Add message |
| 5 | PUT | /tickets/:id/status | Yes | Admin | Update status |
| 6 | PUT | /tickets/:id/close | Yes | All | Close ticket |

### Reviews

| # | Method | Endpoint | Auth | Permission | Purpose |
|---|--------|----------|------|------------|---------|
| 1 | GET | /reviews | Yes | Admin | Get all reviews |
| 2 | POST | /reviews | Yes | All | Submit review |
