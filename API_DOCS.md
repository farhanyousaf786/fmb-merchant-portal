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

## 5. Orders APIs ( `/api/orders` )

Used by the Catalog checkout dialog and Orders page.

All orders endpoints require a valid token.

Common header:

```text
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### 5.1 Create Order + Invoice

**Method:** `POST`

**URL:** `/api/orders`

**Auth:** Yes

**Body (JSON example):**

```json
{
  "status": "submitted",
  "contact_first_name": "Dan",
  "contact_last_name": "Aderounmu",
  "contact_email": "dan@example.com",
  "contact_phone": "+234 0000 000 000",
  "delivery_address": "3345 Daylight Road",
  "delivery_city": "Dallas",
  "delivery_country": "United States",
  "delivery_postal": "75201",
  "notes": "Deliver to loading dock before 8AM.",
  "items": [
    {
      "inventory_id": 1,
      "type": "sliced",
      "unit_price": 50,
      "quantity": 30
    },
    {
      "inventory_id": 2,
      "type": "unsliced",
      "unit_price": 40,
      "quantity": 20
    }
  ]
}
```

**Notes:**

- `status` can be `"draft"` or `"submitted"` (UI uses `submitted` for checkout).
- `items` must have at least one entry; otherwise the API returns 400.
- `unit_price` and `quantity` are trusted by the backend to compute totals.

**What it does:**

- Validates the body and calculates:
  - `subtotal_amount` (sum of `unit_price * quantity` for each item),
  - `tax_amount` (5% of subtotal),
  - `delivery_fee` (currently `0`),
  - `discount_amount` (currently `0`),
  - `total_amount`.
- Creates a row in `orders` and child rows in `order_items`.
- Generates a PDF invoice file under `/invoices/invoice-<orderId>.pdf` and stores `invoice_pdf_url` in the order.

**Success response (simplified):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": 17,
    "status": "submitted",
    "subtotal_amount": 150.0,
    "tax_amount": 7.5,
    "delivery_fee": 0,
    "discount_amount": 0,
    "total_amount": 157.5,
    "invoice_number": "INV2025-17",
    "invoice_pdf_url": "/invoices/invoice-17.pdf"
  }
}
```

**How to test in Postman:**

1. Make sure you already have:
   - An auth token set in the `Authorization` header.
   - At least one inventory item (from `/api/inventory/add`).
2. Create a new `POST` request to `http://localhost:4000/api/orders`.
3. Set body to `raw` → `JSON` and paste the sample JSON above, adjusting `inventory_id` and prices.
4. Send the request. You should see `success: true` and an `invoice_pdf_url`.
5. Open `http://localhost:4000` + `invoice_pdf_url` in the browser to view the generated PDF.

### 5.2 List Orders

**Method:** `GET`

**URL:** `/api/orders`

**Auth:** Yes

**What it does:**

- Returns a list of orders for the current user.  
- If the logged‑in user has role `admin`, returns **all orders** in the system.  
- Each order includes:
  - `total_amount`,
  - `invoice_pdf_url` (if invoice was generated),
  - `total_quantity` (sum of all item quantities in that order).

**Response example (simplified):**

```json
{
  "success": true,
  "orders": [
    {
      "id": 17,
      "status": "submitted",
      "total_amount": 157.5,
      "created_at": "2025-11-22T21:40:00.000Z",
      "invoice_pdf_url": "/invoices/invoice-17.pdf",
      "total_quantity": 50
    },
    {
      "id": 18,
      "status": "draft",
      "total_amount": 80.0,
      "created_at": "2025-11-22T22:10:00.000Z",
      "invoice_pdf_url": null,
      "total_quantity": 20
    }
  ]
}
```

**How to test in Postman:**

1. Ensure you are logged in and have at least one order created (see 5.1).  
2. Send a `GET` request to `http://localhost:4000/api/orders` with your `Authorization` header.  
3. Confirm you see the list of orders and that `invoice_pdf_url` matches what you got back when creating the order.  
4. For admin accounts, you should see orders from all merchants; for non‑admin accounts, only your own.

---
## 6. Quick Summary Table (All APIs)

High‑level list of all available endpoints. Details are in the sections above and below.

