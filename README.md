# The Kharagpur Wala Creator Platform (Monorepo)

Welcome to the official, enterprise-grade business and creator operations platform for **The Kharagpur Wala** (@the_kharagpur_wala_). 

This repository houses the complete, unified monorepo containing both the high-fidelity Next.js frontend console and the highly secure, transactional NestJS backend API. The platform transitions standard creator sponsorships into an institutionalized, automated, and data-backed creator operations agency.

---

## 🏗️ Technical Architecture & Stack

### Frontend (User Interface & Session Security)
* **Framework:** Next.js 16 (App Router) with Turbopack compilation.
* **Styling:** Custom Vanilla CSS for premium dark-theme glassmorphism and animated responsive grids.
* **Security Layer:** Server-side **Backend-for-Frontend (BFF)** proxy routers shielding core API ports, secure `httpOnly` rotated refresh token cookies (Secure, Lax, SameSite), and automatic silent refresh managers.
* **Hosting:** Vercel Production Deployment.

### Backend (Business Logic & Persistence)
* **Framework:** NestJS (Node.js) structured across clean modular boundaries.
* **Database & ORM:** PostgreSQL 16 database managed via Prisma ORM with atomic transaction playbacks.
* **Caching & Sessions:** Redis Cache service handling high-performance temporary memory blocks.
* **Communications:** Asynchronous global event emitters triggering Resend Email API gateways and Telegram bot mobile notifications.
* **Hosting:** Railway Cloud Deployments.

---

## 📂 Project Directory Structure

```
thekharagpurcool-website/ (Monorepo Root)
├── .gitignore                          # Consolidated monorepo exclusions (ignores node_modules, cache, dist, .env)
├── README.md                           # This comprehensive architectural blueprint
├── backend/                            # NestJS Backend API Project
│   ├── prisma/                         # Database Schema (schema.prisma) & Idempotent seed script
│   ├── src/                            # Modular NestJS source files (auth, campaigns, inquiries, etc.)
│   ├── change_superadmin.js            # Secure production superadmin credentials update utility
│   ├── package.json                    # Backend scripts & dependency lock
│   └── tsconfig.json                   # TypeScript compiling parameters
└── Premium Digital Agency Website 2/   # Next.js Frontend Web App
    ├── src/app/                        # Next.js App router pages, contexts, & server-side BFF proxy handlers
    ├── src/styles/                     # Theme variables, custom fonts, and webkit-autofill override stylesheets
    ├── package.json                    # Frontend scripts & dependencies
    └── tsconfig.json                   # TS compiler settings
```

---

## ⚙️ Local Development Setup

To run the complete platform locally on your machine, follow these steps sequentially:

### Prerequisite Services
Ensure you have **Node.js (v20+)**, **PostgreSQL**, and **Redis** running locally, or execute them via Docker Compose.

---

### 1. Backend Setup (`/backend`)

1. **Navigate and Install:**
   ```bash
   cd backend
   npm install
   ```
2. **Environment Configuration:**
   Create a `.env` file inside `backend/` and configure your credentials:
   ```bash
   PORT=3001
   APP_ENV=development
   DATABASE_URL="postgresql://your_user:your_password@localhost:5432/tgw_db?schema=public"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-super-secure-jwt-secret-key"
   JWT_REFRESH_SECRET="your-super-secure-jwt-refresh-secret-key"
   JWT_ACCESS_EXPIRY="15m"
   JWT_REFRESH_EXPIRY="30d"
   TOKEN_ENCRYPTION_KEY="32_character_master_key_for_aes"
   RESEND_API_KEY="re_your_resend_api_key_here"
   ENABLE_REAL_EMAILS="false"
   FRONTEND_ORIGIN="http://localhost:3000"
   ```
3. **Synchronize Schema & Generate Client:**
   ```bash
   npx prisma db push
   ```
4. **Seed the Database:**
   ```bash
   npm run db:seed
   ```
5. **Start Dev Server:**
   ```bash
   npm run start:dev
   ```
   The backend will boot live at `http://localhost:3001/api/v1` with Swagger docs at `http://localhost:3001/api/docs`.

---

### 2. Frontend Setup (`/Premium Digital Agency Website 2`)

1. **Navigate and Install:**
   ```bash
   cd "../Premium Digital Agency Website 2"
   npm install
   ```
2. **Environment Configuration:**
   Create a `.env.local` file inside the frontend root:
   ```bash
   BACKEND_API_URL=http://localhost:3001/api/v1
   NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api/v1
   ```
3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The frontend will boot live at `http://localhost:3000`.

---

## 🚀 Production Cloud Deployments

### 1. Backend Deployment (Railway)
1. **Link Project:**
   ```bash
   cd backend
   railway link -p <your_railway_project_id>
   ```
2. **Add Services:**
   * Add PostgreSQL: `railway add --database postgres`
   * Add Redis: `railway add --database redis`
3. **Upload Code:**
   ```bash
   railway up
   ```
4. **Set Variables:**
   Set all env variables in the Railway dashboard or via CLI. Securely map `DATABASE_URL` and `REDIS_URL` to reference the active Postgres/Redis services.
5. **Sync Database:**
   ```bash
   DATABASE_URL="<your_postgres_public_url>" npx prisma db push
   DATABASE_URL="<your_postgres_public_url>" npm run db:seed
   ```

### 2. Frontend Deployment (Vercel)
1. **Register Variables:**
   Add backend production API endpoints in your Vercel project Settings:
   * `BACKEND_API_URL` = `https://<your_backend_domain>.up.railway.app/api/v1`
   * `NEXT_PUBLIC_BACKEND_API_URL` = `https://<your_backend_domain>.up.railway.app/api/v1`
2. **Trigger Build:**
   ```bash
   cd "Premium Digital Agency Website 2"
   vercel --prod
   ```

---

## 🔒 Security & Resiliency Safeguards

* **ACID Transactions:** Core conversions and onboarding updates execute inside strict database transactions, preventing corrupt half-written records.
* **Bcrypt Password hashing:** User passwords are encrypted on the server utilizing `bcrypt` (12 secure work factor rounds).
* **BFF Token Shields:** Raw JWT refresh tokens are never exposed to the client browser, staying protected in secure HTTP-only cookies.
* **Autofill Dark CSS Overrides:** Custom webkit-autofill override rules force autofilled textboxes to match dark themes, resolving the browser yellow/white rendering bug.

---

## 🛣️ Upcoming Product Roadmap

1. **Phase 8: Meta OAuth & Instagram Insights Sync:** Secure AES-256-GCM encrypted long-lived tokens at the `Organization` level, serving cached insights from hourly sync daemons.
2. **Phase 9: Closed-Loop Client Testimonials:** Automated, verified feedback queries triggered upon campaign completion and subject to admin moderation gates before posting to the home slider.
3. **Phase 10: One-Click Campaign PDF Generator:** Institutional export compiles campaigns progress, live deliverables, and reach statistics into a premium PDF presentation.
