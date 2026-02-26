# 💎 Babulal Jewellers — Complete Folder Structure

> Frontend (React/Vite) + Backend (Node/Express) · Monorepo Layout

---

## Repository Root Structure

```
babulal-jewellers/                         # Monorepo root
├── client/                                # React frontend
├── server/                                # Express backend
├── nginx/                                 # Nginx config
│   ├── nginx.conf
│   └── conf.d/
│       └── babulal.conf
├── .github/
│   └── workflows/
│       └── deploy.yml                     # CI/CD pipeline
├── docker-compose.yml                     # Production compose
├── docker-compose.dev.yml                 # Development compose
├── .gitignore
└── README.md                              # Project overview
```

---

## Frontend Structure

```
client/
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg                       # Open Graph image (1200×630)
│   ├── logo.svg
│   └── robots.txt
│
├── src/
│   │
│   ├── api/                               # API service layer (Axios)
│   │   ├── axiosInstance.ts               # Base Axios config + interceptors
│   │   ├── auth.api.ts                    # Login, refresh, me
│   │   ├── products.api.ts                # CRUD + filtering
│   │   ├── categories.api.ts
│   │   ├── enquiries.api.ts
│   │   └── analytics.api.ts
│   │
│   ├── assets/                            # Static assets
│   │   ├── images/
│   │   │   ├── hero-bg.webp
│   │   │   ├── logo.svg
│   │   │   └── logo-dark.svg
│   │   └── fonts/                         # Self-hosted fonts (optional)
│   │
│   ├── components/
│   │   │
│   │   ├── ui/                            # shadcn/ui components (re-exports)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── badge.tsx
│   │   │
│   │   ├── layout/                        # App layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PublicLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   └── AdminHeader.tsx
│   │   │
│   │   ├── product/                       # Product display components
│   │   │   ├── ProductCard.tsx            # Grid card
│   │   │   ├── ProductGrid.tsx            # Responsive grid wrapper
│   │   │   ├── ProductDetail.tsx          # Full detail view
│   │   │   ├── ProductImageGallery.tsx    # Lightbox gallery
│   │   │   ├── ProductFilters.tsx         # Category + search filters
│   │   │   ├── ProductSchema.tsx          # JSON-LD structured data
│   │   │   ├── RelatedProducts.tsx
│   │   │   └── FeaturedProducts.tsx
│   │   │
│   │   ├── admin/                         # Admin panel components
│   │   │   ├── StatCard.tsx               # KPI metric card
│   │   │   ├── DataTable.tsx              # Sortable, paginated table
│   │   │   ├── ProductForm.tsx            # Create/edit product form
│   │   │   ├── CategoryForm.tsx
│   │   │   ├── ImageUploader.tsx          # Multi-image upload with preview
│   │   │   ├── EnquiryRow.tsx
│   │   │   ├── DeleteConfirmDialog.tsx
│   │   │   └── AnalyticsChart.tsx         # Recharts wrapper
│   │   │
│   │   ├── cart/                          # Shopping cart components
│   │   │   ├── CartDrawer.tsx             # Slide-in cart panel
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartIcon.tsx               # Header icon with badge
│   │   │
│   │   ├── enquiry/                       # Enquiry form components
│   │   │   ├── EnquiryForm.tsx
│   │   │   ├── EnquiryModal.tsx
│   │   │   └── EnquirySuccessMessage.tsx
│   │   │
│   │   └── common/                        # Reusable utility components
│   │       ├── Spinner.tsx
│   │       ├── PageSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── SEOHead.tsx                # useSEO hook wrapper
│   │       ├── Pagination.tsx
│   │       └── ConfirmModal.tsx
│   │
│   ├── hooks/                             # Custom React hooks
│   │   ├── useAuth.ts                     # Auth state + actions
│   │   ├── useCart.ts                     # Cart operations
│   │   ├── useProducts.ts                 # Product fetching + pagination
│   │   ├── useCategories.ts
│   │   ├── useEnquiries.ts
│   │   ├── useSEO.ts                      # Dynamic meta tags
│   │   ├── useDebounce.ts                 # Search input debounce
│   │   ├── useInfiniteScroll.ts           # Infinite product loading
│   │   ├── useLazyImage.ts                # Intersection Observer lazy load
│   │   └── useLocalStorage.ts             # Type-safe localStorage
│   │
│   ├── pages/
│   │   ├── public/                        # Customer-facing pages
│   │   │   ├── Home.tsx                   # Hero + Featured + Categories
│   │   │   ├── Shop.tsx                   # Product listing with filters
│   │   │   ├── ProductDetail.tsx          # Single product page
│   │   │   ├── Cart.tsx                   # Cart page
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── NotFound.tsx               # 404 page
│   │   │
│   │   └── admin/                         # Admin panel pages
│   │       ├── AdminLogin.tsx
│   │       ├── Dashboard.tsx              # KPIs + charts
│   │       ├── AdminProducts.tsx          # Product CRUD table
│   │       ├── AdminCategories.tsx
│   │       └── AdminEnquiries.tsx
│   │
│   ├── router/                            # Routing configuration
│   │   ├── AppRouter.tsx                  # createBrowserRouter config
│   │   └── ProtectedRoute.tsx             # Auth + role guard HOC
│   │
│   ├── store/                             # Zustand state stores
│   │   ├── authStore.ts                   # Auth state + actions
│   │   ├── cartStore.ts                   # Cart (persisted to localStorage)
│   │   └── uiStore.ts                     # Sidebar open/close, theme
│   │
│   ├── types/                             # TypeScript type definitions
│   │   ├── product.types.ts
│   │   ├── category.types.ts
│   │   ├── enquiry.types.ts
│   │   ├── auth.types.ts
│   │   └── api.types.ts                   # ApiResponse, Pagination types
│   │
│   ├── schemas/                           # Zod validation schemas
│   │   ├── product.schema.ts
│   │   ├── enquiry.schema.ts
│   │   └── auth.schema.ts
│   │
│   ├── utils/                             # Utility functions
│   │   ├── formatCurrency.ts              # ₹ Indian Rupee formatter
│   │   ├── formatDate.ts                  # IST date formatting
│   │   ├── cloudinaryUrl.ts               # Cloudinary transform helpers
│   │   ├── slugify.ts
│   │   └── classNames.ts                  # cn() helper
│   │
│   ├── styles/
│   │   └── globals.css                    # Tailwind base + custom CSS
│   │
│   ├── App.tsx                            # Root component
│   └── main.tsx                           # React 18 createRoot
│
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── Dockerfile
```

