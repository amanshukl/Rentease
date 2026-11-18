# RentEase – Furniture & Appliance Rental Platform

> **Zero-cost, production-ready full-stack web application** enabling students and young professionals to rent essential furniture and home appliances at affordable monthly subscriptions instead of paying high upfront costs.

Built with **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**, **MongoDB Atlas (Mongoose)**, and **NextAuth.js** — engineered to deploy completely free on Vercel / Netlify + MongoDB Atlas M0.

---

## Key Features

- **Responsive Multi-City Catalog**: Browse curated Furniture (Beds, Sofas, Tables, Desks, Chairs, Wardrobes, Bookshelves) and Appliances (Refrigerators, Washing Machines, Smart TVs, ACs, Microwaves, Water Purifiers, Geysers) with full-text search, category/subcategory filters, condition filters, **service city filtering** (`Bangalore`, `Mumbai`, `Delhi`, `Hyderabad`, `Pune`, `Chennai`), sorting, and pagination.
- **Flexible Rental Tenures & Dynamic Pricing**: Product detail pages with multi-angle image galleries, transparent security deposits, and 3-, 6-, and 12-month tenure selectors with automatic discounts (10% off on 6 months, 20% off on 12 months).
- **Cart & Validated Checkout**: Persistent shopping cart with live quantity/tenure updates, client- and server-side delivery address validation (street length & 6-digit Indian pincode verification), and automatic inventory reservation.
- **Customer Dashboard & Rental Lifecycle**: Track active, pending, and completed orders; **extend active rental tenures** (+3/+6/+12 months) with audit history; schedule returns/pickups; and raise maintenance/support tickets.
- **Role-Based Access Control (RBAC)**: Secure JWT session authentication supporting `user`, `vendor`, and `admin` roles with `bcryptjs` password hashing.
- **Admin & Vendor Dashboard**:
  - Full inventory CRUD with multi-image URL & local file upload preview + service city assignment.
  - Order lifecycle management with automatic stock restoration on completion/cancellation.
  - Maintenance & support ticket triage with status transitions and admin notes.
  - **Live Business KPI Analytics**: Monthly Recurring Revenue (MRR), Active Rentals, Inventory Utilization Rate, Customer Retention Rate, Average Ticket Resolution Time, and Revenue by City.
- **Offline-Resilient Fallback Layer**: Graceful fallback to rich mock catalog and analytics when MongoDB is offline or not yet seeded, plus reliable image `onError` fallbacks across every component.

---

## Tech Stack (100% Free-Tier Compatible)

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router, Serverless API Routes) |
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Lucide React, React Hot Toast |
| **Database** | MongoDB Atlas (M0 Free Tier) via Mongoose ODM |
| **Authentication** | NextAuth.js (JWT Strategy + Credentials Provider) + `bcryptjs` |
| **Hosting** | Vercel / Netlify Free Tier |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A free **MongoDB Atlas** cluster (or local MongoDB instance)

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/amanshukl/Rentease.git
cd Rentease

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set your real MONGODB_URI and NEXTAUTH_SECRET

# 4. Seed the database with sample users, products, orders, and tickets
npm run seed

# 5. Start the development server
npm run dev
```

Visit `http://localhost:3000` (or the port configured in `NEXTAUTH_URL`).

### Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Creates an optimized production build & runs TypeScript checks |
| `npm run start` | Runs the compiled production server |
| `npm run lint` | Runs Next.js ESLint checks |
| `npm run seed` | Seeds MongoDB with users, 16 multi-city products, sample orders & tickets |

---

## Environment Variables

Configure these variables in `.env` (never commit `.env` to version control):

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/rentease?retryWrites=true&w=majority` |
| `NEXTAUTH_URL` | Yes | Canonical base URL of the app | `http://localhost:3001` |
| `NEXTAUTH_SECRET` | Yes | 32+ char secret for signing JWT sessions | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | Public client-facing URL | `http://localhost:3001` |

---

## Default Seeded Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@rentease.com` | `admin123` |
| **Vendor** | `vendor@rentease.com` | `vendor123` |
| **Customer** | `user@rentease.com` | `user123` |

---

## REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register a new customer account | Public |
| `POST` | `/api/auth/[...nextauth]` | NextAuth.js sign-in, sign-out & session management | Public |
| `GET` | `/api/products` | List active products with `category`, `subcategory`, `condition`, `city`, `search`, `minPrice`, `maxPrice`, `sort`, `page`, `limit` | Public |
| `GET` | `/api/products/[id]` | Retrieve single product details by ID or slug | Public |
| `GET` | `/api/orders` | List user's orders (or all orders for admin) | Authenticated |
| `POST` | `/api/orders` | Create a new rental order, validate address & decrement stock | Authenticated |
| `GET` | `/api/orders/[id]` | Fetch single order details (owner or admin) | Authenticated |
| `PATCH` | `/api/orders/[id]` | Update status (admin), extend tenure (`action: "extend"`), or request return (`action: "return"`) | Authenticated |
| `GET` | `/api/tickets` | List user's maintenance tickets (or all for admin) | Authenticated |
| `POST` | `/api/tickets` | Submit a maintenance, return, or complaint ticket | Authenticated |
| `GET` | `/api/tickets/[id]` | Fetch single ticket details | Authenticated |
| `PATCH` | `/api/tickets/[id]` | Update ticket status and admin resolution notes | Admin |
| `GET` | `/api/admin/products` | List all products (including inactive) for inventory management | Admin |
| `POST` | `/api/admin/products` | Add a new product with auto-generated unique slug | Admin |
| `PATCH` | `/api/admin/products/[id]` | Update product pricing, stock, city, or metadata | Admin |
| `DELETE` | `/api/admin/products/[id]` | Soft-delete product (`isActive: false`) | Admin |
| `GET` | `/api/admin/analytics` | Compute live KPIs: MRR, active rentals, utilization, retention, resolution time, revenue by city | Admin |

---

## Architecture Overview

```
Browser (Next.js App Router + React 18 + Tailwind CSS)
        │
        ▼
Next.js Serverless API Routes (/app/api/*)
  ├── NextAuth.js JWT Middleware & RBAC Session Guards
  ├── Input Validation & Rental Lifecycle Business Logic
  └── Cached Mongoose Connection Pool (maxPoolSize: 5)
        │
        ▼
MongoDB Atlas (M0 Free Tier)
  ├── users     (Auth, roles: user/vendor/admin, city, cart)
  ├── products  (Catalog, pricing, stock, city, text & compound indexes)
  ├── orders    (Subscriptions, address, extensionLogs, return tracking)
  └── tickets   (Maintenance/return support, resolutionTime virtual)
```

For deep technical documentation, schema diagrams, RBAC design, rental state machines, and KPI mathematical formulas, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md).

---

## Free-Tier Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the repository on [Vercel](https://vercel.com/new).
3. Add `MONGODB_URI`, `NEXTAUTH_URL` (your Vercel URL), `NEXTAUTH_SECRET`, and `NEXT_PUBLIC_APP_URL` in **Project Settings → Environment Variables**.
4. Whitelist `0.0.0.0/0` in MongoDB Atlas **Network Access** for serverless functions.
5. Click **Deploy** — Vercel automatically builds and deploys the Next.js application at zero cost.

---

## License

MIT License. Free for personal, academic, and commercial use.
