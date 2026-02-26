# 💎 Babulal Jewellers — Production Checklist

> Pre-Launch & Go-Live Verification · Version 1.0

---

Use this checklist before every production deployment. Items marked 🔴 are **critical** and must be resolved before launch.

---

## 1. Environment & Configuration

| # | Item | Priority | Status |
|---|---|---|---|
| 1.1 | All `.env` values set for production (no development defaults) | 🔴 Critical | ☐ |
| 1.2 | `.env` files excluded from Git (`.gitignore` verified) | 🔴 Critical | ☐ |
| 1.3 | `NODE_ENV=production` set in server environment | 🔴 Critical | ☐ |
| 1.4 | `VITE_API_BASE_URL` points to production API domain | 🔴 Critical | ☐ |
| 1.5 | JWT secret is cryptographically random, minimum 32 characters | 🔴 Critical | ☐ |
| 1.6 | MongoDB Atlas URI is production cluster (not development) | 🔴 Critical | ☐ |
| 1.7 | Cloudinary folder name set to production namespace | 🟡 High | ☐ |
| 1.8 | SMTP credentials configured and verified with test email | 🟡 High | ☐ |
| 1.9 | Stripe production keys active (or sandbox keys clearly labeled) | 🟡 High | ☐ |
| 1.10 | `ALLOWED_ORIGINS` restricts to production domain only | 🔴 Critical | ☐ |

---

## 2. Security

| # | Item | Priority | Status |
|---|---|---|---|
| 2.1 | HTTPS enforced on all endpoints (HTTP redirects to HTTPS) | 🔴 Critical | ☐ |
| 2.2 | SSL certificate valid and auto-renewal configured (Certbot cron) | 🔴 Critical | ☐ |
| 2.3 | Helmet middleware active — verify with `curl -I https://api.domain/health` | 🔴 Critical | ☐ |
| 2.4 | HSTS header present with `preload` directive | 🟡 High | ☐ |
| 2.5 | Rate limiting active on `/auth/login` (≤10 req/15min) | 🔴 Critical | ☐ |
| 2.6 | Rate limiting active on all public API routes | 🟡 High | ☐ |
| 2.7 | Input validation (Joi/Zod) active on all POST/PATCH routes | 🔴 Critical | ☐ |
| 2.8 | Admin routes return 401/403 without valid JWT | 🔴 Critical | ☐ |
| 2.9 | `X-Powered-By: Express` header removed | 🟢 Medium | ☐ |
| 2.10 | `npm audit` returns 0 critical vulnerabilities | 🟡 High | ☐ |
| 2.11 | File upload validates MIME type (reject non-image files) | 🟡 High | ☐ |
| 2.12 | MongoDB Atlas IP whitelist limits access to VPS IP only | 🔴 Critical | ☐ |
| 2.13 | bcrypt cost factor ≥ 12 for password hashing | 🔴 Critical | ☐ |
| 2.14 | Refresh token stored in httpOnly, Secure, SameSite=Strict cookie | 🔴 Critical | ☐ |
| 2.15 | No sensitive data (passwords, secrets) in API error responses | 🔴 Critical | ☐ |
| 2.16 | CORS allowlist does not contain `*` in production | 🔴 Critical | ☐ |

---

## 3. Database

| # | Item | Priority | Status |
|---|---|---|---|
| 3.1 | MongoDB Atlas cluster is M10+ (dedicated, not shared) | 🟡 High | ☐ |
| 3.2 | Atlas automated backups enabled | 🟡 High | ☐ |
| 3.3 | Database user has minimum required permissions (readWrite only) | 🔴 Critical | ☐ |
| 3.4 | All production indexes created and verified | 🟡 High | ☐ |
| 3.5 | Super admin user seeded in production database | 🔴 Critical | ☐ |
| 3.6 | Default categories seeded | 🟢 Medium | ☐ |
| 3.7 | Atlas query profiler enabled (threshold: slow queries > 100ms) | 🟢 Medium | ☐ |
| 3.8 | Atlas connection string uses SRV format with retryWrites=true | 🟡 High | ☐ |

