# 💎 Babulal Jewellers — API Documentation

> RESTful API v1 · Base URL: `/api/v1`

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Versioning](#base-url--versioning)
3. [Authentication](#authentication)
4. [Standard Response Format](#standard-response-format)
5. [Error Codes](#error-codes)
6. [Rate Limiting](#rate-limiting)
7. [Auth Endpoints](#auth-endpoints)
8. [Product Endpoints](#product-endpoints)
9. [Category Endpoints](#category-endpoints)
10. [Enquiry Endpoints](#enquiry-endpoints)
11. [Analytics Endpoints](#analytics-endpoints)
12. [Postman Collection](#postman-collection)

---

## Overview

| Property | Value |
|---|---|
| Protocol | HTTPS |
| Format | JSON |
| Authentication | Bearer Token (JWT) |
| API Version | v1 |
| Rate Limit | 100 requests / 15 min (public) |
| Max Body Size | 10MB |
| Image Upload | multipart/form-data |

---

## Base URL & Versioning

```
Production:  https://api.babulaljewellers.com/api/v1
Development: http://localhost:3000/api/v1
```

All endpoints are prefixed with `/api/v1/`. Future breaking changes will be released under `/api/v2/`.

---

## Authentication

Protected endpoints require a valid JWT access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire in **7 days**. Use the refresh endpoint to obtain a new token.

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 48,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "phone", "message": "Phone number is required" }
  ]
}
```

---

## Error Codes

| HTTP Code | Meaning | Common Causes |
|---|---|---|
| 400 | Bad Request | Malformed JSON, missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient role permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate entry (e.g., category name) |
| 422 | Unprocessable Entity | Zod/Joi validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unhandled server exception |

---

## Rate Limiting

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth (`/auth/login`) | 10 requests | 15 minutes |
| Public API | 100 requests | 15 minutes |
| Admin API | 300 requests | 15 minutes |
| Image Upload | 20 requests | 15 minutes |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709000000
```

---

## Auth Endpoints

### POST `/auth/login`

Login as admin user.

**Request Body:**
```json
{
  "email": "admin@babulaljewellers.com",
  "password": "SecureAdmin@123"
}
```

**Success Response `200`:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "Admin User",
      "email": "admin@babulaljewellers.com",
      "role": "admin"
    }
  }
}
```

**Error Response `401`:**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

---

### POST `/auth/refresh`

Refresh access token using httpOnly refresh cookie.

**Cookies Required:** `refreshToken`

**Success Response `200`:**
```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGci..." }
}
```

---

### POST `/auth/logout`

Invalidate current session.

**Auth Required:** Yes

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET `/auth/me`

Get currently authenticated admin profile.

**Auth Required:** Yes

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Admin User",
    "email": "admin@babulaljewellers.com",
    "role": "super_admin",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Product Endpoints

### GET `/products`

Retrieve paginated product list with optional filters.

**Auth Required:** No

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page (max 50) |
| `category` | string | — | Category ID filter |
| `search` | string | — | Full-text search query |
| `featured` | boolean | — | Filter featured products |
| `sort` | string | `createdAt` | Sort field |
| `order` | `asc\|desc` | `desc` | Sort direction |
| `priceType` | `fixed\|on_request` | — | Filter by price type |

**Example Request:**
```
GET /api/v1/products?page=1&limit=12&category=64f1a2b3&search=necklace&sort=views&order=desc
```

**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "22K Gold Kundan Necklace",
      "slug": "22k-gold-kundan-necklace",
      "description": "Handcrafted Kundan necklace in 22K yellow gold",
      "price": 45000,
      "priceType": "fixed",
      "priceLabel": null,
      "images": [
        {
          "url": "https://res.cloudinary.com/babulal/image/upload/v1/babulal-jewellers/products/necklace.webp",
          "publicId": "babulal-jewellers/products/necklace"
        }
      ],
      "category": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
        "name": "Necklaces",
        "slug": "necklaces"
      },
      "isFeatured": true,
      "isActive": true,
      "views": 342,
      "enquiryCount": 12,
      "material": "22K Gold",
      "weight": "24.5g",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 4,
    "totalItems": 48,
    "itemsPerPage": 12,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET `/products/:id`

Get single product by ID.

**Auth Required:** No

**Note:** Automatically increments the `views` counter.

**Success Response `200`:** Full product object (same shape as list item above).

---

### GET `/products/slug/:slug`

Get single product by URL slug. Used for SEO-friendly product pages.

**Auth Required:** No

---

### POST `/products`

Create a new product.

**Auth Required:** Yes (Admin, Super Admin)

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|---|---|:---:|---|
| `name` | string | ✅ | Product name (3–100 chars) |
| `description` | string | ✅ | Full description |
| `category` | ObjectId | ✅ | Category `_id` |
| `priceType` | `fixed\|on_request` | ✅ | Price display mode |
| `price` | number | ❌ | Required if `priceType=fixed` |
| `priceLabel` | string | ❌ | Custom label e.g. "Starting from ₹20,000" |
| `material` | string | ❌ | e.g. "22K Gold, Kundan" |
| `weight` | string | ❌ | e.g. "24.5g" |
| `isFeatured` | boolean | ❌ | Default: false |
| `isActive` | boolean | ❌ | Default: true |
| `tags` | string[] | ❌ | Comma-separated tags |
| `images` | File[] | ✅ | 1–10 images (max 5MB each) |

**Success Response `201`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Product created successfully",
  "data": { "_id": "...", "slug": "22k-gold-kundan-necklace", ... }
}
```

---

### PATCH `/products/:id`

Update product fields (partial update).

**Auth Required:** Yes (Admin, Super Admin)

**Content-Type:** `multipart/form-data` (if updating images) or `application/json`

**Success Response `200`:** Updated product object.

---

### DELETE `/products/:id`

Delete product and all associated Cloudinary images.

**Auth Required:** Yes (Super Admin only)

**Success Response `200`:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### DELETE `/products/:id/images/:publicId`

Remove a single image from a product.

**Auth Required:** Yes (Admin, Super Admin)

---

## Category Endpoints

### GET `/categories`

Get all active categories.

**Auth Required:** No

**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
      "name": "Necklaces",
      "slug": "necklaces",
      "image": "https://res.cloudinary.com/.../necklaces.webp",
      "productCount": 24,
      "isActive": true
    }
  ]
}
```

---

### POST `/categories`

Create a new category.

**Auth Required:** Yes (Admin, Super Admin)

**Request Body:**
```json
{
  "name": "Bangles",
  "description": "Traditional and modern bangle collection"
}
```

---

### PATCH `/categories/:id`

Update category.

**Auth Required:** Yes (Admin, Super Admin)

---

### DELETE `/categories/:id`

Delete category (only if no products are assigned).

**Auth Required:** Yes (Super Admin)

---

## Enquiry Endpoints

### POST `/enquiries`

Submit a customer enquiry.

**Auth Required:** No

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "phone": "+91-9876543210",
  "message": "I'm interested in this necklace. Is it available in 18K gold?",
  "productId": "64f1a2b3c4d5e6f7a8b9c0d2"
}
```

**Validation Rules:**
- `name`: 2–50 characters, required
- `email`: valid email format, required
- `phone`: 10–15 digits, optional
- `message`: 10–500 characters, required
- `productId`: valid ObjectId, optional

**Success Response `201`:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Enquiry submitted successfully. We'll contact you within 24 hours."
}
```

---

### GET `/enquiries`

Get all enquiries (paginated).

**Auth Required:** Yes (Admin, Manager, Super Admin)

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | `new\|read\|replied` | — | Filter by status |
| `dateFrom` | ISO date | — | Start date filter |
| `dateTo` | ISO date | — | End date filter |

**Success Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "phone": "+91-9876543210",
      "message": "I'm interested in this necklace...",
      "product": { "_id": "...", "name": "22K Gold Kundan Necklace" },
      "status": "new",
      "createdAt": "2024-02-15T08:45:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

---

### GET `/enquiries/:id`

Get single enquiry by ID. Automatically marks status as `read` if currently `new`.

**Auth Required:** Yes

---

### PATCH `/enquiries/:id/status`

Update enquiry status.

**Auth Required:** Yes

**Request Body:**
```json
{
  "status": "replied"
}
```

**Valid Values:** `new`, `read`, `replied`

---

### DELETE `/enquiries/:id`

Delete an enquiry.

**Auth Required:** Yes (Super Admin only)

---

## Analytics Endpoints

### GET `/analytics/dashboard`

Get aggregated admin dashboard stats. Responses are cached for 15 minutes.

**Auth Required:** Yes

**Success Response `200`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 48,
      "totalEnquiries": 312,
      "totalCategories": 8,
      "newEnquiries": 7
    },
    "mostViewedProduct": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "name": "22K Gold Kundan Necklace",
      "views": 1240,
      "images": [{ "url": "..." }]
    },
    "monthlyEnquiries": [
      { "month": "Jan 2024", "count": 22 },
      { "month": "Feb 2024", "count": 31 },
      { "month": "Mar 2024", "count": 28 }
    ],
    "topProducts": [
      { "name": "22K Gold Kundan Necklace", "views": 1240, "enquiryCount": 34 },
      { "name": "Diamond Studs", "views": 980, "enquiryCount": 28 }
    ]
  }
}
```

