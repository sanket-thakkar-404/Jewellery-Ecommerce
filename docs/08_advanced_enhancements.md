# 💎 Babulal Jewellers — Advanced Senior-Level Enhancements

> Production-Ready Feature Extensions for Scale & Excellence

---

## Table of Contents

1. [Role-Based Access Control (Deep Dive)](#role-based-access-control)
2. [Stripe Payment Integration (Sandbox)](#stripe-payment-integration)
3. [Webhook Architecture](#webhook-architecture)
4. [API Versioning Strategy](#api-versioning-strategy)
5. [Structured Logging & Observability](#structured-logging--observability)
6. [Database Migration Strategy](#database-migration-strategy)
7. [Testing Strategy (Full Coverage Plan)](#testing-strategy)
8. [SEO & Structured Data Enhancements](#seo--structured-data)
9. [Internationalization (i18n) Strategy](#internationalization)
10. [Admin Audit Log](#admin-audit-log)
11. [WebSocket Real-Time Notifications](#websocket-real-time-notifications)
12. [Sitemap & Robots.txt Generation](#sitemap--robotstxt)

---

## Role-Based Access Control

### Middleware Implementation

```typescript
// middleware/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

type Role = 'super_admin' | 'admin' | 'manager';

const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 3,
  admin: 2,
  manager: 1,
};

/**
 * Authorize middleware factory.
 * Usage: authorize('admin') — allows admin AND super_admin
 */
export const authorize = (...minRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;
    if (!userRole) throw new ApiError(401, 'Authentication required');

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = Math.min(...minRoles.map((r) => ROLE_HIERARCHY[r]));

    if (userLevel < requiredLevel) {
      throw new ApiError(403, `Requires ${minRoles.join(' or ')} access`);
    }
    next();
  };
};

// Route-level usage
router.delete('/products/:id', authenticate, authorize('super_admin'), deleteProduct);
router.post('/products', authenticate, authorize('admin'), createProduct);
router.get('/enquiries', authenticate, authorize('manager'), getEnquiries);
```

### Permission Matrix (Code Reference)

```typescript
// config/permissions.ts
export const PERMISSIONS = {
  PRODUCT_CREATE: ['admin', 'super_admin'],
  PRODUCT_UPDATE: ['admin', 'super_admin', 'manager'],
  PRODUCT_DELETE: ['super_admin'],
  CATEGORY_MANAGE: ['admin', 'super_admin'],
  ENQUIRY_VIEW: ['manager', 'admin', 'super_admin'],
  ENQUIRY_DELETE: ['super_admin'],
  USER_MANAGE: ['super_admin'],
  ANALYTICS_VIEW: ['manager', 'admin', 'super_admin'],
} as const;
```

---

## Stripe Payment Integration

> Sandbox integration for product reservation / custom order payment.

### Backend — Payment Intent

```typescript
// controllers/payment.controller.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = catchAsync(async (req, res) => {
  const { productId, amount, currency = 'inr' } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.priceType !== 'fixed') {
    throw new ApiError(400, 'This product requires a custom enquiry');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,     // Convert to paise (INR smallest unit)
    currency,
    metadata: {
      productId: product._id.toString(),
      productName: product.name,
    },
    automatic_payment_methods: { enabled: true },
  });

  res.json(
    new ApiResponse(200, { clientSecret: paymentIntent.client_secret })
  );
});
```

### Frontend — Stripe Elements

```typescript
// components/payment/CheckoutForm.tsx
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export const CheckoutForm = ({ amount, productName }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
      },
    });

    if (error) toast.error(error.message);
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : `Pay ₹${amount.toLocaleString('en-IN')}`}
      </Button>
    </form>
  );
};
```

---

## Webhook Architecture

```typescript
// routes/webhook.routes.ts
router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),  // Raw body required for signature verification
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
    }

    res.json({ received: true });
  }
);
```

---

## API Versioning Strategy

```
/api/v1/  ← Current (stable)
/api/v2/  ← Future (when breaking changes required)
```

**Rules:**
- Non-breaking changes (new optional fields, new endpoints) → same version
- Breaking changes (field removal, response shape change) → new version
- Old versions supported for minimum **6 months** after new version release
- Deprecation communicated via `Deprecation` and `Sunset` response headers:

```typescript
res.setHeader('Deprecation', 'true');
res.setHeader('Sunset', 'Sat, 01 Jan 2027 00:00:00 GMT');
res.setHeader('Link', '<https://api.babulaljewellers.com/api/v2/products>; rel="successor-version"');
```

---

## Structured Logging & Observability

### Winston Logger Setup

```typescript
// utils/logger.ts
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, errors, json, colorize, simple } = format;

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'babulal-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'development'
        ? combine(colorize(), simple())
        : json(),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Request ID middleware (correlation IDs)
export const requestIdMiddleware = (req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  logger.info('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
};
```

---

## Database Migration Strategy

Use `migrate-mongo` for schema migrations:

```bash
npm install migrate-mongo

# Create migration
npx migrate-mongo create add-product-purity-field

# Run pending migrations
npx migrate-mongo up

# Rollback last migration
npx migrate-mongo down
```

**Example migration:**

```javascript
// migrations/20240215-add-product-purity.js
module.exports = {
  async up(db) {
    await db.collection('products').updateMany(
      { purity: { $exists: false } },
      { $set: { purity: null } }
    );
  },
  async down(db) {
    await db.collection('products').updateMany(
      {},
      { $unset: { purity: '' } }
    );
  },
};
```

---

## Testing Strategy

### Test Coverage Targets

| Layer | Tool | Min Coverage |
|---|---|---|
| Unit — Utils/Hooks | Vitest / Jest | 90% |
| Unit — Controllers | Jest + Supertest | 85% |
| Integration — API | Supertest + MongoDB Memory Server | 80% |
| E2E — Critical Flows | Playwright | Key user journeys |

### API Integration Test Example

```typescript
// __tests__/products.test.ts
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';

describe('GET /api/v1/products', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('returns paginated products', async () => {
    const res = await request(app).get('/api/v1/products?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.pagination).toHaveProperty('currentPage', 1);
  });

  it('requires authentication to create product', async () => {
    const res = await request(app).post('/api/v1/products').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});
```

---

## SEO & Structured Data

### JSON-LD Product Schema

```typescript
// components/product/ProductSchema.tsx
interface ProductSchemaProps {
  product: Product;
}

export const ProductSchema = ({ product }: ProductSchemaProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: { '@type': 'Brand', name: 'Babulal Jewellers' },
    sku: product._id,
    material: product.material,
    offers: product.priceType === 'fixed'
      ? {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: product.price,
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Organization', name: 'Babulal Jewellers' },
        }
      : {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          priceSpecification: {
            '@type': 'PriceSpecification',
            description: 'Price on Request',
          },
        },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
```

---

## Admin Audit Log

Track sensitive admin operations for security and compliance.

```typescript
// models/AuditLog.model.ts
const AuditLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
    required: true,
  },
  resource: { type: String, required: true },  // e.g. 'Product', 'Enquiry'
  resourceId: { type: String },
  changes: { type: Schema.Types.Mixed },       // Before/after diff for updates
  ipAddress: { type: String },
  userAgent: { type: String },
}, { timestamps: true });

// Middleware to auto-log changes
export const auditLog = (action: string, resource: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        AuditLog.create({
          adminId: req.user?._id,
          action,
          resource,
          resourceId: req.params.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }
    });
    next();
  };

// Usage
router.delete('/products/:id', authenticate, authorize('super_admin'), auditLog('DELETE', 'Product'), deleteProduct);
```

---

## WebSocket Real-Time Notifications

For real-time admin alerts (new enquiry notifications):

```typescript
// server.ts
import { Server as SocketIOServer } from 'socket.io';

const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') }
});

// Authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    socket.data.user = decoded;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

// Emit new enquiry notification to all connected admins
export const notifyAdmins = (event: string, data: unknown) => {
  io.emit(event, data);
};

// In Enquiry post-save hook:
EnquirySchema.post('save', (doc) => {
  notifyAdmins('new:enquiry', {
    id: doc._id,
    name: doc.name,
    message: doc.message.slice(0, 80) + '...',
  });
});
```

---

## Sitemap & Robots.txt Generation

```typescript
// GET /sitemap.xml — Dynamic sitemap
router.get('/sitemap.xml', async (req, res) => {
  const products = await Product.find({ isActive: true }).select('slug updatedAt');
  const categories = await Category.find({ isActive: true }).select('slug updatedAt');

  const urls = [
    { loc: 'https://babulaljewellers.com/', changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://babulaljewellers.com/shop', changefreq: 'daily', priority: '0.9' },
    ...categories.map(c => ({
      loc: `https://babulaljewellers.com/shop?category=${c.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: c.updatedAt.toISOString(),
    })),
    ...products.map(p => ({
      loc: `https://babulaljewellers.com/shop/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: p.updatedAt.toISOString(),
    })),
  ];

  const xml = generateSitemapXML(urls);
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});
```

---

*Advanced Enhancements Guide v1.0 · Babulal Jewellers Engineering*
