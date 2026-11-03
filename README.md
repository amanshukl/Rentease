# RentEase – Furniture & Appliance Rental Platform

A modern, high-performance, full-stack web application designed for students and professionals to rent premium home furniture and appliances with zero heavy upfront investments.

Built with a **100% Zero-Cost Architecture** utilizing free-tier cloud infrastructure (Vercel / Netlify + MongoDB Atlas M0 Free Tier).

---

## 🚀 Key Features

### 1. 🛍️ Product Catalog & Smart Browsing
- Categorized browsing for **Furniture** (Beds, Sofas, Tables, Chairs, Bookshelves, Wardrobes) and **Appliances** (Refrigerators, Washing Machines, TVs, ACs, Microwaves, Geysers).
- Real-time search across product titles and descriptions.
- Dynamic filters: Category, Subcategory, Price Range, and Condition (New, Like New, Good).
- Flexible sorting (Price: Low to High, High to Low, Newest).

### 2. 🛋️ Product Detail & Tenure Pricing
- Interactive tenure selector (**3, 6, 12 months**) with automatic tier discounting (up to 20% savings on longer tenures).
- Transparent price breakdown: Monthly rental rate, refundable security deposit, and first-payment calculation.
- Condition badges, high-resolution product showcase, dimensional specs, and feature checkmarks.
- Related products recommendations.

### 3. 🛒 Cart & Checkout Workflow
- Real-time cart state with persistent `localStorage` synchronization.
- Tenure adjustments and quantity updates directly inside the cart.
- Complete delivery address collection (Street, City, State, PIN).
- Simulated zero-cost checkout with stock reservation and instantaneous order confirmation.

### 4. 📦 Customer Rental Management & Maintenance
- **Active Rentals:** Track ongoing subscriptions, renewal windows, and scheduled dates.
- **Return Requests:** One-click return scheduling with state transition locks.
- **Order History:** Detailed order timeline from placement to fulfillment.
- **Support & Maintenance Desk:** Raise tickets specifically linked to active orders and products with categorized issues (Maintenance, Return, Complaint).

### 5. 🛡️ Vendor & Admin Management Dashboard
- **Business Intelligence Analytics:** Live metrics for Total Active Rentals, Monthly Recurring Revenue (MRR), Open Support Tickets, Product counts, and Recent Orders.
- **Inventory Control:** Add, edit, and deactivate inventory with automated slug generation and stock thresholds.
- **Order Pipeline:** Manage order lifecycle states (`pending` → `active` → `completed` / `cancelled`).
- **Ticket Resolution:** Inspect customer support requests, assign priority states, and reply with admin resolution notes.

---

## 🛠️ Zero-Cost Technology Stack

| Layer | Technology | Free Tier Provider |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) + React 18 | [Vercel](https://vercel.com) (Hobby Plan) |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | Open-Source MIT |
| **Backend & API** | Next.js Serverless Route Handlers | Vercel Edge / Serverless Functions |
| **Database** | MongoDB + Mongoose with connection pooling | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (M0 Free Cluster - 512MB) |
| **Authentication** | NextAuth.js (Auth.js) Credentials + JWT Sessions | Open-Source MIT |
| **Notifications** | React Hot Toast | Open-Source MIT |

---

## 📋 Getting Started Locally

### 1. Prerequisites
- **Node.js** v18.17.0+ installed
- A free **MongoDB Atlas** account (or local MongoDB instance)

### 2. Clone and Install
```bash
git clone <repository-url>
cd rentease
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root (see `.env.example`):
```env
# MongoDB Atlas Free Shared Tier (M0) Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/rentease?retryWrites=true&w=majority

# NextAuth.js Secret & Base URL
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-32-byte-secret-key-here

# Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Tip:** You can generate a random secret for `NEXTAUTH_SECRET` by running:
> ```bash
> openssl rand -base64 32
> ```

### 4. Seed the Database with Sample Data
Run the built-in database seed script to populate sample furniture, appliances, demo users, orders, and tickets:
```bash
npm run seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Accounts

Use these pre-configured credentials created by the seed script:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@rentease.com` | `admin123` | Full access to `/admin` dashboard, inventory, orders, and tickets |
| **Customer** | `user@rentease.com` | `user123` | Access to `/dashboard`, active rentals, cart, and support tickets |

---

## ☁️ Free Tier Deployment Guide

### Deploying on Vercel (Recommended, 100% Free)

1. **Push your code to GitHub / GitLab**.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Set the **Framework Preset** to **Next.js**.
5. Add the following **Environment Variables**:
   - `MONGODB_URI`: Your MongoDB Atlas cluster connection string.
   - `NEXTAUTH_URL`: Your Vercel production domain (e.g. `https://your-app.vercel.app`).
   - `NEXTAUTH_SECRET`: A 32-character secure secret string.
6. Click **Deploy**. Vercel will build and launch your application globally on its high-speed Edge CDN.

### Setting Up Free MongoDB Atlas (M0 Tier)
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project and select **Create a Deployment** -> **M0 (Free Shared Tier)**.
3. Under **Security > Database Access**, add a database user with Read/Write privileges.
4. Under **Security > Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so serverless lambdas can connect seamlessly.
5. In your cluster dashboard, click **Connect > Drivers > Node.js** to copy your connection URI string into `MONGODB_URI`.

---

## 📂 Project Structure

```
rentease/
├── app/
│   ├── admin/               # Admin management portal
│   │   ├── orders/          # Order pipeline management
│   │   ├── products/        # Inventory control & creation
│   │   └── tickets/         # Customer support center
│   ├── api/                 # Serverless API endpoints
│   │   ├── admin/           # Admin-only analytics & inventory APIs
│   │   ├── auth/            # NextAuth credential handlers & registration
│   │   ├── orders/          # Order placement, status, and return requests
│   │   ├── products/        # Catalog querying, filtering, search
│   │   └── tickets/         # Maintenance ticket workflows
│   ├── auth/                # Sign In & Sign Up interfaces
│   ├── cart/                # Cart summary & checkout workflow
│   ├── dashboard/           # User dashboard (active subscriptions, tickets)
│   ├── products/            # Catalog browsing & product detail views
│   ├── globals.css          # Tailwind CSS custom component tokens
│   ├── layout.tsx           # Global app layout with providers
│   └── page.tsx             # High-conversion landing page
├── components/              # Modular UI components (Navbar, Footer, Cards, Sidebar)
├── context/                 # AuthProvider & CartContext
├── lib/
│   ├── auth.ts              # NextAuth configuration & credentials provider
│   ├── db.ts                # Serverless-cached Mongoose connection pool
│   └── utils.ts             # Currency, date, and tenure discount calculation helpers
├── models/                  # Mongoose schemas (User, Product, Order, Ticket)
├── public/                  # Static assets & SVG icons
├── scripts/
│   └── seed.ts              # Database seeding script
├── vercel.json              # Vercel serverless deployment specification
└── render.yaml              # Alternative Render.com free deployment spec
```

---

## 🔒 Security & Reliability Design

- **Serverless Connection Caching:** Global connection pooling in `lib/db.ts` prevents connection exhaustion on MongoDB Atlas M0 free tier across serverless invocations.
- **Password Hashing:** Salted bcrypt hashing (12 rounds) on all credential operations.
- **Role-Based Authorization:** Server-level and route-level token validation ensuring admin surfaces are strictly restricted to admin roles.
- **Stock Guarding:** Atomic stock updates and verification before order finalization to avoid overselling.
