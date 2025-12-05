# Media API

Base URL: `http://localhost:4000/api/media`

---

## 1. Upload File (Avatar/Image)

**POST** `/upload`

**Auth Required:** Yes (Bearer Token)

**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| avatar | file | Image file to upload |

**File Restrictions:**
- **Max Size:** 5MB
- **Allowed Types:** Image files only (jpg, jpeg, png, gif, webp)

**Success Response (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "url": "/uploads/avatar-1764343064769-603007334.jpg",
  "filename": "avatar-1764343064769-603007334.jpg"
}
```

**Error Responses:**

No file provided (400):
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

File too large (400):
```json
{
  "success": false,
  "error": "File too large. Maximum size is 5MB"
}
```

Invalid file type (400):
```json
{
  "success": false,
  "error": "Invalid file type. Only images are allowed"
}
```

---

## Accessing Uploaded Files

Files are stored in `/server/public/uploads/` and accessible via:

```
http://localhost:4000/uploads/<filename>
```

**Example:**
```
http://localhost:4000/uploads/avatar-1764343064769-603007334.jpg
```

---

## Usage Examples

### Upload Avatar (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

const response = await fetch('http://localhost:4000/api/media/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log(data.url); // "/uploads/avatar-123.jpg"
```

### Upload Avatar (cURL)

```bash
curl -X POST http://localhost:4000/api/media/upload \
  -H "Authorization: Bearer <token>" \
  -F "avatar=@/path/to/image.jpg"
```

### Upload Avatar (Postman)

1. Set method to **POST**
2. URL: `http://localhost:4000/api/media/upload`
3. Headers:
   - `Authorization`: `Bearer <token>`
4. Body:
   - Select **form-data**
   - Key: `avatar` (set type to **File**)
   - Value: Select your image file
5. Click **Send**

---

## Using Uploaded URLs

After uploading, use the returned URL in other API calls:

### Update User Avatar

```javascript
// 1. Upload image
const uploadResponse = await fetch('/api/media/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const { url } = await uploadResponse.json();

// 2. Update profile with new avatar URL
await fetch('/api/auth/update', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ avatar_url: url })
});
```

### Update Product Image

```javascript
// 1. Upload image
const { url } = await uploadImage(file);

// 2. Update product
await fetch(`/api/inventory/${productId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ image_url: url })
});
```

---

## File Storage

| Property | Value |
|----------|-------|
| Storage Location | `/server/public/uploads/` |
| URL Prefix | `/uploads/` |
| Naming Format | `avatar-<timestamp>-<random>.ext` |
| Max File Size | 5MB |
| Allowed Types | jpg, jpeg, png, gif, webp |
