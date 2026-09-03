<div align="center">

# 💰 FINORA
### Understand your money. Build your future.

**Production-Quality Full-Stack Personal Finance Intelligence & Wealth Management Platform**

[![React](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_+_Express_+_TypeScript-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16_+_Prisma_ORM-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Deploy-Docker_&_Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 🌟 Overview

**FINORA** transforms personal finance management into a polished, SaaS-grade platform. Designed with **Charcoal & Orange** aesthetics, FINORA provides real-time transaction tracking, automated budget caps with visual alert thresholds, savings milestone trajectories, scheduled subscription processing, granular reports (CSV/JSON/PDF), and a deterministic, data-backed **AI Financial Assistant**.

Built with a strict **layered service architecture**, robust **Prisma ORM**, PostgreSQL decimal precision math, and **JWT-based user data isolation**, FINORA delivers institutional-grade security and developer ergonomics.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    User["Client Browser / Mobile PWA"]
    
    subgraph Frontend ["Frontend Layer (React 19 + Vite + Tailwind v4)"]
        Router["React Router v7"]
        State["Context (Auth, Preferences, Toast)"]
        UI["UI Components (Charts, Tables, Skeletons, Drawers)"]
        ApiClient["Axios Interceptor Layer (Bearer JWT)"]
        Router --> UI
        State --> UI
        UI --> ApiClient
    end

    subgraph Backend ["Backend Layer (Express + TypeScript)"]
        Security["Security Middleware (Helmet, CORS, RateLimit)"]
        AuthMid["JWT Authentication & User Context"]
        Validation["Zod Request Validator"]
        Controllers["Domain Controllers (Transactions, Budgets, Goals...)"]
        Services["Business Logic & Financial Intelligence Engine"]
        Swagger["OpenAPI / Swagger UI Docs (/api/docs)"]
        
        Security --> AuthMid
        AuthMid --> Validation
        Validation --> Controllers
        Controllers --> Services
    end

    subgraph Database ["Persistence Layer (PostgreSQL 16)"]
        ORM["Prisma Client (Decimal.js Precision)"]
        Postgres[("PostgreSQL Database (ACID, Relations, Indexes)")]
        Services --> ORM
        ORM --> Postgres
    end

    User -->|HTTPS Requests| Frontend
    ApiClient -->|REST API v1| Security
```

---

## ✨ Key Capabilities & Features

### 1. 📊 Financial Overview & Health Scoring
- **Real-Time KPIs**: Total Net Balance, Monthly Income, Monthly Expenses, Net Surplus, and Savings Rate with Month-over-Month (MoM) percentage shifts.
- **Financial Health Rating (0–100)**: Transparent algorithmic score assessing Savings Rate (30 pts), Budget Adherence (25 pts), Recurring Burden (20 pts), and Goal Trajectory (25 pts).
- **Interactive Cash Flow Curve**: Dynamic area chart with multi-timeframe toggles (`7D`, `30D`, `3M`, `6M`, `1Y`).
- **Category Spending Doughnut**: "Where your money goes" with real-time percentage allocation.

### 2. 💸 Advanced Transactions Management
- **Multi-Parametric Filtering**: Search by description/notes, filter by type (Income/Expense), category, linked account, date range, and amount brackets.
- **Server-Side Pagination & Sorting**: Fast querying with date, amount, or name order.
- **Detail Slide-Over Drawer**: Inspect full audit timestamps, category metadata, payment methods, and notes.
- **Direct Data Exports**: Export active table results to CSV and JSON formats with a single click.

### 3. 🎯 Budgets & Warning Thresholds
- **Dynamic Utilization Tracking**: Real-time aggregation of expenses against category caps.
- **Visual Alert States**:
  - 🟢 **Normal** (`< 80%` utilized)
  - 🟡 **Near Limit / Warning** (`80% – 99%` utilized)
  - 🔴 **Exceeded** (`>= 100%` utilized with overspent calculation)
- **Automatic Budget Notifications**: Proactive system alerts when thresholds are crossed.

### 4. 🏆 Savings Goals & Contributions
- **Milestone Tracking**: Emergency Funds, Gadgets, Travel, Vehicles, Real Estate.
- **Quick Contribution Modal**: Add savings funds with optional automated deduction from liquid bank/wallet accounts.
- **Deadline Countdown**: Tracks days remaining and percentage achieved.

### 5. 💳 Multi-Account & Net Worth Management
- Support for **Bank Accounts**, **Savings Reserves**, **Investment / Demat Portfolios**, **Digital Wallets**, and **Credit Lines**.
- Automatic net worth calculation (Assets minus Credit Liabilities).

### 6. 🔄 Recurring Payments & Subscription Scheduler
- Track recurring outflows (Rent, Netflix, Spotify, Broadband, Gym, Salary credits).
- Frequency cycles: `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`.
- **Automated Due Processing**: Background scheduler creates corresponding transactions and advances execution dates when due.

### 7. 📈 Analytics & Heatmap Intelligence
- **6-Month Comparative Inflow vs Outflow Bar Chart**.
- **Day-of-Week Spending Heatmap**: Pinpoint weekend vs weekday peak outflow days.
- **Rule-Based Insights**: Algorithmic advice identifying top expense categories, potential savings from a 15% reduction, and habit checks.

### 8. 📄 Consolidated Financial Reports
- Generate printable and downloadable financial statements for `This Month`, `Last Month`, `3 Months`, and `This Year`.
- Consolidated category breakdown, budget adherence, and goals summary.
- Export as CSV, JSON, or invoke native print/PDF engine.

### 9. 🤖 FINORA AI Financial Assistant
- Interactive chat interface grounded in the user's live database figures.
- Deterministic, data-backed responses answering:
  - *"Where did I spend the most this month?"*
  - *"Am I staying within my budget?"*
  - *"How can I reduce my expenses?"*
  - *"What are my biggest recurring expenses?"*

### 10. ⚡ Universal Search & Accessibility
- **Global Search Modal (`⌘K` / `Ctrl+K`)**: Rapid search across transactions, accounts, budgets, goals, and recurring items.
- **Currency Switcher**: Seamless live formatting for **INR (`₹2,48,520`)**, **USD (`$`)**, **EUR (`€`)**, and **GBP (`£`)**.
- **Themes**: High-contrast Charcoal Dark mode (`#111111`) and Warm Off-White Light mode (`#F7F5F2`).
- **Responsive Layout**: Native mobile drawer, bottom actions, tabular numbers, and accessible ARIA attributes.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons | High-performance SPA with modern UI/UX |
| **Charts** | Chart.js 4, React-ChartJS-2 | Interactive line, doughnut, and bar visualizers |
| **Routing** | React Router v7 | Protected client routes and authenticated session layouts |
| **Backend** | Node.js 20, Express, TypeScript | Type-safe REST API server with layered services |
| **Database** | PostgreSQL 16, Prisma ORM | Relational schema with Decimal precision currency math |
| **Validation** | Zod | Strict schema validation for all endpoints and inputs |
| **Security** | JWT, BcryptJS, Helmet, CORS, Rate-Limit | Strict user data isolation and security headers |
| **API Docs** | Swagger UI, OpenAPI 3.0 | Interactive documentation at `/api/docs` |
| **Testing** | Jest, Supertest, TS-Jest | Automated test suites for auth, ownership, and utilities |
| **Containers** | Docker, Docker Compose | Production multi-container deployment orchestration |

---

## 🚀 Quickstart & Setup Guide

### Option 1: Run with Docker Compose (Recommended)

Make sure you have Docker and Docker Compose installed:

```bash
# 1. Clone repository
git clone https://github.com/arpitat09/finance-dashboard.git
cd finance-dashboard

# 2. Start PostgreSQL, Backend API, and Frontend with Docker Compose
docker-compose up --build
```

The application will be live at:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/api/docs`

---

### Option 2: Local Manual Setup

#### Prerequisites
- Node.js `>= 20.0.0`
- PostgreSQL 14+ running locally (or via Docker)

#### 1. Backend Setup
```bash
cd backend

# Copy environment file
cp .env.example .env

# Configure your PostgreSQL connection string in .env:
# DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/finora_db?schema=public"

# Install dependencies
npm install

# Generate Prisma Client & Run Migrations
npx prisma migrate dev --name init

# Seed Realistic Demo Data (Transactions, Budgets, Goals, Accounts)
npm run prisma:seed

# Start backend dev server
npm run dev
```

#### 2. Frontend Setup
```bash
cd ../frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔑 Demo Account Credentials

For instant exploration, click **"Explore Demo Account (Instant Login)"** on the login screen or use:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin Demo** | `demo@finora.app` | `Demo@12345` |
| **Secondary User** | `alice@finora.app` | `Alice@12345` |

---

## 📡 REST API Reference

Interactive OpenAPI documentation is hosted at:  
👉 **`http://localhost:5000/api/docs`**

### Summary of REST Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register new user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Yes |
| `PATCH` | `/api/v1/auth/profile` | Update user name/avatar/currency | Yes |
| `POST` | `/api/v1/auth/change-password` | Update account password | Yes |
| `GET` | `/api/v1/transactions` | Filter, search, and paginate transactions | Yes |
| `POST` | `/api/v1/transactions` | Record new transaction (updates account balance) | Yes |
| `GET` | `/api/v1/transactions/:id` | Get transaction details by ID | Yes |
| `PUT` | `/api/v1/transactions/:id` | Update transaction record | Yes |
| `DELETE` | `/api/v1/transactions/:id` | Delete transaction record | Yes |
| `GET` | `/api/v1/budgets` | List budgets with spent metrics & alerts | Yes |
| `POST` | `/api/v1/budgets` | Create category budget cap | Yes |
| `PUT` | `/api/v1/budgets/:id` | Update budget cap | Yes |
| `DELETE` | `/api/v1/budgets/:id` | Delete budget cap | Yes |
| `GET` | `/api/v1/goals` | List savings goals & progress metrics | Yes |
| `POST` | `/api/v1/goals` | Create savings goal | Yes |
| `POST` | `/api/v1/goals/:id/contribute` | Add funds towards savings goal | Yes |
| `GET` | `/api/v1/accounts` | List financial accounts & total net worth | Yes |
| `POST` | `/api/v1/accounts` | Create bank, wallet, or investment account | Yes |
| `GET` | `/api/v1/recurring` | List recurring subscriptions & next dates | Yes |
| `POST` | `/api/v1/recurring` | Schedule new recurring payment | Yes |
| `POST` | `/api/v1/recurring/process-due`| Process due recurring subscriptions | Yes |
| `GET` | `/api/v1/dashboard/summary` | Summary KPIs and MoM comparisons | Yes |
| `GET` | `/api/v1/dashboard/cash-flow` | Cash flow trend series (7D, 30D, 3M, 6M, 1Y) | Yes |
| `GET` | `/api/v1/dashboard/category-breakdown` | Category spending distributions | Yes |
| `GET` | `/api/v1/dashboard/health-score` | Financial Health Score calculation (0-100) | Yes |
| `GET` | `/api/v1/dashboard/insights` | Algorithmic financial intelligence cards | Yes |
| `GET` | `/api/v1/analytics/overview` | 6-month trends and day-of-week heatmap | Yes |
| `POST` | `/api/v1/assistant/ask` | Query FINORA AI Assistant with data context | Yes |
| `GET` | `/api/v1/notifications` | List user alerts and unread counters | Yes |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark alert as read | Yes |
| `GET` | `/api/v1/exports/transactions/csv` | Download transactions CSV | Yes |
| `GET` | `/api/v1/exports/backup/json` | Download complete JSON backup | Yes |
| `GET` | `/api/v1/exports/report` | Generate structured financial statement | Yes |

---

## 🧪 Automated Testing

The project includes unit, validation, and integration tests built with **Jest** and **Supertest**:

```bash
# Run backend test suite
cd backend
npm test

# Run tests in watch mode
npm run test:watch
```

Test coverage includes:
- **Authentication**: Registration validation, duplicate prevention, credential checks.
- **Critical Security**: Strict user ownership isolation (User A cannot access, modify, or delete User B's transactions or budgets).
- **Precision Math**: Float error prevention using `Decimal.js`.
- **Validation**: Zod schema boundary testing.

---

## 🔒 Security & Privacy Practices

- **Strict User Isolation**: Every database query scopes `userId` from the verified JWT token to prevent unauthorized horizontal escalation.
- **Cryptographic Security**: Passwords hashed with Bcrypt using 12 salt rounds.
- **Attack Surface Mitigation**: Protected with Helmet security headers, CORS origin restrictions, and IP rate limiting on auth endpoints.
- **SQL Injection Immune**: All database queries parameterized through Prisma ORM.

---

## 👩‍💻 Author & Acknowledgements

- **Architect & Developer**: Arpita ([@arpitat09](https://github.com/arpitat09))
- **Repository**: [https://github.com/arpitat09/finance-dashboard](https://github.com/arpitat09/finance-dashboard)

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
