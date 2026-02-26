# 💎 Babulal Jewellers — Performance & Security Strategy

> Production-Grade Optimization & Hardening Guide

---

## Table of Contents

1. [Performance Strategy](#performance-strategy)
2. [Frontend Performance](#frontend-performance)
3. [Backend Performance](#backend-performance)
4. [Database Performance](#database-performance)
5. [Image Optimization](#image-optimization)
6. [Caching Strategy](#caching-strategy)
7. [Security Architecture](#security-architecture)
8. [HTTP Security Headers](#http-security-headers)
9. [Authentication Security](#authentication-security)
10. [Input Validation & Sanitization](#input-validation--sanitization)
11. [Rate Limiting](#rate-limiting)
12. [CORS Configuration](#cors-configuration)
13. [Security Audit Checklist](#security-audit-checklist)

---

## Performance Strategy

### Target Metrics

| Metric | Target | Measurement Tool |
|---|---|---|
| Lighthouse Performance | ≥ 90 | Chrome DevTools / PageSpeed Insights |
| Lighthouse SEO | ≥ 95 | Lighthouse |
| First Contentful Paint | < 1.5s | Web Vitals |
| Largest Contentful Paint | < 2.5s | Web Vitals |
| Cumulative Layout Shift | < 0.1 | Web Vitals |
| Time to Interactive | < 3.5s | Lighthouse |
| API Response Time (local) | < 200ms | k6 / Apache JMeter |
| API Response Time (prod) | < 500ms | k6 / Datadog |

---

## Frontend Performance

### 1. Code Splitting & Lazy Loading

```typescript
// router/AppRouter.tsx — Route-level code splitting
const Home = lazy(() => import('../pages/public/Home'));
const Shop = lazy(() => import('../pages/public/Shop'));
const ProductDetail = lazy(() => import('../pages/public/ProductDetail'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));

// Wrap routes in Suspense
<Suspense fallback={<PageSpinner />}>
  <RouterProvider router={router} />
</Suspense>
```

### 2. Vite Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          'vendor-charts': ['recharts'],
          'vendor-forms': ['react-hook-form', 'zod'],
        },
      },
    },
    chunkSizeWarningLimit: 400,  // Warn if chunk > 400KB
    sourcemap: false,             // Disable in production
  },
  plugins: [
    react(),
    visualizer({ open: false, filename: 'dist/stats.html' }),
  ],
});
```

### 3. React Rendering Optimization

```typescript
// Memoize expensive components
const ProductCard = React.memo(({ product }: { product: Product }) => {
  // ...
}, (prevProps, nextProps) => prevProps.product._id === nextProps.product._id);

// Memoize derived data
const sortedProducts = useMemo(
  () => [...products].sort((a, b) => b.views - a.views),
  [products]
);

// Stable callbacks
const handleAddToCart = useCallback(
  (product: Product) => addItem(product),
  [addItem]
);
```

### 4. Scroll Virtualization (Large Product Lists)

For product grids with 100+ items, use `@tanstack/react-virtual`:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: products.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 320,
  overscan: 5,
});
```

### 5. Asset Optimization

```typescript
// Use Cloudinary's automatic format/quality optimization
const getOptimizedImageUrl = (publicId: string, width: number) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},dpr_auto/${publicId}`;

// Responsive images
<img
  src={getOptimizedImageUrl(product.images[0].publicId, 600)}
  srcSet={`
    ${getOptimizedImageUrl(product.images[0].publicId, 300)} 300w,
    ${getOptimizedImageUrl(product.images[0].publicId, 600)} 600w,
    ${getOptimizedImageUrl(product.images[0].publicId, 1200)} 1200w
  `}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  loading="lazy"
  decoding="async"
  alt={product.name}
/>
```

---

## Backend Performance

### 1. Database Query Optimization

```typescript
// ✅ Select only needed fields
const products = await Product
  .find({ isActive: true })
  .select('name slug price priceType images category views isFeatured')
  .populate('category', 'name slug')
  .lean()    // Return plain JS objects (faster than Mongoose documents)
  .limit(12);

// ✅ Use lean() for read-only operations (saves ~40% memory/time)
// ✅ Aggregation for analytics (avoid N+1 queries)
const stats = await Enquiry.aggregate([
  {
    $group: {
      _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': -1, '_id.month': -1 } },
  { $limit: 12 }
]);
```

### 2. Pagination Implementation

```typescript
// utils/paginate.ts
export const paginate = async <T>(
  model: Model<T>,
  query: FilterQuery<T>,
  options: { page: number; limit: number; sort?: Record<string, SortOrder> }
): Promise<PaginatedResult<T>> => {
  const { page = 1, limit = 12, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(query).sort(sort).skip(skip).limit(limit).lean(),
    model.countDocuments(query),
  ]);

  return {
    data: data as T[],
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};
```

### 3. Compression

```typescript
import compression from 'compression';

app.use(compression({
  level: 6,                     // Compression level (1-9)
  threshold: 1024,              // Only compress > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

---

## Database Performance

### Index Monitoring

```javascript
// Check index usage in MongoDB Atlas / mongosh
db.products.aggregate([{ $indexStats: {} }])

// Explain slow queries
db.products.find({ isActive: true }).explain('executionStats')
```

### Connection Pooling

```typescript
// config/db.ts
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,              // Maximum connection pool size
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

---

## Image Optimization

### Cloudinary Upload Transform Pipeline

```typescript
const transformation = [
  // Step 1: Resize to max 1200x1200 (maintain aspect ratio)
  { width: 1200, height: 1200, crop: 'limit' },
  // Step 2: Strip metadata, auto-format (WebP, AVIF)
  { fetch_format: 'auto', quality: 'auto:good' },
];
```

### Lazy Loading with Intersection Observer

```typescript
// hooks/useLazyImage.ts
export const useLazyImage = (src: string) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return { imgRef, imageSrc: loaded ? src : undefined };
};
```

---

## Caching Strategy

### L1: Browser Cache (Static Assets)

```
Cache-Control: public, max-age=31536000, immutable
# Applied by Nginx to all hashed JS/CSS bundles
```

### L2: Redis API Cache

```typescript
// middleware/cache.middleware.ts
export const cacheMiddleware = (ttl: number) => async (req, res, next) => {
  if (!redisClient.isReady) return next();

  const key = `cache:${req.originalUrl}`;
  const cached = await redisClient.get(key);

  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(JSON.parse(cached));
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    redisClient.setEx(key, ttl, JSON.stringify(data));
    res.setHeader('X-Cache', 'MISS');
    return originalJson(data);
  };

  next();
};

// Usage:
router.get('/products', cacheMiddleware(300), getProducts);
router.get('/categories', cacheMiddleware(3600), getCategories);
router.get('/analytics/dashboard', cacheMiddleware(900), getDashboardAnalytics);
```

---

## Security Architecture

### Threat Model

| Threat | Mitigation |
|---|---|
| SQL/NoSQL Injection | Mongoose schema validation + Joi/Zod input validation |
| XSS (Stored) | Input sanitization (DOMPurify client-side, sanitize-html server-side) |
| CSRF | SameSite cookie + CORS allowlist |
| Brute-Force Login | express-rate-limit (10 req/15min on `/auth/login`) |
| DDoS | Cloudflare + Nginx rate limiting |
| JWT Theft | Short expiry (7d) + httpOnly refresh cookie |
| File Upload Exploit | Multer file type validation + Cloudinary scanning |
| Unauthorized Data Access | RBAC middleware on all admin routes |
| Secrets Exposure | Environment variables, never committed to Git |
| MITM | TLS 1.3 + HSTS with preload |

---

## HTTP Security Headers

```typescript
// app.ts — Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'res.cloudinary.com', '*.babulaljewellers.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      connectSrc: ["'self'", 'api.babulaljewellers.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## Authentication Security

### JWT Best Practices

```typescript
// Token issuance
const accessToken = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d', issuer: 'babulal-jewellers', audience: 'admin-panel' }
);

// Token verification (auth.middleware.ts)
const decoded = jwt.verify(token, process.env.JWT_SECRET, {
  issuer: 'babulal-jewellers',
  audience: 'admin-panel',
}) as JwtPayload;
```

### Refresh Token (httpOnly Cookie)

```typescript
// Set refresh token as httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,        // Inaccessible to JavaScript
  secure: true,          // HTTPS only
  sameSite: 'strict',    // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000,   // 30 days
  path: '/api/v1/auth',  // Scoped to auth routes only
});
```

---

## Input Validation & Sanitization

### Zod Schema (Frontend)

```typescript
// schemas/enquiry.schema.ts
export const enquirySchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().regex(/^[+\d\s-]{10,15}$/).optional(),
  message: z.string().min(10).max(500).trim(),
  productId: z.string().optional(),
});
```

### Joi Schema (Backend)

```typescript
// validations/enquiry.schema.ts
export const createEnquirySchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().required(),
  phone: Joi.string().pattern(/^[+\d\s-]{10,15}$/).optional(),
  message: Joi.string().min(10).max(500).trim().required(),
  productId: Joi.string().hex().length(24).optional(),
});
```

---

## Rate Limiting

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                     // Strict: 10 login attempts per 15min
  skipSuccessfulRequests: true, // Don't count successful logins
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

// Apply
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/products', uploadRateLimiter);  // For POST/PATCH with images
app.use('/api/', globalRateLimiter);
```

---

## CORS Configuration

```typescript
// config/cors.ts
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,            // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400,                 // Cache preflight for 24 hours
};
```

---

## Security Audit Checklist

| # | Check | Status |
|---|---|---|
| 1 | All secrets loaded from `.env`, never hardcoded | ✅ |
| 2 | `.env` in `.gitignore` | ✅ |
| 3 | Helmet middleware on all routes | ✅ |
| 4 | CORS allowlist configured | ✅ |
| 5 | Rate limiting on auth and upload endpoints | ✅ |
| 6 | JWT expiry set (7 days max) | ✅ |
| 7 | Refresh token in httpOnly cookie | ✅ |
| 8 | bcrypt cost factor ≥ 12 | ✅ |
| 9 | Input validation on every POST/PATCH endpoint | ✅ |
| 10 | MongoDB: no `$where` / direct query string passthrough | ✅ |
| 11 | File upload validates MIME type before Cloudinary | ✅ |
| 12 | Admin routes protected by RBAC middleware | ✅ |
| 13 | TLS 1.2+ enforced at Nginx | ✅ |
| 14 | HSTS with preload enabled | ✅ |
| 15 | Dependency vulnerabilities audited (`npm audit`) | ✅ |
| 16 | No sensitive data in API error responses | ✅ |
| 17 | Logs do not contain PII or passwords | ✅ |
| 18 | `X-Powered-By` header disabled | ✅ |

---

*Performance & Security Guide v1.0 · Babulal Jewellers Engineering*

*created by Sanket Thakkar*
