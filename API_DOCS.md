# FMB Merchant Portal – API Documentation

Simple overview of backend APIs, written in clear English.

Base URL in development:

```text
http://localhost:4000/api
```

---

## 1. Health Check

**Method:** `GET`

**URL:** `/api/health`

**Auth:** No

**What it does:**
Checks if the server is running. Good for monitoring or quick tests.

**Successful response example:**
```json
{
  "ok": true
}
```

---

## 2. Authentication & User Profile ( `/api/auth` )

### 2.1 Admin Login

**Method:** `POST`

**URL:** `/api/auth/admin/login`

**Auth:** No

**Body (JSON):**
```json
{
  "email": "fmb@admin.com",
  "password": "admin"
}
```

**What it does:**
- Checks the email and password.
- If valid, returns a JWT token and user info.

**Successful response (simplified):**
```json
{
  "success": true,
  "token": "<JWT_TOKEN>",
  "user": {
    "id": 1,
    "first_name": "Master",
    "last_name": "Admin",
    "email": "fmb@admin.com",
    "role": "admin",
    "status": "active"
  }
}
```

---

### 2.2 Admin Register (Signup)

**Method:** `POST`

**URL:** `/api/auth/admin/register`

**Auth:** No

**Body (JSON):**
```json
{
  "business_name": "Famous Moms Bakery",
  "primary_contact_name": "John Smith",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@bakery.com",
  "password": "Secret123!",
  "phone": "+1-555-0123",
  "legal_address": "123 Main Street",
  "country": "United States",
  "city": "New York",
  "postal": "10001",
  "zip": "10001"
}
```

**Required fields:**
- `business_name`, `primary_contact_name`
- `first_name`, `last_name`
- `email`, `password`
- `legal_address`, `country`, `city`

**What it does:**
- Creates a new user record in the `users` table.
- Returns a token and user info when successful.

**Example success (simplified):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<JWT_TOKEN>",
  "user": { "id": 2, "email": "john@bakery.com", "role": "merchant" }
}
```

---

### 2.3 Get Current User

**Method:** `GET`

**URL:** `/api/auth/me`

**Auth:** Yes (Bearer token)

**Headers:**
```text
Authorization: Bearer <JWT_TOKEN>
```

**What it does:**
- Reads the token.
- Returns the current logged-in user’s profile.

**Example response (simplified):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "first_name": "Master",
    "last_name": "Admin",
    "email": "fmb@admin.com",
    "phone": "...",
    "country": "...",
    "legal_address": "...",
    "avatar_url": "/uploads/avatar-123.jpg",
    "role": "admin",
    "status": "active"
  }
}
```

---

### 2.4 Update Own Profile

**Method:** `PUT`

**URL:** `/api/auth/update`

**Auth:** Yes (Bearer token)

**Headers:**
```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "first_name": "Master",
  "last_name": "Admin",
  "email": "fmb@admin.com",
  "phone": "+1-555-0123",
  "country": "United States",
  "legal_address": "123 Main Street",
  "avatar_url": "/uploads/avatar-123.jpg"
}
```

**What it does:**
- Updates fields for the currently logged-in user.
- Also updates `avatar_url` if provided.

**Response (on success):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { "id": 1, "first_name": "Master", "avatar_url": "/uploads/avatar-123.jpg" }
}
```

---

### 2.5 Get All Users (Admin Only)

**Method:** `GET`

**URL:** `/api/auth/all-users`

**Auth:** Yes (Bearer token, should be admin)

**Headers:**
```text
Authorization: Bearer <JWT_TOKEN>
```

**What it does:**
- Returns a list of all users in the system.
- Used by Users Management page.

**Example response (simplified):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "first_name": "Master",
      "last_name": "Admin",
      "email": "fmb@admin.com",
      "role": "admin",
      "status": "active",
      "created_at": "2025-11-17T21:44:00.000Z"
    }
  ]
}
```

---

### 2.6 Update User Status (Admin Only)

**Method:** `PUT`

**URL:** `/api/auth/update-user-status`

**Auth:** Yes (Bearer token, should be admin)

**Headers:**
```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "userId": 2,
  "status": "inactive"
}
```

**Allowed `status` values:**
- `"active"`
- `"inactive"`

**What it does:**
- Changes a user’s status in the database.
- Used by the Users Management page dropdown.

**Response (success):**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

---

## 3. Media Upload ( `/api/media` )

Used for avatar and item images.

### 3.1 Upload Image

**Method:** `POST`

