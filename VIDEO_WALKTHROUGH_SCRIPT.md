# RentEase – Project Explanation Video Script & Screen-Recording Guide

**Submission to:** Unified Mentor Pvt. Ltd.  
**Project:** RentEase – Furniture & Appliance Rental Platform  
**Target Duration:** 3 Minutes (Range: 2.5 – 3.5 minutes)  
**Presenter:** Aman Kumar | Web Development Intern  
**Internship ID (UNID):** UMID110726101863  
**Tenure:** July 15, 2026 – October 15, 2026 (3 Months)  

---

## 🎯 Pre-Recording Preparation Checklist

Before pressing record on OBS / Loom / Windows Game Bar (`Win + G`):

1. **Browser Tab 1:** [https://rentease-aman.vercel.app](https://rentease-aman.vercel.app) (Home Page, signed out or in Incognito so you can demonstrate Sign In smoothly).
2. **Browser Tab 2:** [https://rentease-aman.vercel.app/products?city=Bangalore](https://rentease-aman.vercel.app/products?city=Bangalore) (Catalog page filtered by city).
3. **Browser Tab 3:** [https://rentease-aman.vercel.app/admin](https://rentease-aman.vercel.app/admin) (Logged in as `admin@rentease.com`).
4. **Browser Tab 4:** GitHub Repository [https://github.com/amanshukl/Rentease](https://github.com/amanshukl/Rentease).
5. **VS Code Editor:** Opened to `rentease/` with 3 files pinned in tabs:
   - `models/Product.ts` or `models/Order.ts`
   - `app/api/orders/route.ts`
   - `lib/db.ts`
6. **Test Accounts Ready:**
   - **Customer:** `user@rentease.com` / `user123`
   - **Admin:** `admin@rentease.com` / `admin123`

---

## ⏱️ Video Walkthrough & Voiceover Script (0:00 – 3:30)

```
========================================================================================
PART 1: INTRODUCTION & PROBLEM STATEMENT (0:00 – 0:30 | ~30s)
========================================================================================
```

| Time | What to Show on Screen | What to Say (Spoken Dialogue) |
|:---|:---|:---|
| **0:00 – 0:15** | • Fullscreen webcam OR screen showing **RentEase Landing Page** (`https://rentease-aman.vercel.app`) with title clearly visible.<br>• Mouse resting on the RentEase logo. | "Hello respected mentors and the evaluation team at Unified Mentor. My name is **Aman Kumar**, and I have completed my 3-month Web Development Internship under Internship ID **UMID110726101863** from July to October 2026.<br><br>Today, I am proud to present my capstone project: **RentEase – a full-stack Furniture and Appliance Rental Platform**." |
| **0:15 – 0:30** | • Slowly scroll down the hero section showcasing the "Furniture" and "Appliances" category cards and live city selector. | "Every year, millions of students and professionals relocate to major Indian tech hubs like Bangalore, Mumbai, and Delhi. Buying brand-new furniture or hauling heavy appliances between cities costs up to ₹2 lakhs upfront, causes moving damage, and leads to resale losses.<br><br>RentEase eliminates this friction by offering flexible 3, 6, and 12-month rentals with zero maintenance worries and doorstep delivery." |

```
========================================================================================
PART 2: LIVE DEPLOYED PROJECT DEMO (0:30 – 2:00 | ~90s)
========================================================================================
```

| Time | What to Show on Screen | What to Say (Spoken Dialogue) |
|:---|:---|:---|
| **0:30 – 0:50** | **Step 1: Catalog & Multi-City Filtering**<br>• Click on **"Furniture"** or **"Explore Products"** (`/products`).<br>• Click **"Bangalore"** then **"Mumbai"** in the Service City sidebar.<br>• Click on a product card, e.g., **"King Size Bed with Premium Mattress"**. | "Here on our live production platform hosted on Vercel, users can browse curated catalogs for Furniture and Appliances. Notice the multi-city filter in the sidebar — users can instantly filter available inventory across Bangalore, Mumbai, Delhi, Hyderabad, Pune, and Chennai." |
| **0:50 – 1:15** | **Step 2: Tenure Discounts & Cart**<br>• On the Product Detail page, click between **3 Months**, **6 Months (10% OFF)**, and **12 Months (20% OFF)**.<br>• Show monthly price recalculating live (e.g. ₹1,299 → ₹1,169 → ₹1,039).<br>• Click **"Add to Cart"** → Toast notification pops up.<br>• Click the **Cart icon** in Navbar to open `/cart`. | "On the product detail view, we have an interactive tenure selector. Choosing 6 months applies an automatic 10% discount, and 12 months grants 20% savings. Once added to the cart, the entire state persists across sessions in localStorage, showing a transparent breakdown of the monthly rent and refundable security deposit." |
| **1:15 – 1:35** | **Step 3: Address Validation & Checkout**<br>• On the Cart page, show the address form.<br>• Enter street address (min 10 chars), city, state, and 6-digit postal code (`560001`).<br>• Click **"Place Rental Order"**.<br>• Redirects to **Dashboard** (`/dashboard`) showing the new order in 'Pending' or 'Active'. | "During checkout, strict client and server validation checks ensure genuine delivery addresses with a minimum 10-character street address and a 6-digit Indian postal code regex. Placing the order atomically decrements the available warehouse stock in our database." |
| **1:35 – 2:00** | **Step 4: Active Rentals, Extension & Admin KPIs**<br>• In Customer Dashboard, open the order (`/dashboard/orders/[id]`).<br>• Show the **"Extend Tenure"** dropdown (+3 / +6 mo) with extension audit logs.<br>• Switch to the **Admin Dashboard** tab (`/admin`).<br>• Point cursor to the live KPI cards: **Monthly Recurring Revenue (MRR)**, **Utilization Rate**, **Retention Rate**, and **Revenue by City**. | "In the customer dashboard, tenants can manage active subscriptions, request early returns, or extend their lease by +3, +6, or +12 months with full audit logging. Customers can also raise maintenance support tickets.<br><br>Switching to the Admin Portal, operations managers get real-time executive analytics: live Monthly Recurring Revenue, product utilization rates, customer retention, and city-by-city revenue distribution." |

```
========================================================================================
PART 3: TECH STACK, ARCHITECTURE & CODE WALKTHROUGH (2:00 – 3:00 | ~60s)
========================================================================================
```

| Time | What to Show on Screen | What to Say (Spoken Dialogue) |
|:---|:---|:---|
| **2:00 – 2:20** | • Switch window to **VS Code**.<br>• Highlight folder tree: `app/`, `components/`, `lib/`, `models/`.<br>• Open **`lib/db.ts`**. | "Now let's examine the technical architecture in VS Code. The platform is built using the **Next.js 14 App Router** with **React 18** and **TypeScript**.<br><br>Here in `lib/db.ts`, you can see our serverless database connection caching. Because Vercel functions are stateless and spin up dynamically, we maintain a global cached Mongoose instance with a small connection pool of 5. This prevents connection saturation on MongoDB Atlas's free M0 tier." |
| **2:20 – 2:40** | • Open **`models/Order.ts`** and **`models/Product.ts`** side by side. | "For our database layer, we designed 4 structured Mongoose models: `User`, `Product`, `Order`, and `Ticket`. Notice how `Product` indexes both `category` and `city` for sub-50ms query speeds, while `Order` stores denormalized item snapshots along with an `extensionLogs` array to track historical lease modifications." |
| **2:40 – 3:00** | • Open **`app/api/orders/route.ts`**.<br>• Scroll to lines 128–176 where stock check and atomic `$inc` occur. | "In our backend REST API routes, security and transactional consistency are top priorities. In `app/api/orders/route.ts`, the order creation route uses NextAuth session verification, validates inventory before charging, and performs atomic `$inc` operations to decrement `availableStock`. When an order completes or is cancelled, inventory is automatically restored." |

```
========================================================================================
PART 4: CHALLENGES, KEY LEARNINGS & CONCLUSION (3:00 – 3:30 | ~30s)
========================================================================================
```

| Time | What to Show on Screen | What to Say (Spoken Dialogue) |
|:---|:---|:---|
| **3:00 – 3:15** | • Switch back to the browser showing the **GitHub Repository** (`https://github.com/amanshukl/Rentease`) with clean commit history, README, and `PROJECT_REPORT.pdf`. | "One major engineering challenge we solved during deployment was handling dynamic serverless cloud IP pools and resolving legacy secret reference collisions in Vercel. We fixed the configuration, configured clean environment variables, and built an automated mock fallback layer so the application achieves 100% uptime with graceful degradation." |
| **3:15 – 3:30** | • Switch to the live website home page (`https://rentease-aman.vercel.app`).<br>• Show live site footer with copyright & contact info.<br>• Give a closing smile/wave to the camera. | "This 3-month internship at Unified Mentor taught me how to take an idea from system design and schema modeling all the way to a zero-cost, high-performance production deployment.<br><br>Thank you so much to my mentors at Unified Mentor Pvt. Ltd. For their guidance throughout this journey. I look forward to your evaluation!" |

---

## 💡 Quick Tips for High Marks on Your Video

1. **Audio Quality:** Use earphones or a dedicated mic to eliminate room echo.
2. **Resolution:** Record in 1080p (Full HD) at 100% or 110% browser zoom so text and buttons are clearly readable.
3. **Pacing:** Speak at a steady, conversational pace (~130 words per minute). Don't rush; follow the timing markers.
4. **Mouse Movement:** Move the cursor smoothly to guide the evaluator's eyes to the exact feature you are describing.
5. **No Long Pauses:** Keep all tabs and code files pre-opened so transitions between browser and VS Code take less than 1 second.
