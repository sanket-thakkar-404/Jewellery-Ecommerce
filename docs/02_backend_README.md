# 💎 Babulal Jewellers — Backend API

> Node.js + Express.js + MongoDB · Production-Grade REST API

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)](https://jwt.io)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [API Architecture](#api-architecture)
7. [Middleware Stack](#middleware-stack)
8. [Authentication Flow](#authentication-flow)
9. [File Upload Strategy](#file-upload-strategy)
10. [Error Handling](#error-handling)
11. [Logging Strategy](#logging-strategy)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Project Overview

The Babulal Jewellers backend exposes a versioned RESTful API (`/api/v1/`) serving:

- **Product & Category management** with Cloudinary image storage
- **JWT-based Admin Authentication** with role-based access control
- **Enquiry System** with SMTP email notifications via Nodemailer
- **Analytics endpoints** for the admin dashboard
- **Rate limiting**, **Helmet** security headers, and **centralized error handling**

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Runtime | Node.js | 20 LTS | JavaScript server runtime |
| Framework | Express.js | 4.x | HTTP routing & middleware |
| Database | MongoDB | 7.x | Document store |
| ODM | Mongoose | 8.x | Schema modeling & validation |
| Auth | JSON Web Tokens | 9.x | Stateless authentication |
| Crypto | bcryptjs | 2.x | Password hashing |
| Images | Cloudinary SDK | 2.x | Cloud image storage |
| Email | Nodemailer | 6.x | SMTP email delivery |
| Validation | Joi / Zod | 17.x / 3.x | Request body validation |
| Security | Helmet | 7.x | HTTP security headers |
| Rate Limit | express-rate-limit | 7.x | DDoS & abuse protection |
| Logging | Winston | 3.x | Structured application logging |
| Process | PM2 | 5.x | Production process management |
| Cache | Redis (optional) | 7.x | API response caching |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **MongoDB** >= 7.x (local or Atlas)
- **Redis** >= 7.x (optional, for caching)
- Cloudinary account
- SMTP credentials (Gmail, SendGrid, etc.)

### Installation

```bash
cd server

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Seed initial admin user
npm run seed:admin

# Start development server (nodemon)
npm run dev
```

API will be available at `http://localhost:3000`.

---

## Environment Variables

```env
# ── Server ───────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Database ──────────────────────────────────────────
MONGODB_URI=mongodb://localhost:27017/babulal_jewellers

# ── JWT ───────────────────────────────────────────────
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# ── Cloudinary ────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=babulal-jewellers

# ── Email (SMTP) ──────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@babulaljewellers.com
SMTP_PASS=your_app_password
EMAIL_FROM="Babulal Jewellers <noreply@babulaljewellers.com>"
ADMIN_EMAIL=admin@babulaljewellers.com

# ── Rate Limiting ─────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# ── Redis (Optional) ──────────────────────────────────
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300

# ── Stripe (Sandbox) ─────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ── CORS ──────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:8080,https://babulaljewellers.com
```

---

## Available Scripts

```bash
# Start dev server with hot reload (nodemon)
npm run dev

# Start production server (PM2)
npm start

# Run tests (Jest)
npm run test
npm run test:coverage

# Lint (ESLint)
npm run lint

# Seed database with initial data
npm run seed
npm run seed:admin

# Generate API types (optional, for tRPC-style sync)
npm run generate:types
```

---

## API Architecture

```
server/
├── src/
│   ├── config/
│   │   ├── db.ts                 # Mongoose connection
│   │   ├── cloudinary.ts         # Cloudinary config
│   │   ├── redis.ts              # Redis client (optional)
│   │   └── env.ts                # Validated env variables (Joi)
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── category.controller.ts
│   │   ├── enquiry.controller.ts
│   │   └── analytics.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── role.middleware.ts    # RBAC guard
│   │   ├── validate.middleware.ts # Joi/Zod request validation
│   │   ├── upload.middleware.ts  # Multer + Cloudinary pipeline
│   │   ├── rateLimiter.ts
│   │   ├── cache.middleware.ts   # Redis caching
│   │   └── errorHandler.ts      # Global error handler
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── Category.model.ts
│   │   └── Enquiry.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── enquiry.routes.ts
│   │   └── analytics.routes.ts
│   ├── services/
│   │   ├── email.service.ts      # Nodemailer wrapper
│   │   ├── cloudinary.service.ts
│   │   └── cache.service.ts
│   ├── utils/
│   │   ├── ApiResponse.ts        # Standardized response wrapper
│   │   ├── ApiError.ts           # Custom error class
│   │   ├── catchAsync.ts         # Async error wrapper
│   │   ├── logger.ts             # Winston logger
│   │   └── paginate.ts           # Pagination helper
│   ├── validations/
│   │   ├── product.schema.ts
│   │   ├── enquiry.schema.ts
│   │   └── auth.schema.ts
│   └── app.ts                    # Express app setup
├── server.ts                     # Entry point
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Middleware Stack

The Express app is configured with the following middleware (in order):

```typescript
// app.ts
app.use(helmet());                              // Security headers
app.use(cors(corsOptions));                     // CORS policy
app.use(express.json({ limit: '10mb' }));       // JSON body parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());                        // Cookie parsing
app.use(morgan('combined', { stream: winstonStream })); // HTTP logging
app.use('/api/', globalRateLimiter);            // Rate limiting
app.use('/api/v1', router);                     // Versioned API routes
app.use(notFoundHandler);                       // 404 handler
app.use(globalErrorHandler);                    // Centralized error handler
```

---

## Authentication Flow

```
Client                           Server
  │                                │
  │── POST /auth/login ──────────▶│
  │   { email, password }          │
  │                                ├─ Find user by email
  │                                ├─ bcrypt.compare(password, hash)
  │                                ├─ Generate accessToken (7d)
  │                                ├─ Generate refreshToken (30d)
  │                                ├─ Set refreshToken in httpOnly cookie
  │◀── { accessToken, user } ─────│
  │                                │
  │── GET /products (protected) ──▶│
  │   Authorization: Bearer <tok>  │
  │                                ├─ auth.middleware: verify JWT
  │                                ├─ role.middleware: check permissions
  │◀── { data } ──────────────────│
  │                                │
  │── POST /auth/refresh ─────────▶│
  │   (sends refreshToken cookie)  │
  │                                ├─ Verify refreshToken
  │                                ├─ Issue new accessToken
  │◀── { accessToken } ───────────│
```

### Password Hashing

```typescript
// bcrypt cost factor: 12 (balances security vs. login latency)
const hashedPassword = await bcrypt.hash(password, 12);
```

---

## File Upload Strategy

Images are uploaded via a two-step Multer → Cloudinary pipeline:

```typescript
// upload.middleware.ts
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Cloudinary transform pipeline
const uploadToCloudinary = async (buffer: Buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER,
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { fetch_format: 'webp', quality: 'auto' },
        ],
      },
      (error, result) => error ? reject(error) : resolve(result)
    );
    uploadStream.end(buffer);
  });
};
```

- Supports up to **10 images per product**
- Automatically converts to **WebP format**
- Stores public URLs + `public_id` in MongoDB for future deletion

---

## Error Handling

All errors use a unified `ApiError` class and are caught by the global error handler:

```typescript
// utils/ApiError.ts
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
    public errors?: any[]
  ) {
    super(message);
  }
}

// Standard error response shape
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

---

## Logging Strategy

Winston is used for structured, level-based logging:

```typescript
// utils/logger.ts
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

In production, logs are streamed to a centralized service (Datadog / CloudWatch / Logtail).

---

## Testing

```bash
# Run all tests
npm run test

# Integration tests only
npm run test:integration

# Coverage
npm run test:coverage
```

Key test suites:
- `auth.controller.test.ts` — Login, token refresh, role enforcement
- `product.controller.test.ts` — CRUD operations, pagination, image upload
- `enquiry.controller.test.ts` — Submission, status update, email trigger
- Middleware unit tests — rate limiter, validation, auth guard

---

## Deployment

### Using PM2 (Production)

```bash
npm run build                     # Compile TypeScript
pm2 start ecosystem.config.js     # Start with PM2
pm2 save && pm2 startup            # Auto-restart on reboot
```

### Using Docker

```bash
docker build -t babulal-server .
docker run -p 5000:5000 --env-file .env babulal-server
```

See the [Deployment & DevOps Guide](./06_deployment_devops.md) for full Docker Compose + Nginx setup.

---

*Maintained by the Babulal Jewellers Engineering Team.*