**URL:** `/api/media/upload`

**Auth:** Yes (Bearer token)

**Headers:**
- `Authorization: Bearer <JWT_TOKEN>`
- `Content-Type: multipart/form-data` (Postman: use "form-data" tab)

**Body (form-data):**
- Key: `avatar` (type: File)
- Value: *select an image file from your device*

**Limits:**
- Max size: 5MB
- Only image MIME types allowed (e.g. `image/jpeg`, `image/png`)

**What it does:**
- Saves the file into `server/public/uploads/`.
- Returns a URL path you can store in DB.

**Response (success):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "url": "/uploads/avatar-123456789.jpg",
  "filename": "avatar-123456789.jpg"
}
```

**How to use the URL:**
- Public URL in browser:
  ```text
  http://localhost:4000/uploads/avatar-123456789.jpg
  ```
- Save `/uploads/...` in DB and prepend `http://localhost:4000` on the frontend when rendering.

---

## 4. Inventory APIs ( `/api/inventory` )

These are used by:
- Inventory Management page (admin only)
- Catalogs page (read-only list)

All inventory endpoints require a valid token.

Common header:
```text
Authorization: Bearer <JWT_TOKEN>
```

### 4.1 Add New Item

**Method:** `POST`

**URL:** `/api/inventory/add`

**Auth:** Yes

**Headers:**
```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Sourdough Bread",
  "price": 5.99,
  "image": "/uploads/avatar-123.jpg",   // optional if you uploaded an image first
  "description": "Slow-fermented sourdough loaf",
  "note": "Best served fresh on the same day"
}
```

**Notes:**
- `name` and `price` are required.
- If `image` is empty, the server fills a default bread image.
- If you use the UI, it can upload a file through `/api/media/upload` first and send the URL here.

**Success response:**
```json
{
  "success": true,
  "id": 10,
  "message": "Item added successfully"
}
```

---

### 4.2 Get All Items

**Method:** `GET`

**URL:** `/api/inventory/all`

**Auth:** Yes

**What it does:**
- Returns all inventory items sorted by newest first.
- Used by the Catalogs page and Inventory Management page.

**Response example:**
```json
{
  "success": true,
  "items": [
    {
      "id": 10,
      "name": "Sourdough Bread",
      "price": 5.99,
      "image": "/uploads/avatar-123.jpg",
      "description": "Slow-fermented sourdough loaf",
      "note": "Best served fresh on the same day",
      "created_at": "2025-11-22T19:40:00.000Z"
    }
  ]
}
```

---

### 4.3 Update Item

**Method:** `PUT`

**URL:** `/api/inventory/:id`

**Auth:** Yes

**Headers:**
```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Updated Bread Name",
  "price": 6.49,
  "image": "/uploads/new-image.jpg",  
  "description": "Updated description",
  "note": "Updated note"
}
```

**What it does:**
- Updates the item with the given `id`.
- If `image` is empty, the server uses the default image URL.

**Success response:**
```json
{
  "success": true,
  "message": "Item updated successfully"
}
```

---

### 4.4 Delete Item

**Method:** `DELETE`

**URL:** `/api/inventory/:id`

**Auth:** Yes

**What it does:**
- Deletes the inventory item with this `id`.

**Success response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 5. Quick Summary Table

| # | Method | URL                            | Auth | Description                             |
|---|--------|---------------------------------|------|-----------------------------------------|
| 1 | GET    | /api/health                    | No   | Health check                            |
| 2 | POST   | /api/auth/admin/login         | No   | Admin login                             |
| 3 | POST   | /api/auth/admin/register      | No   | Admin/merchant signup                   |
| 4 | GET    | /api/auth/me                  | Yes  | Get current user                        |
| 5 | PUT    | /api/auth/update              | Yes  | Update own profile                      |
| 6 | GET    | /api/auth/all-users           | Yes  | List all users (admin)                  |
| 7 | PUT    | /api/auth/update-user-status  | Yes  | Change user status (admin)              |
| 8 | POST   | /api/media/upload             | Yes  | Upload image (avatar/inventory)         |
| 9 | POST   | /api/inventory/add            | Yes  | Add new inventory item                  |
|10 | GET    | /api/inventory/all            | Yes  | List all inventory items                |
|11 | PUT    | /api/inventory/:id            | Yes  | Update inventory item                   |
|12 | DELETE | /api/inventory/:id            | Yes  | Delete inventory item                   |

This file is meant to be easy to read and copy into Postman or other tools for testing.
