# Authentication API

Base URL: `http://localhost:4000/api/auth`

---

## 1. Admin Login

**POST** `/admin/login`

**Auth Required:** No

**Request Body:**
```json
{
  "email": "fmb@admin.com",
  "password": "admin"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "business_name": "FMB Merchant Portal",
    "first_name": "Master",
    "last_name": "Admin",
    "email": "fmb@admin.com",
    "role": "admin",
    "status": "active"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

## 2. Admin Register

**POST** `/admin/register`

**Auth Required:** No

**Request Body:**
```json
{
  "business_name": "Famous Moms Bakery",
  "primary_contact_name": "John Smith",
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@bakery.com",
  "password": "SecurePassword123!",
  "phone": "+1-555-0123",
  "legal_address": "123 Main Street, Suite 100",
  "country": "United States",
  "city": "New York",
  "postal": "10001",
  "zip": "10001"
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| business_name | string | Company name |
| primary_contact_name | string | Main contact person |
| first_name | string | User first name |
| last_name | string | User last name |
| email | string | Must be unique |
| password | string | Min 6 characters |
| phone | string | Contact number |
| legal_address | string | Business address |
| country | string | Country name |
| city | string | City name |
| postal | string | Postal code |
| zip | string | ZIP code |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "business_name": "Famous Moms Bakery",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@bakery.com",
    "role": "merchant",
    "status": "active",
    "created_at": "2025-12-05T00:00:00.000Z"
  }
}
```

**Error Responses:**

Missing Fields (400):
```json
{
  "success": false,
  "error": "Required fields missing"
}
```

Email Exists (409):
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

## 3. Get Current User

**GET** `/me`

**Auth Required:** Yes (Bearer Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "business_name": "FMB Merchant Portal",
    "branch": null,
    "primary_contact_name": "System Admin",
    "first_name": "Master",
    "last_name": "Admin",
    "email": "fmb@admin.com",
    "phone": null,
    "legal_address": "System generated admin account",
    "country": "N/A",
    "city": "N/A",
    "postal": null,
    "zip": null,
    "avatar_url": null,
    "role": "admin",
    "status": "active",
    "user_type": "admin",
    "created_at": "2025-11-22T23:50:07.000Z"
  }
}
```

---

## 4. Update User Profile

**PUT** `/update`

**Auth Required:** Yes (Bearer Token)

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-9999",
  "country": "United States",
  "legal_address": "456 New Street",
  "avatar_url": "/uploads/avatar-123.jpg"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  }
}
```

---

## Using Token for Authenticated Requests

After login/register, include the token in all protected requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration:** 24 hours (configurable in server)