---

## 4. Frontend

| # | Item | Priority | Status |
|---|---|---|---|
| 4.1 | Production build completes without errors (`npm run build`) | 🔴 Critical | ☐ |
| 4.2 | TypeScript type checking passes (`npm run typecheck`) | 🟡 High | ☐ |
| 4.3 | ESLint passes with no errors | 🟡 High | ☐ |
| 4.4 | All route-level components wrapped in `React.lazy()` + `Suspense` | 🟡 High | ☐ |
| 4.5 | `loading="lazy"` on all below-fold images | 🟡 High | ☐ |
| 4.6 | 404 page renders correctly for invalid routes | 🟢 Medium | ☐ |
| 4.7 | Admin login redirects unauthenticated users to `/admin/login` | 🔴 Critical | ☐ |
| 4.8 | Cart persists across page refreshes (localStorage) | 🟡 High | ☐ |
| 4.9 | All forms show validation errors correctly | 🟡 High | ☐ |
| 4.10 | Mobile responsive layout verified (320px, 768px, 1280px) | 🟡 High | ☐ |
| 4.11 | Favicon, OG image, and meta title/description set on all pages | 🟡 High | ☐ |
| 4.12 | `robots.txt` present and correct | 🟢 Medium | ☐ |
| 4.13 | Largest bundle chunk < 400KB (verify with `dist/stats.html`) | 🟢 Medium | ☐ |

---

## 5. Backend API

| # | Item | Priority | Status |
|---|---|---|---|
| 5.1 | `GET /health` returns `200 { status: 'ok' }` | 🔴 Critical | ☐ |
| 5.2 | All API routes return correct HTTP status codes | 🔴 Critical | ☐ |
| 5.3 | Pagination works correctly on `/products` and `/enquiries` | 🟡 High | ☐ |
| 5.4 | Product image upload works end-to-end (Cloudinary verified) | 🔴 Critical | ☐ |
| 5.5 | Enquiry submission triggers admin email notification | 🔴 Critical | ☐ |
| 5.6 | Enquiry status update works (new → read → replied) | 🟡 High | ☐ |
| 5.7 | Analytics dashboard data loads within 1 second | 🟡 High | ☐ |
| 5.8 | Redis cache operational (check `X-Cache: HIT` header) | 🟢 Medium | ☐ |
| 5.9 | Full-text product search returns relevant results | 🟡 High | ☐ |
| 5.10 | Product `views` counter increments on detail page visit | 🟢 Medium | ☐ |
| 5.11 | Error responses never expose stack traces in production | 🔴 Critical | ☐ |
| 5.12 | Winston logs writing to `logs/combined.log` and `logs/error.log` | 🟡 High | ☐ |

---

## 6. DevOps & Infrastructure

| # | Item | Priority | Status |
|---|---|---|---|
| 6.1 | All Docker containers running and healthy | 🔴 Critical | ☐ |
| 6.2 | Nginx serving static assets for client | 🔴 Critical | ☐ |
| 6.3 | Nginx proxying `/api/` requests to Express server | 🔴 Critical | ☐ |
| 6.4 | Docker containers restart automatically on crash (`restart: unless-stopped`) | 🟡 High | ☐ |
| 6.5 | Server has adequate resources (≥ 2 vCPU, ≥ 4GB RAM) | 🟡 High | ☐ |
| 6.6 | Disk usage < 80% on VPS | 🟡 High | ☐ |
| 6.7 | GitHub Actions CI pipeline passing (all test + build steps green) | 🟡 High | ☐ |
| 6.8 | Production deploy workflow tested end-to-end on staging | 🟡 High | ☐ |
| 6.9 | SSH access restricted to key-based authentication only | 🟡 High | ☐ |
| 6.10 | VPS firewall: only ports 22, 80, 443 open | 🔴 Critical | ☐ |
| 6.11 | Log files not growing unbounded (logrotate configured) | 🟢 Medium | ☐ |

