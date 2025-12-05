# Inventory API

Base URL: `http://localhost:4000/api/inventory`

---

## 1. Get All Products

**GET** `/`

**Auth Required:** Yes (Bearer Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "inventory": [
    {
      "id": 1,
      "name": "Raisin Bread",
      "description": "Delicious raisin bread",
      "image_url": "/uploads/bread-1.jpg",
      "sliced_price": "50.00",
      "unsliced_price": "45.00",
      "sliced_quantity": 100,
      "unsliced_quantity": 50,
      "is_active": true,
      "created_at": "2025-11-22T00:00:00.000Z",
      "updated_at": "2025-12-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Whole Wheat Bread",
      "description": "Healthy whole wheat bread",
      "image_url": "/uploads/bread-2.jpg",
      "sliced_price": "40.00",
      "unsliced_price": "35.00",
      "sliced_quantity": 80,
      "unsliced_quantity": 40,
      "is_active": true,
      "created_at": "2025-11-22T00:00:00.000Z",
      "updated_at": "2025-12-01T00:00:00.000Z"
    }
  ]
}
```

**Product Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | number | Product ID |
| name | string | Product name |
| description | string | Product description |
| image_url | string | Product image URL |
| sliced_price | string | Price for sliced version |
| unsliced_price | string | Price for unsliced version |
| sliced_quantity | number | Available sliced quantity |
| unsliced_quantity | number | Available unsliced quantity |
| is_active | boolean | Product is available |
| created_at | datetime | Creation date |
| updated_at | datetime | Last update date |

---

## 2. Get Single Product

**GET** `/:id`

**Auth Required:** Yes (Bearer Token)

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Product ID |

**Example:** `GET /api/inventory/1`

**Success Response (200):**
```json
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Raisin Bread",
    "description": "Delicious raisin bread",
    "image_url": "/uploads/bread-1.jpg",
    "sliced_price": "50.00",
    "unsliced_price": "45.00",
    "sliced_quantity": 100,
    "unsliced_quantity": 50,
    "is_active": true
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

## 3. Create Product (Admin Only)

**POST** `/`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Request Body:**
```json
{
  "name": "Sourdough Bread",
  "description": "Artisan sourdough bread",
  "image_url": "/uploads/bread-3.jpg",
  "sliced_price": 55.00,
  "unsliced_price": 50.00,
  "sliced_quantity": 60,
  "unsliced_quantity": 30,
  "is_active": true
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Product name |
| sliced_price | number | Price for sliced |
| unsliced_price | number | Price for unsliced |

**Optional Fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| description | string | null | Product description |
| image_url | string | null | Product image |
| sliced_quantity | number | 0 | Sliced stock |
| unsliced_quantity | number | 0 | Unsliced stock |
| is_active | boolean | true | Product available |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "productId": 3
}
```

---

## 4. Update Product (Admin Only)

**PUT** `/:id`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Product ID |

**Request Body:**
```json
{
  "name": "Sourdough Bread - Updated",
  "sliced_price": 60.00,
  "sliced_quantity": 80
}
```

All fields are optional - only include fields you want to update.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

---

## 5. Delete Product (Admin Only)

**DELETE** `/:id`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**URL Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Product ID |

**Example:** `DELETE /api/inventory/3`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

---

## 6. Update Stock (Admin Only)

**PUT** `/:id/stock`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Request Body:**
```json
{
  "sliced_quantity": 100,
  "unsliced_quantity": 50
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stock updated successfully"
}
```

---

## API Summary

| # | Method | Endpoint | Auth | Permission | Purpose |
|---|--------|----------|------|------------|---------|
| 1 | GET | / | Yes | All | Get all products |
| 2 | GET | /:id | Yes | All | Get single product |
| 3 | POST | / | Yes | Admin | Create product |
| 4 | PUT | /:id | Yes | Admin | Update product |
| 5 | DELETE | /:id | Yes | Admin | Delete product |
| 6 | PUT | /:id/stock | Yes | Admin | Update stock |

---

## Image Upload

To upload product images, use the Media API:

**POST** `/api/media/upload`

```
Content-Type: multipart/form-data

avatar: <file>
```

Response:
```json
{
  "success": true,
  "url": "/uploads/product-123.jpg"
}
```

Then use the returned URL in the `image_url` field when creating/updating products.
