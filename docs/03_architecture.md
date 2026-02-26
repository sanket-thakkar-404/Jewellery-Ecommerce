# 💎 Babulal Jewellers — Full Implementation Architecture

> Production-Grade MERN Stack Architecture · Version 1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture Diagram](#high-level-architecture-diagram)
3. [Component Architecture](#component-architecture)
4. [Data Flow Diagrams](#data-flow-diagrams)
5. [Authentication Architecture](#authentication-architecture)
6. [Product Management Architecture](#product-management-architecture)
7. [Enquiry System Architecture](#enquiry-system-architecture)
8. [Caching Architecture](#caching-architecture)
9. [Infrastructure Architecture](#infrastructure-architecture)
10. [Scalability Considerations](#scalability-considerations)
11. [Design Principles](#design-principles)

---

## System Overview

Babulal Jewellers is a **three-tier, monorepo-structured** full-stack e-commerce platform. It follows a **client-server** separation pattern with a dedicated reverse proxy layer.

```
┌─────────────────────────────────────────────────┐
│                   PRODUCTION                     │
│                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Browser  │────│  Nginx   │────│  React   │  │
│  │ Customer │    │ (Proxy)  │    │  (Vite)  │  │
│  └──────────┘    └────┬─────┘    └──────────┘  │
│                       │                         │
│                  ┌────▼─────┐                   │
│                  │ Express  │                   │
│                  │   API    │                   │
│                  └────┬─────┘                   │
│                       │                         │
│          ┌────────────┼────────────┐            │
│     ┌────▼────┐  ┌────▼────┐  ┌───▼─────┐     │
│     │MongoDB  │  │ Redis   │  │Cloudinary│    │
│     │ Atlas   │  │ Cache   │  │ (Images) │    │
│     └─────────┘  └─────────┘  └──────────┘   │
└─────────────────────────────────────────────────┘
```

---

## High-Level Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │           CLIENTS                    │
                    │  ┌──────────────┐ ┌──────────────┐  │
                    │  │  Customer    │ │  Admin Panel │  │
                    │  │  Storefront  │ │  (React SPA) │  │
                    │  └──────┬───────┘ └──────┬───────┘  │
                    └─────────┼────────────────┼──────────┘
                              │ HTTPS          │ HTTPS
                    ┌─────────▼────────────────▼──────────┐
                    │              NGINX                   │
                    │   Reverse Proxy + SSL Termination    │
                    │   Static Asset Serving               │
                    └─────────────────┬────────────────────┘
                                      │ /api/v1/*
                    ┌─────────────────▼────────────────────┐
                    │          EXPRESS.JS API SERVER        │
                    │                                      │
                    │ ┌──────────┐  ┌────────────────────┐ │
                    │ │ Router   │  │    Middleware Stack │ │
                    │ │ /auth    │  │  ┌──────────────┐  │ │
                    │ │ /product │  │  │ Helmet       │  │ │
                    │ │ /enquiry │  │  │ CORS         │  │ │
                    │ │ /analytics│ │  │ Rate Limiter │  │ │
                    │ └──────────┘  │  │ JWT Auth     │  │ │
                    │               │  │ RBAC Guard   │  │ │
                    │               │  │ Validator    │  │ │
                    │               │  │ Error Handler│  │ │
                    │               │  └──────────────┘  │ │
                    └──────────────────────┬─────────────-┘
                                           │
              ┌────────────────────────────┼─────────────────┐
              │                            │                 │
   ┌──────────▼────────┐      ┌────────────▼──────┐  ┌──────▼────────┐
   │    MongoDB Atlas  │      │   Redis Cache     │  │  Cloudinary   │
   │    (Primary DB)   │      │   (API Cache)     │  │  (Image CDN)  │
   │                   │      │                   │  │               │
   │  Collections:     │      │  Keys:            │  │  Buckets:     │
   │  • users          │      │  • products:list  │  │  • products/  │
   │  • products       │      │  • product:{id}   │  │  • avatars/   │
   │  • categories     │      │  • categories     │  │               │
   │  • enquiries      │      │  • analytics      │  └───────────────┘
   └───────────────────┘      └───────────────────┘
              │
   ┌──────────▼────────────────────────────────────┐
   │              EXTERNAL SERVICES                 │
   │  ┌──────────────┐  ┌───────────────────────┐  │
   │  │  Nodemailer  │  │  Stripe Payment API   │  │
   │  │  (SMTP Email)│  │  (Sandbox/Production) │  │
   │  └──────────────┘  └───────────────────────┘  │
   └───────────────────────────────────────────────┘
```

---

## Component Architecture

### Frontend Component Hierarchy

```
App
├── PublicLayout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── NavLinks
│   │   ├── SearchBar
│   │   └── CartIcon (badge)
│   ├── [Page Routes]
│   │   ├── Home
│   │   │   ├── HeroBanner
│   │   │   ├── FeaturedProducts (ProductGrid)
│   │   │   └── CategoryShowcase
│   │   ├── Shop
│   │   │   ├── FilterSidebar
│   │   │   ├── SearchHeader
│   │   │   └── ProductGrid (infinite scroll)
│   │   ├── ProductDetail
│   │   │   ├── ImageGallery
│   │   │   ├── ProductInfo
│   │   │   ├── AddToCart / EnquiryButton
│   │   │   └── RelatedProducts
│   │   └── Cart / Enquiry / Contact
│   └── Footer
│
├── AdminLayout (Protected)
│   ├── AdminSidebar
│   ├── AdminHeader
│   └── [Admin Routes]
│       ├── Dashboard
│       │   ├── StatCards (4 KPIs)
│       │   ├── MonthlyEnquiryChart (Recharts)
│       │   └── TopProductsTable
│       ├── AdminProducts (DataTable + CRUD dialogs)
│       ├── AdminCategories
│       └── AdminEnquiries
│
└── CartDrawer (global Sheet component)
```

---

## Data Flow Diagrams

### Customer Product Browse Flow

```
User Opens Shop Page
        │
        ▼
useProducts hook fires
        │
        ▼
Check Redis cache: GET products:list?page=1&cat=X
        │
   ┌────▼────┐
   │ Cache   │ HIT ──▶ Return cached data immediately
   │  Miss?  │        (< 5ms response)
   └────┬────┘
        │ MISS
        ▼
MongoDB.find({ category, isActive })
  .sort({ createdAt: -1 })
  .skip(offset).limit(pageSize)
        │
        ▼
Store in Redis (TTL: 300s)
        │
        ▼
Return paginated JSON to React
        │
        ▼
Zustand productStore updated
        │
        ▼
ProductGrid re-renders with new data
```

### Enquiry Submission Flow

```
Customer fills EnquiryForm
        │
        ▼
Zod validation (client-side)
        │
        ▼
POST /api/v1/enquiries
        │
        ▼
Joi validation (server-side)
        │
        ▼
Save Enquiry to MongoDB
  { name, email, phone, message, product, status: 'new' }
        │
        ├──▶ Trigger Nodemailer
        │         │
        │         ▼
        │    Send email to admin@babulaljewellers.com
        │    Subject: "New Enquiry from [Customer Name]"
        │
        ├──▶ Increment product.enquiryCount
        │
        ▼
Return 201 { success: true, message: "Enquiry submitted" }
        │
        ▼
Client shows success toast
```

---

## Authentication Architecture

### JWT Token Strategy

```
┌─────────────────────────────────────────────────────┐
│                 TOKEN LIFECYCLE                      │
│                                                     │
│  Login ──▶ Issue accessToken (7d, JWT)              │
│            Issue refreshToken (30d, httpOnly cookie) │
│                                                     │
│  Request ──▶ Attach: Authorization: Bearer <token>  │
│             Server validates signature + expiry     │
│                                                     │
│  Expiry ──▶ Client detects 401                      │
│             POST /auth/refresh (sends cookie)       │
│             Server issues new accessToken           │
│                                                     │
│  Logout ──▶ Clear cookie + blacklist token          │
│             (Redis-based token blacklist)           │
└─────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

| Permission | Super Admin | Admin | Manager |
|---|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| Create Product | ✅ | ✅ | ❌ |
| Edit Product | ✅ | ✅ | ✅ |
| Delete Product | ✅ | ❌ | ❌ |
| Manage Categories | ✅ | ✅ | ❌ |
| View Enquiries | ✅ | ✅ | ✅ |
| Update Enquiry Status | ✅ | ✅ | ✅ |
| Manage Admin Users | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ |

---

## Product Management Architecture

### Image Upload Pipeline

```
Admin uploads image(s)
        │
        ▼
React: FormData with File objects
        │
        ▼
POST /api/v1/products (multipart/form-data)
        │
        ▼
Multer: Parse files into memory (max 5MB each, max 10 files)
        │
        ▼
For each file:
  cloudinary.uploader.upload_stream({
    folder: 'babulal-jewellers/products',
    transformation: [
      { width: 1200, crop: 'limit' },
      { fetch_format: 'webp', quality: 'auto:good' }
    ]
  })
        │
        ▼
Store in MongoDB Product document:
  images: [{ url: String, publicId: String }]
        │
        ▼
On product delete:
  cloudinary.uploader.destroy(image.publicId) for each image
```

### Product View Tracking

```typescript
// product.controller.ts
export const getProductBySlug = catchAsync(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { slug: req.params.slug, isActive: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('category');
  if (!product) throw new ApiError(404, 'Product not found');
  res.json(new ApiResponse(200, product));
});
```

---

## Enquiry System Architecture

### Status State Machine

```
         ┌─────────────┐
         │    NEW      │  (on creation)
         └──────┬──────┘
                │ Admin opens enquiry
                ▼
         ┌─────────────┐
         │    READ     │
         └──────┬──────┘
                │ Admin sends reply
                ▼
         ┌─────────────┐
         │   REPLIED   │
         └─────────────┘
```

### Email Notification Template

```
Subject: 💎 New Enquiry — [Product Name] | Babulal Jewellers

From: [Customer Name] <customer@email.com>
Product: [Product Name]
Phone: +91-XXXXXXXXXX
Message: [Customer message]

---
This is an automated notification from Babulal Jewellers CRM.
Reply directly to this email to respond to the customer.
```

---

## Caching Architecture

### Redis Cache Key Strategy

```
products:list:{page}:{limit}:{category}:{search}    TTL: 300s
product:{id}                                         TTL: 600s
product:slug:{slug}                                  TTL: 600s
categories:all                                       TTL: 3600s
analytics:dashboard                                  TTL: 900s
```

### Cache Invalidation Triggers

| Event | Invalidated Keys |
|---|---|
| Product created/updated/deleted | `products:list:*`, `product:{id}` |
| Category created/updated | `categories:all`, `products:list:*` |
| New enquiry | `analytics:dashboard` |
| Analytics view | `analytics:dashboard` (refresh TTL 900s) |

---

## Infrastructure Architecture

### Docker Container Architecture

```
docker-compose.yml defines:
  ┌─────────────────────────────────────┐
  │  babulal-nginx (nginx:alpine)       │
  │  Ports: 80, 443                     │
  │  Volumes: ssl certs, nginx.conf     │
  │  Depends: client, server            │
  └───────────────────┬─────────────────┘
                      │
          ┌───────────┴────────────┐
          │                        │
  ┌───────▼───────┐      ┌────────▼──────┐
  │ babulal-client│      │babulal-server │
  │ (node:alpine) │      │(node:alpine)  │
  │ Port: 5173    │      │ Port: 5000    │
  │ Vite preview  │      │ Express API   │
  └───────────────┘      └────────┬──────┘
                                  │
               ┌──────────────────┴──────────────┐
               │                                 │
        ┌──────▼──────┐                  ┌───────▼─────┐
        │ babulal-mongo│                 │babulal-redis│
        │ (mongo:7)    │                 │(redis:alpine)│
        │ Port: 27017  │                 │ Port: 6379  │
        └─────────────┘                  └─────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling Path

| Phase | Strategy | When |
|---|---|---|
| Phase 1 (0–10K users) | Monolith + MongoDB Atlas M10 | Launch |
| Phase 2 (10K–100K) | PM2 cluster mode, Redis cache | 6 months |
| Phase 3 (100K+) | Microservices: split product/enquiry/auth | Year 2 |

### Database Indexing Strategy

```typescript
// Product indexes
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });  // Full-text search
ProductSchema.index({ views: -1 });
ProductSchema.index({ isFeatured: 1, createdAt: -1 });
ProductSchema.index({ slug: 1 }, { unique: true });

// Enquiry indexes
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ product: 1 });
EnquirySchema.index({ email: 1 });
```

---

## Design Principles

| Principle | Implementation |
|---|---|
| **Separation of Concerns** | Clear controller / service / model layers |
| **Single Responsibility** | Each module handles one domain |
| **DRY** | `catchAsync`, `ApiResponse`, `ApiError` utilities |
| **Fail Fast** | Input validation at API boundary before DB hit |
| **Security by Default** | Helmet, CORS, rate limiting on all routes |
| **Observability** | Structured Winston logs + request IDs |
| **Graceful Degradation** | Redis unavailable → fallback to DB directly |
| **12-Factor App** | Config from env vars, stateless processes |

---

*Architecture document version 1.0 · Babulal Jewellers Engineering*