---

## 7. Performance

| # | Item | Priority | Status |
|---|---|---|---|
| 7.1 | Lighthouse Performance score ≥ 85 on production URL | 🟡 High | ☐ |
| 7.2 | Lighthouse SEO score ≥ 90 | 🟡 High | ☐ |
| 7.3 | LCP (Largest Contentful Paint) < 2.5s | 🟡 High | ☐ |
| 7.4 | CLS (Cumulative Layout Shift) < 0.1 | 🟡 High | ☐ |
| 7.5 | API response time < 500ms for paginated product list (production) | 🟡 High | ☐ |
| 7.6 | Product images served in WebP format (verified in Network tab) | 🟡 High | ☐ |
| 7.7 | Gzip/Brotli compression active on Nginx (check `Content-Encoding`) | 🟡 High | ☐ |
| 7.8 | Static assets have `Cache-Control: public, max-age=31536000, immutable` | 🟢 Medium | ☐ |

---

## 8. Functionality QA (Manual Testing)

| # | User Flow | Priority | Status |
|---|---|---|---|
| 8.1 | Homepage loads with hero banner + featured products | 🔴 Critical | ☐ |
| 8.2 | Shop page: filter by category works | 🔴 Critical | ☐ |
| 8.3 | Shop page: search by name works | 🔴 Critical | ☐ |
| 8.4 | Product detail page: images, price, description render correctly | 🔴 Critical | ☐ |
| 8.5 | Add to cart: item appears in cart drawer with correct quantity | 🔴 Critical | ☐ |
| 8.6 | Enquiry form: customer can submit and receives success feedback | 🔴 Critical | ☐ |
| 8.7 | Admin login: valid credentials authenticate successfully | 🔴 Critical | ☐ |
| 8.8 | Admin login: invalid credentials show error message | 🟡 High | ☐ |
| 8.9 | Admin dashboard: 4 KPI stat cards display correct data | 🔴 Critical | ☐ |
| 8.10 | Admin dashboard: monthly enquiry chart renders | 🟡 High | ☐ |
| 8.11 | Admin products: create new product with images | 🔴 Critical | ☐ |
| 8.12 | Admin products: edit product name and price | 🔴 Critical | ☐ |
| 8.13 | Admin products: delete product removes from storefront | 🔴 Critical | ☐ |
| 8.14 | Admin enquiries: mark enquiry as replied | 🟡 High | ☐ |
| 8.15 | Cross-browser: Chrome, Firefox, Safari, Edge | 🟡 High | ☐ |
| 8.16 | Mobile: iPhone SE (375px) renders correctly | 🟡 High | ☐ |

---

## 9. Monitoring & Alerts

| # | Item | Priority | Status |
|---|---|---|---|
| 9.1 | Uptime monitoring configured (UptimeRobot or equivalent) | 🟡 High | ☐ |
| 9.2 | Alert on server downtime (email/SMS notification set up) | 🟡 High | ☐ |
| 9.3 | MongoDB Atlas alerts configured (connection, replication lag) | 🟡 High | ☐ |
| 9.4 | Cloudinary bandwidth usage alerts configured | 🟢 Medium | ☐ |
| 9.5 | Error rate anomaly alert in place | 🟢 Medium | ☐ |

---

## Priority Legend

| Symbol | Priority | Meaning |
|---|---|---|
| 🔴 | Critical | Must be resolved before go-live |
| 🟡 | High | Should be resolved before go-live |
| 🟢 | Medium | Resolve within first week post-launch |

---

## Sign-Off

| Role | Name | Date | Signature |
|---|---|---|---|
| Lead Engineer | | | |
| QA / Reviewer | | | |
| Project Owner | | | |

---

*Production Checklist v1.0 · Babulal Jewellers Engineering*