| #  | Method | URL                             | Auth | Description                                      |
|----|--------|----------------------------------|------|--------------------------------------------------|
| 1  | GET    | /api/health                     | No   | Health check                                     |
| 2  | POST   | /api/auth/admin/login           | No   | Admin / merchant login                          |
| 3  | POST   | /api/auth/admin/register        | No   | Admin / merchant signup                         |
| 4  | GET    | /api/auth/me                    | Yes  | Get current user profile                        |
| 5  | PUT    | /api/auth/update                | Yes  | Update own profile (incl. avatar URL)           |
| 6  | GET    | /api/auth/all-users             | Yes  | List all users (admin only)                     |
| 7  | PUT    | /api/auth/update-user-status    | Yes  | Change user status (admin only)                 |
| 8  | POST   | /api/media/upload               | Yes  | Upload image (avatar / inventory)               |
| 9  | POST   | /api/inventory/add              | Yes  | Add new inventory item                          |
| 10 | GET    | /api/inventory/all              | Yes  | List all inventory items                        |
| 11 | PUT    | /api/inventory/:id              | Yes  | Update inventory item                           |
| 12 | DELETE | /api/inventory/:id              | Yes  | Delete inventory item                           |
| 13 | POST   | /api/orders                      | Yes  | Create order + invoice (from Catalog checkout)  |
| 14 | GET    | /api/orders                      | Yes  | List orders (admin: all, others: own orders)    |

---

## 7. How to Test These APIs (Postman Flow)

Below is a simple end‑to‑end flow you can follow in Postman or any REST client.

1. **Authentication**  
   - **Login:** `POST /api/auth/admin/login` with email/password.  
   - Copy the `token` from the response.  
   - In Postman, set a collection or environment header:  
     `Authorization: Bearer <JWT_TOKEN>`.

2. **Profile & Users**  
   - **Get current user:** `GET /api/auth/me` – confirm token works.  
   - **Update profile:** `PUT /api/auth/update` – change name, phone, avatar URL.  
   - **List all users (admin):** `GET /api/auth/all-users`.  
   - **Change user status:** `PUT /api/auth/update-user-status` – approve / deactivate merchants.

3. **Media Upload (Images)**  
   - **Upload file:** `POST /api/media/upload` using `form-data` with key `avatar` (type **File**).  
   - Copy the `url` from the response and use it as `avatar_url` or `image` in other APIs.

4. **Inventory Management**  
   - **Add item:** `POST /api/inventory/add` with name, price, optional `image` URL.  
   - **List items:** `GET /api/inventory/all` – used by Inventory and Catalog pages.  
   - **Update item:** `PUT /api/inventory/:id`.  
   - **Delete item:** `DELETE /api/inventory/:id`.

5. **Orders & Checkout Flow**  
   - **Create order:** `POST /api/orders`  
     - Body includes: `status` (`"submitted"` or `"draft"`), contact info, delivery address, and an `items` array with `inventory_id`, `type`, `unit_price`, `quantity`.  
     - Server calculates `subtotal`, `tax`, `total`, saves order + `order_items`, and generates a PDF invoice stored under `/invoices/invoice-<orderId>.pdf`.  
     - Response returns: `order.id`, `total_amount`, and `invoice_pdf_url` for download.
   - **List orders:** `GET /api/orders`  
     - **Admin**: returns all orders with `total_quantity` and `invoice_pdf_url`.  
     - **Merchant / staff**: returns only that user’s orders.  
     - Used by the Orders screen in the UI to show the table and drive the **View Invoice** button.

6. **End‑to‑End UI Flow (High Level)**  
   - **Step 1 – Sign in:** user logs in via `/api/auth/admin/login`; frontend stores token.  
   - **Step 2 – Inventory:** admin manages products using Inventory page → `/api/inventory/*`.  
   - **Step 3 – Catalog & Cart:** Catalog page loads items from `/api/inventory/all`; user selects sliced/unsliced, adds to cart.  
   - **Step 4 – Checkout:** checkout dialog sends `POST /api/orders` with contact/address + cart items.  
   - **Step 5 – Orders:** Orders page calls `GET /api/orders` to show history and quantities.  
   - **Step 6 – Invoices:** clicking **View Invoice** opens the PDF from `invoice_pdf_url` (`/invoices/invoice-<orderId>.pdf`).

This section should give you a quick “cheat sheet” for testing all backend APIs and understanding how the frontend pages use them together.
