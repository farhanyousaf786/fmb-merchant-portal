# Users API

Base URL: `http://localhost:4000/api/auth`

---

## 1. Get All Users (Admin Only)

**GET** `/all-users`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "business_name": "FMB Merchant Portal",
      "first_name": "Master",
      "last_name": "Admin",
      "email": "fmb@admin.com",
      "phone": null,
      "role": "admin",
      "status": "active",
      "created_at": "2025-11-22T23:50:07.000Z",
      "avatar_url": null
    },
    {
      "id": 2,
      "business_name": "Muhammad Yousaf",
      "first_name": "kamran",
      "last_name": "ch",
      "email": "kamran@gmail.com",
      "phone": "9292318782",
      "role": "merchant",
      "status": "active",
      "created_at": "2025-11-23T02:14:27.000Z",
      "avatar_url": "/uploads/avatar-123.jpg"
    }
  ]
}
```

**User Fields:**
| Field | Type | Description |
|-------|------|-------------|
| id | number | User ID |
| business_name | string | Company name |
| first_name | string | First name |
| last_name | string | Last name |
| email | string | Email address |
| phone | string | Phone number |
| role | string | `admin`, `merchant`, `staff` |
| status | string | `active`, `inactive` |
| created_at | datetime | Registration date |
| avatar_url | string | Profile picture URL |

---

## 2. Update User Status (Admin Only)

**PUT** `/update-user-status`

**Auth Required:** Yes (Bearer Token)

**Permission:** Admin only

**Request Body:**
```json
{
  "userId": 2,
  "status": "inactive"
}
```

**Status Options:**
- `active` - User can login and use the system
- `inactive` - User is blocked from logging in

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "User not found"
}
```

---

## 3. Get Current User Profile

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
    "id": 2,
    "business_name": "Muhammad Yousaf",
    "branch": "j",
    "primary_contact_name": "Muhammad Yousaf",
    "first_name": "kamran",
    "last_name": "ch",
    "email": "kamran@gmail.com",
    "phone": "9292318782",
    "legal_address": "84-34 LITTLE NECK PKWY",
    "country": "United States",
    "city": "FLORAL PARK",
    "postal": "11001",
    "zip": "11001",
    "avatar_url": "/uploads/avatar-123.jpg",
    "role": "merchant",
    "status": "active",
    "user_type": "admin",
    "created_at": "2025-11-23T02:14:27.000Z"
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
  "city": "New York",
  "legal_address": "456 New Street",
  "avatar_url": "/uploads/avatar-123.jpg"
}
```

**All fields are optional** - only include fields you want to update.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 2,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com"
  }
}
```

---

## User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | System administrator | Full access, manage users |
| `merchant` | Business owner | Create orders, view own data |
| `staff` | Employee | Limited access |

## User Status

| Status | Description |
|--------|-------------|
| `active` | Can login and use system |
| `inactive` | Blocked from logging in |