---

## Backend Structure

```
server/
│
├── src/
│   │
│   ├── config/                            # Configuration modules
│   │   ├── db.ts                          # Mongoose connect + events
│   │   ├── cloudinary.ts                  # Cloudinary v2 SDK init
│   │   ├── redis.ts                       # ioredis client
│   │   ├── stripe.ts                      # Stripe SDK init
│   │   └── env.ts                         # Joi-validated env config
│   │
│   ├── controllers/                       # Route handlers (thin layer)
│   │   ├── auth.controller.ts             # login, refresh, logout, me
│   │   ├── product.controller.ts          # CRUD + image ops
│   │   ├── category.controller.ts
│   │   ├── enquiry.controller.ts
│   │   ├── analytics.controller.ts        # Dashboard aggregations
│   │   └── payment.controller.ts          # Stripe payment intent
│   │
│   ├── middleware/                        # Express middleware
│   │   ├── auth.middleware.ts             # JWT verification
│   │   ├── role.middleware.ts             # RBAC authorize()
│   │   ├── validate.middleware.ts         # Joi schema validation
│   │   ├── upload.middleware.ts           # Multer + Cloudinary pipeline
│   │   ├── cache.middleware.ts            # Redis response cache
│   │   ├── rateLimiter.ts                 # express-rate-limit configs
│   │   ├── errorHandler.ts               # Global error handler
│   │   ├── notFound.ts                    # 404 handler
│   │   └── requestId.ts                   # Correlation ID header
│   │
│   ├── models/                            # Mongoose models
│   │   ├── User.model.ts
│   │   ├── Product.model.ts
│   │   ├── Category.model.ts
│   │   ├── Enquiry.model.ts
│   │   └── AuditLog.model.ts              # Admin action audit trail
│   │
│   ├── routes/                            # Express routers
│   │   ├── index.ts                       # Mount all sub-routers
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── category.routes.ts
│   │   ├── enquiry.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── payment.routes.ts
│   │   └── webhook.routes.ts              # Stripe webhook handler
│   │
│   ├── services/                          # Business logic / external APIs
│   │   ├── email.service.ts               # Nodemailer (enquiry notifications)
│   │   ├── cloudinary.service.ts          # Upload + delete helpers
│   │   ├── cache.service.ts               # Redis get/set/invalidate
│   │   └── token.service.ts               # JWT generate + verify
│   │
│   ├── utils/                             # Utility classes & functions
│   │   ├── ApiResponse.ts                 # Standardized success response
│   │   ├── ApiError.ts                    # Custom operational error
│   │   ├── catchAsync.ts                  # Async route wrapper
│   │   ├── logger.ts                      # Winston logger
│   │   ├── paginate.ts                    # Generic pagination helper
│   │   └── slugify.ts
│   │
│   ├── validations/                       # Joi request validation schemas
│   │   ├── auth.schema.ts
│   │   ├── product.schema.ts
│   │   ├── category.schema.ts
│   │   └── enquiry.schema.ts
│   │
│   ├── scripts/                           # One-off scripts
│   │   ├── seed.ts                        # Full database seed
│   │   ├── seed.admin.ts                  # Seed super_admin user only
│   │   └── migrate.ts                     # Run migrate-mongo
│   │
│   └── app.ts                             # Express app setup + middleware
│
├── migrations/                            # migrate-mongo migration files
│   └── 20240101-initial-categories.js
│
├── logs/                                  # Winston log files (gitignored)
│   ├── combined.log
│   └── error.log
│
├── __tests__/                             # Jest test suites
│   ├── auth.test.ts
│   ├── products.test.ts
│   ├── enquiries.test.ts
│   └── middleware/
│       ├── auth.middleware.test.ts
│       └── validate.middleware.test.ts
│
├── .env
├── .env.example
├── .eslintrc.cjs
├── jest.config.ts
├── package.json
├── server.ts                              # Entry point (http.createServer)
├── tsconfig.json
└── Dockerfile
```

---

## Key Conventions

| Convention | Rule |
|---|---|
| File naming | `camelCase.ts` for utilities, `PascalCase.tsx` for React components |
| API routes | Plural nouns: `/products`, `/categories`, `/enquiries` |
| Controllers | One file per resource, thin — delegate to services |
| Models | `PascalCase.model.ts` |
| Env vars | `SCREAMING_SNAKE_CASE` for backend, `VITE_` prefix for frontend |
| Imports | Absolute paths via `tsconfig.paths` (e.g., `@/components/ui/button`) |
| Error handling | Always use `catchAsync()` wrapper — no try/catch in controllers |
| Types | Define in `types/` — no inline `any` |

---

*Folder Structure v1.0 · Babulal Jewellers Engineering*
