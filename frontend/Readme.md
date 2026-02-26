# 💎 Babulal Jewellers — E-Commerce Website

A luxury jewelry e-commerce platform built with modern web technologies, featuring a full admin panel, product management, enquiry system, and analytics dashboard.

🔗 **Live Demo**: [bulalewellers.lovable.app](https://bulalewellers.lovable.app)

---

## 📌 Core Features

### 🛍️ 1. Product Management System (Admin Panel)
- ✅ Add, edit, and delete products
- ✅ Upload multiple product images
- ✅ Categorize products (Necklaces, Rings, Earrings, Bangles, Bracelets)
- ✅ Set price or mark as **"Price on Request"**
- ✅ Toggle **Featured** status
- ✅ Product views tracking

### 👤 2. Authentication
- ✅ Admin login with protected routes
- ✅ Session-based auth via `localStorage`
- ✅ Route guards on all admin pages
- ✅ Multi-admin management with role-based access (Super Admin, Admin, Manager)

### 🛒 3. Customer Side
- ✅ Browse all products with grid/list views
- ✅ Filter by category
- ✅ Search products by name
- ✅ Detailed product pages with image gallery
- ✅ Add to cart with persistent state (Zustand + localStorage)
- ✅ Send product-specific enquiries

### 📩 4. Enquiry System
- ✅ Enquiry form with product context
- ✅ Enquiries stored and displayed in admin dashboard
- ✅ Status tracking (New / Read / Replied)
- ✅ Admin can view and manage all enquiries

### 📊 5. Dashboard Analytics
- ✅ Total products count
- ✅ Total enquiries count
- ✅ Most viewed product
- ✅ Average views per product
- ✅ Monthly enquiries bar chart (Recharts)

---

## ⚙️ Tech Stack

| Layer        | Technology                              |
| ------------ | --------------------------------------- |
| **Frontend** | React 18 + TypeScript                  |
| **Build**    | Vite                                   |
| **Styling**  | Tailwind CSS + shadcn/ui               |
| **State**    | Zustand (persistent cart)              |
| **Routing**  | React Router v6                        |
| **Charts**   | Recharts                               |
| **Forms**    | React Hook Form + Zod validation       |
| **Icons**    | Lucide React                           |
| **Toasts**   | Sonner                                 |

---

## 🧱 Architecture

```
src/
├── assets/              # Static images & media
├── components/
│   ├── layout/          # MainLayout, AdminLayout, Navbar, Footer
│   ├── products/        # ProductCard, ProductFilters
│   └── ui/              # shadcn/ui components (40+ components)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities, mock data, helpers
├── pages/
│   ├── admin/           # Dashboard, Products, Enquiries, Profile, Manage
│   └── ...              # Index, About, Products, ProductDetail, Cart, Enquiry
├── store/               # Zustand stores (cartStore)
└── test/                # Test setup & specs
```

### Architecture Highlights
- ✅ Proper folder structure with separation of concerns
- ✅ Semantic design tokens (HSL-based theming in `index.css`)
- ✅ Reusable UI component library (shadcn/ui)
- ✅ Input validation with Zod schemas
- ✅ Error handling & loading states
- ✅ Responsive design (mobile-first)
- ✅ Clean luxury UI theme with custom fonts

---

## 🧪 Advanced Features

- ✅ Role-based access control (Super Admin / Admin / Manager)
- ✅ Persistent cart state across sessions
- ✅ 3D hover effects & micro-animations on About page
- ✅ Lazy-loaded images for performance
- ✅ Semantic HTML structure
- ✅ SEO-friendly meta tags & structure

---

## 📈 Performance

- ✅ Optimized images (WebP format)
- ✅ Lazy loading on product images
- ✅ Code splitting via React Router
- ✅ Minimal bundle with tree-shaking (Vite)
- ✅ CSS utility-first approach (Tailwind — no unused CSS)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ & npm (or Bun)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Admin Login (Demo)

| Field    | Value                    |
| -------- | ------------------------ |
| Email    | superadmin@babulal.com   |
| Password | superAdmin123            |

---

## 📦 Deliverables

- ✅ Live deployed link — 
- ✅ GitHub repository with full source code
- ✅ README with setup instructions
- ✅ Component-based architecture documentation (this file)

---

## 🗂️ Database Schema (Mock Data)

### Product
```typescript
{
  id: string
  name: string
  category: 'Necklaces' | 'Rings' | 'Earrings' | 'Bangles' | 'Bracelets'
  price?: number
  priceOnRequest: boolean
  description: string
  details: string[]
  images: string[]
  featured: boolean
  views: number
  createdAt: string
}
```

### Enquiry
```typescript
{
  id: string
  name: string
  email: string
  phone: string
  message: string
  productId?: string
  productName?: string
  status: 'new' | 'read' | 'replied'
  createdAt: string
}
```

### CartItem
```typescript
{
  product: Product
  quantity: number
}
```

---

## 📄 License

This project is proprietary to **Babulal Jewellers**.

---


