# 💎 Babulal Jewellers — Frontend

> React 18 + TypeScript + Vite · Luxury E-Commerce Storefront & Admin Panel

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Available Scripts](#available-scripts)
6. [Project Structure](#project-structure)
7. [State Management](#state-management)
8. [Routing Architecture](#routing-architecture)
9. [UI Component System](#ui-component-system)
10. [Performance Optimizations](#performance-optimizations)
11. [SEO Strategy](#seo-strategy)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## Project Overview

The Babulal Jewellers frontend is a luxury-grade, fully responsive e-commerce storefront built with React 18 and TypeScript. It serves two distinct interfaces:

- **Customer Storefront** — Product browsing, search, filtering, cart, and enquiry submission
- **Admin Panel** — Full CRUD for products/categories, enquiry management, and analytics dashboard

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React | 18.3 | UI rendering (Concurrent Mode) |
| Language | TypeScript | 5.x | Type safety |
| Build Tool | Vite | 5.x | Dev server & bundling |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS |
| Components | shadcn/ui | Latest | Accessible component primitives |
| State | Zustand | 4.x | Lightweight global state |
| Router | React Router | v6 | Client-side routing |
| Forms | React Hook Form | 7.x | Performant form management |
| Validation | Zod | 3.x | Schema-based validation |
| Charts | Recharts | 2.x | Admin analytics charts |
| HTTP | Axios | 1.x | API communication |
| Auth | JWT + cookies | — | Token-based session management |

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x or **pnpm** >= 9.x
- Backend API running (see `../server/`)

### Installation

```bash
# Clone the repository
git clone https://github.com/sanket-thakkar-404/Jewellery-Ecommerce
cd client

# Install dependencies
npm install

# Copy environment template
cp .env .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`.

---

## Environment Variables

Create a `.env.local` file in the `client/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Cloudinary (for direct upload widget — optional)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Application
VITE_APP_NAME=Babulal Jewellers
VITE_APP_URL=http://localhost:8080

# Stripe (Sandbox)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

> **Important:** Never commit `.env.local` to version control. All variables exposed to the client must be prefixed with `VITE_`.

---

## Available Scripts

```bash
# Development server with HMR
npm run dev

# TypeScript type checking
npm run typecheck

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Lint (ESLint + Prettier)
npm run lint
npm run lint:fix

# Run unit tests (Vitest)
npm run test
npm run test:coverage
```

---

## Project Structure

```
client/
├── public/
│   ├── favicon.ico
│   ├── og-image.jpg              # Open Graph image
│   └── robots.txt
├── src/
│   ├── api/                      # Axios instances & service modules
│   │   ├── axiosInstance.ts
│   │   ├── products.api.ts
│   │   ├── categories.api.ts
│   │   ├── enquiries.api.ts
│   │   └── auth.api.ts
│   ├── assets/                   # Static images, fonts, icons
│   ├── components/
│   │   ├── ui/                   # shadcn/ui re-exports + overrides
│   │   ├── layout/               # Navbar, Footer, Sidebar
│   │   ├── product/              # ProductCard, ProductGrid, ProductDetail
│   │   ├── enquiry/              # EnquiryForm, EnquiryModal
│   │   ├── cart/                 # CartDrawer, CartItem, CartSummary
│   │   ├── admin/                # AdminHeader, StatCard, DataTable
│   │   └── common/               # Spinner, ErrorBoundary, EmptyState
│   ├── hooks/                    # Custom React hooks
│   │   ├── useProducts.ts
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useInfiniteScroll.ts
│   ├── pages/
│   │   ├── public/               # Home, Shop, ProductDetail, About, Contact
│   │   └── admin/                # Dashboard, Products, Categories, Enquiries
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts
│   │   ├── cartStore.ts
│   │   └── uiStore.ts
│   ├── types/                    # Global TypeScript interfaces & enums
│   │   ├── product.types.ts
│   │   ├── enquiry.types.ts
│   │   └── auth.types.ts
│   ├── utils/                    # Helper functions, formatters, validators
│   ├── schemas/                  # Zod validation schemas
│   ├── router/                   # Route definitions, guards
│   │   ├── AppRouter.tsx
│   │   └── ProtectedRoute.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .eslintrc.cjs
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## State Management

Zustand is used for global client state. Each store is modular and persisted where necessary.

### Auth Store (`authStore.ts`)

```typescript
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  role: 'super_admin' | 'admin' | 'manager' | null;
  isAuthenticated: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  logout: () => void;
}
```

### Cart Store (`cartStore.ts`)

```typescript
interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}
```

Cart state is persisted to `localStorage` via the Zustand `persist` middleware.

---

## Routing Architecture

```typescript
// router/AppRouter.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'shop/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      { path: 'enquiry', element: <Enquiry /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['super_admin', 'admin', 'manager']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'enquiries', element: <AdminEnquiries /> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '*', element: <NotFound /> },
]);
```

---

## UI Component System

Babulal Jewellers uses a **dual-layer component system**:

1. **shadcn/ui primitives** — accessible, unstyled base components (Dialog, Sheet, Table, etc.)
2. **Custom luxury theme** — Tailwind configuration with brand tokens

### Tailwind Brand Tokens (`tailwind.config.ts`)

```typescript
theme: {
  extend: {
    colors: {
      gold: {
        50:  '#fdfbf0',
        100: '#faf3d0',
        400: '#d4a843',
        500: '#c9922a',
        600: '#b07a20',
      },
      charcoal: {
        900: '#1a1a1a',
        800: '#2d2d2d',
      },
      cream: '#faf8f2',
    },
    fontFamily: {
      serif:  ['Cormorant Garamond', 'Georgia', 'serif'],
      sans:   ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

## Performance Optimizations

| Technique | Implementation |
|---|---|
| Code Splitting | `React.lazy()` + `Suspense` on all route-level components |
| Image Optimization | Cloudinary URL transforms (`f_webp,q_auto,w_auto`) |
| Lazy Loading | `loading="lazy"` on all below-fold images |
| Bundle Analysis | `vite-bundle-visualizer` for chunk inspection |
| Memoization | `React.memo`, `useMemo`, `useCallback` on heavy renders |
| Prefetching | `<link rel="prefetch">` for anticipated navigation routes |
| HTTP Caching | `stale-while-revalidate` cache policy via Axios + localStorage |

**Target Lighthouse Scores:**

| Metric | Target |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 90 |
| SEO | ≥ 95 |

---

## SEO Strategy

Each page sets meta tags dynamically using a custom `useSEO` hook:

```typescript
// hooks/useSEO.ts
export function useSEO({ title, description, image, canonicalUrl }: SEOMeta) {
  useEffect(() => {
    document.title = `${title} | Babulal Jewellers`;
    setMetaTag('description', description);
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', image);
    setMetaTag('og:url', canonicalUrl);
    setLinkTag('canonical', canonicalUrl);
  }, [title, description, image, canonicalUrl]);
}
```

**Product pages include JSON-LD structured data:**

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "22K Gold Kundan Necklace",
  "description": "Handcrafted Kundan necklace in 22K yellow gold",
  "image": ["https://res.cloudinary.com/..."],
  "brand": { "@type": "Brand", "name": "Babulal Jewellers" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "INR",
    "price": "45000",
    "availability": "https://schema.org/InStock"
  }
}
```

---

## Testing

```bash
# Unit tests (Vitest + React Testing Library)
npm run test

# Component tests
npm run test src/components

# Coverage report
npm run test:coverage
```

Key test coverage targets:
- All Zustand store actions
- Form validation schemas (Zod)
- Custom hooks
- Utility functions

---

## Deployment

### Build for Production

```bash
npm run build
# Output: dist/ directory
```

### Deploy to Nginx (see DevOps guide)

The `dist/` directory is served as static assets via Nginx. All routes return `index.html` to support client-side routing:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Environment for Production

Set the following in your CI/CD pipeline or hosting platform:

```env
VITE_API_BASE_URL=https://api.babulaljewellers.com/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

---

## Contributing

1. Branch from `develop`: `git checkout -b feature/your-feature`
2. Follow ESLint + Prettier rules
3. Write tests for new hooks and utilities
4. Open PR against `develop` — requires 1 reviewer approval

---

*Maintained by the Babulal Jewellers Engineering Team.*

created by Sanket Thakkar
