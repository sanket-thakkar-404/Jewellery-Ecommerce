# 💎 Babulal Jewellers — Database Schema Documentation

> MongoDB + Mongoose · Document Schema Reference

---

## Table of Contents

1. [Overview](#overview)
2. [Collection Index](#collection-index)
3. [User Model](#user-model)
4. [Category Model](#category-model)
5. [Product Model](#product-model)
6. [Enquiry Model](#enquiry-model)
7. [Indexing Strategy](#indexing-strategy)
8. [Relationships Diagram](#relationships-diagram)
9. [Seed Data Examples](#seed-data-examples)

---

## Overview

| Property | Value |
|---|---|
| Database | MongoDB 7.x |
| ODM | Mongoose 8.x |
| Hosting | MongoDB Atlas (M10 for production) |
| Encoding | UTF-8 |
| Timezone | Stored as UTC, displayed in IST |

---

## Collection Index

| Collection | Description | Estimated Growth |
|---|---|---|
| `users` | Admin user accounts | Low (~10–50 records) |
| `categories` | Product categories | Low (~5–30 records) |
| `products` | Jewellery product catalog | Medium (~100–5,000 records) |
| `enquiries` | Customer enquiries | High (~500+ records/month) |

---

## User Model

**File:** `server/src/models/User.model.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'manager';
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,  // Excluded from queries by default
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager'],
      default: 'manager',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method: compare password
UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
```

### Sample Document

```json
{
  "_id": { "$oid": "64f1a2b3c4d5e6f7a8b9c0d1" },
  "name": "Super Admin",
  "email": "superadmin@babulaljewellers.com",
  "password": "$2a$12$Hashed...",
  "role": "super_admin",
  "isActive": true,
  "lastLogin": { "$date": "2024-02-15T08:00:00.000Z" },
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-02-15T08:00:00.000Z" }
}
```

---

## Category Model

**File:** `server/src/models/Category.model.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: { url: string; publicId: string };
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      maxlength: [250, 'Description cannot exceed 250 characters'],
    },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
CategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  next();
});

// Virtual: product count (populated separately)
CategorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
```

### Sample Document

```json
{
  "_id": { "$oid": "64f1a2b3c4d5e6f7a8b9c0d3" },
  "name": "Necklaces",
  "slug": "necklaces",
  "description": "Traditional and contemporary gold and diamond necklaces",
  "image": {
    "url": "https://res.cloudinary.com/babulal/image/upload/necklaces-cat.webp",
    "publicId": "babulal-jewellers/categories/necklaces-cat"
  },
  "isActive": true,
  "sortOrder": 1,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

---

## Product Model

**File:** `server/src/models/Product.model.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  images: IProductImage[];
  priceType: 'fixed' | 'on_request';
  price?: number;
  priceLabel?: string;             // e.g. "Starting from ₹20,000"
  material?: string;               // e.g. "22K Gold, Kundan"
  weight?: string;                 // e.g. "24.5g"
  purity?: string;                 // e.g. "916 BIS Hallmark"
  occasion?: string[];             // e.g. ["Wedding", "Festive"]
  tags?: string[];
  isFeatured: boolean;
  isActive: boolean;
  views: number;
  enquiryCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [200],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [ProductImageSchema],
      validate: {
        validator: (arr: IProductImage[]) => arr.length >= 1 && arr.length <= 10,
        message: 'Product must have 1 to 10 images',
      },
    },
    priceType: {
      type: String,
      enum: ['fixed', 'on_request'],
      required: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },
    priceLabel: { type: String, maxlength: 100 },
    material: { type: String, maxlength: 100 },
    weight: { type: String, maxlength: 50 },
    purity: { type: String, maxlength: 50 },
    occasion: [{ type: String }],
    tags: [{ type: String, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    enquiryCount: { type: Number, default: 0 },
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate unique slug
ProductSchema.pre('save', async function (next) {
  if (this.isModified('name')) {
    let baseSlug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let count = 1;
    while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

// Validate: price required for fixed priceType
ProductSchema.pre('validate', function (next) {
  if (this.priceType === 'fixed' && (this.price === undefined || this.price === null)) {
    this.invalidate('price', 'Price is required when priceType is fixed');
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
```

### Sample Document

```json
{
  "_id": { "$oid": "64f1a2b3c4d5e6f7a8b9c0d2" },
  "name": "22K Gold Kundan Necklace",
  "slug": "22k-gold-kundan-necklace",
  "description": "An exquisite handcrafted Kundan necklace in 22K yellow gold, featuring traditional Rajasthani craftsmanship with intricate meenakari work.",
  "shortDescription": "Handcrafted 22K Kundan Necklace with meenakari",
  "category": { "$oid": "64f1a2b3c4d5e6f7a8b9c0d3" },
  "images": [
    {
      "url": "https://res.cloudinary.com/babulal/image/upload/v1/babulal-jewellers/products/necklace.webp",
      "publicId": "babulal-jewellers/products/necklace"
    }
  ],
  "priceType": "fixed",
  "price": 45000,
  "priceLabel": null,
  "material": "22K Gold, Kundan",
  "weight": "24.5g",
  "purity": "916 BIS Hallmark",
  "occasion": ["Wedding", "Festive", "Engagement"],
  "tags": ["necklace", "kundan", "22k", "gold", "traditional"],
  "isFeatured": true,
  "isActive": true,
  "views": 342,
  "enquiryCount": 12,
  "metaTitle": "22K Gold Kundan Necklace | Babulal Jewellers",
  "metaDescription": "Shop handcrafted 22K Gold Kundan Necklace with traditional Rajasthani craftsmanship at Babulal Jewellers.",
  "createdAt": { "$date": "2024-01-15T10:30:00.000Z" },
  "updatedAt": { "$date": "2024-02-15T08:00:00.000Z" }
}
```

---

## Enquiry Model

**File:** `server/src/models/Enquiry.model.ts`

```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IEnquiry extends Document {
  name: string;
  email: string;
  phone?: string;
  message: string;
  product?: mongoose.Types.ObjectId;
  status: 'new' | 'read' | 'replied';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    phone: {
      type: String,
      match: [/^[+\d\s-]{10,15}$/, 'Invalid phone number'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// Post-save middleware: trigger email notification
EnquirySchema.post('save', async function (doc) {
  const { sendEnquiryNotification } = await import('../services/email.service');
  await sendEnquiryNotification(doc);
});

// Post-save middleware: increment product enquiryCount
EnquirySchema.post('save', async function (doc) {
  if (doc.product) {
    await mongoose.model('Product').findByIdAndUpdate(
      doc.product,
      { $inc: { enquiryCount: 1 } }
    );
  }
});

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
```

### Sample Document

```json
{
  "_id": { "$oid": "64f1a2b3c4d5e6f7a8b9c0d4" },
  "name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "phone": "+91-9876543210",
  "message": "I am interested in the 22K Gold Kundan Necklace. Can you provide more details about customization options and delivery timeline?",
  "product": { "$oid": "64f1a2b3c4d5e6f7a8b9c0d2" },
  "status": "new",
  "ipAddress": "103.22.15.41",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...",
  "createdAt": { "$date": "2024-02-15T08:45:00.000Z" },
  "updatedAt": { "$date": "2024-02-15T08:45:00.000Z" }
}
```

---

## Indexing Strategy

```typescript
// ── User Collection ──────────────────────────────────────
UserSchema.index({ email: 1 }, { unique: true });

// ── Category Collection ──────────────────────────────────
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ isActive: 1, sortOrder: 1 });

// ── Product Collection ───────────────────────────────────
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ views: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' }, {
  weights: { name: 10, tags: 5, description: 1 },
  name: 'products_text_index'
});

// ── Enquiry Collection ───────────────────────────────────
EnquirySchema.index({ status: 1, createdAt: -1 });
EnquirySchema.index({ product: 1 });
EnquirySchema.index({ email: 1 });
EnquirySchema.index({ createdAt: -1 });  // For analytics queries
```

---

## Relationships Diagram

```
┌──────────────┐         ┌──────────────┐
│    USERS     │         │  CATEGORIES  │
│              │         │              │
│ _id          │         │ _id          │
│ name         │         │ name         │
│ email        │         │ slug         │
│ role         │         │ image        │
│ isActive     │         │ isActive     │
└──────────────┘         └───────┬──────┘
                                 │ 1
                                 │
                                 │ N
                         ┌───────▼──────────────┐
                         │       PRODUCTS        │
                         │                      │
                         │ _id                  │
                         │ name                 │
                         │ slug                 │
                         │ category (ObjectId)  │──▶ Categories
                         │ images[]             │
                         │ priceType            │
                         │ price                │
                         │ views                │
                         │ enquiryCount         │
                         │ isFeatured           │
                         └──────────┬───────────┘
                                    │ 1
                                    │
                                    │ N
                         ┌──────────▼───────────┐
                         │      ENQUIRIES        │
                         │                      │
                         │ _id                  │
                         │ name                 │
                         │ email                │
                         │ product (ObjectId?)  │──▶ Products
                         │ message              │
                         │ status               │
                         └──────────────────────┘
```

---

## Seed Data Examples

### Admin User Seed

```typescript
// scripts/seed.admin.ts
import { User } from '../models/User.model';

async function seedAdmin() {
  const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('Admin already exists. Skipping seed.');
    return;
  }
  await User.create({
    name: 'Super Admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,   // Will be hashed by pre-hook
    role: 'super_admin',
  });
  console.log('✅ Admin user created.');
}
```

### Category Seed

```typescript
const defaultCategories = [
  { name: 'Necklaces', sortOrder: 1 },
  { name: 'Earrings', sortOrder: 2 },
  { name: 'Bangles', sortOrder: 3 },
  { name: 'Rings', sortOrder: 4 },
  { name: 'Pendants', sortOrder: 5 },
  { name: 'Chains', sortOrder: 6 },
  { name: 'Anklets', sortOrder: 7 },
  { name: 'Bracelets', sortOrder: 8 },
];
```

---

*Database Schema v1.0 · Babulal Jewellers Engineering*
