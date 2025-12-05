# FMB Merchant Portal - API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Categories

| Category | File | Description |
|----------|------|-------------|
| [Authentication](./AUTH.md) | `AUTH.md` | Login, Register, User management |
| [Users](./USERS.md) | `USERS.md` | User profile, All users (admin) |
| [Orders](./ORDERS.md) | `ORDERS.md` | Create, List, Update orders |
| [Payments](./PAYMENTS.md) | `PAYMENTS.md` | Payment methods, Payment intents |
| [Inventory](./INVENTORY.md) | `INVENTORY.md` | Products/Catalog management |

## Quick Reference

### Public Endpoints (No Auth Required)
- `GET /api/health` - Health check
- `POST /api/auth/admin/login` - Login
- `POST /api/auth/admin/register` - Register

### Protected Endpoints (Auth Required)
- All other endpoints require Bearer token

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