---

### GET `/analytics/products/views`

Get product view statistics for the last 30 days.

**Auth Required:** Yes

---

## Postman Collection

Import the following collection into Postman for quick API testing.

### Environment Variables (Postman)

```json
{
  "id": "babulal-jewellers-env",
  "name": "Babulal Jewellers - Development",
  "values": [
    { "key": "base_url", "value": "http://localhost:5000/api/v1" },
    { "key": "access_token", "value": "" },
    { "key": "product_id", "value": "" },
    { "key": "category_id", "value": "" }
  ]
}
```

### Quick Test Workflow

```bash
# 1. Login and capture token
POST {{base_url}}/auth/login
Body: { "email": "admin@babulaljewellers.com", "password": "Admin@123" }
→ Set access_token from response

# 2. List products (public)
GET {{base_url}}/products?page=1&limit=5

# 3. Create product (admin)
POST {{base_url}}/products
Auth: Bearer {{access_token}}
Form-data: name, description, category, priceType, images...

# 4. Submit enquiry (public)
POST {{base_url}}/enquiries
Body: { "name": "Test", "email": "test@test.com", "message": "Hello" }

# 5. Get dashboard analytics
GET {{base_url}}/analytics/dashboard
Auth: Bearer {{access_token}}
```

---

## Endpoint Summary Table

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/auth/login` | ❌ | — | Admin login |
| POST | `/auth/refresh` | ❌ | — | Refresh access token |
| POST | `/auth/logout` | ✅ | Any | Logout |
| GET | `/auth/me` | ✅ | Any | Get own profile |
| GET | `/products` | ❌ | — | List products |
| GET | `/products/:id` | ❌ | — | Get product by ID |
| GET | `/products/slug/:slug` | ❌ | — | Get product by slug |
| POST | `/products` | ✅ | Admin+ | Create product |
| PATCH | `/products/:id` | ✅ | Admin+ | Update product |
| DELETE | `/products/:id` | ✅ | Super Admin | Delete product |
| DELETE | `/products/:id/images/:pid` | ✅ | Admin+ | Remove product image |
| GET | `/categories` | ❌ | — | List categories |
| POST | `/categories` | ✅ | Admin+ | Create category |
| PATCH | `/categories/:id` | ✅ | Admin+ | Update category |
| DELETE | `/categories/:id` | ✅ | Super Admin | Delete category |
| POST | `/enquiries` | ❌ | — | Submit enquiry |
| GET | `/enquiries` | ✅ | Manager+ | List enquiries |
| GET | `/enquiries/:id` | ✅ | Manager+ | Get enquiry |
| PATCH | `/enquiries/:id/status` | ✅ | Manager+ | Update status |
| DELETE | `/enquiries/:id` | ✅ | Super Admin | Delete enquiry |
| GET | `/analytics/dashboard` | ✅ | Manager+ | Dashboard stats |
| GET | `/analytics/products/views` | ✅ | Admin+ | View analytics |

---

*API Documentation v1.0 · Babulal Jewellers*

*created by Sanket Thakkar*