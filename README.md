# BCCL Inventory Management System

A full-stack inventory management application for mining and industrial operations. Built with **React + Vite** (frontend), **Express + TypeScript** (backend), and **Supabase** (PostgreSQL database).

Original UI design: [Figma — Inventory Management System Design](https://www.figma.com/design/zmWxPeie1sHXIcJpCWBX0U/Inventory-Management-System-Design)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 6, React Router 7, Tailwind CSS 4, Recharts, Radix UI |
| Backend | Node.js, Express 4, TypeScript |
| Database | Supabase (PostgreSQL) |
| Package manager | pnpm (workspace monorepo) |

---

## Project Structure

```
├── src/                    # React frontend
│   └── app/
│       ├── components/     # Pages and UI
│       ├── lib/            # API client (appData.ts, auth.ts)
│       └── data/           # Local mock fallback data
├── backend/
│   ├── src/
│   │   ├── server.ts       # Express API routes
│   │   ├── data/           # Repository + in-memory fallback
│   │   └── lib/            # Supabase client
│   └── supabase/
│       └── schema.sql      # Database schema + seed data
├── dist/                   # Frontend production build
└── DEPLOYMENT.md           # Deployment guide
```

---

## Quick Start (Local)

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Install

```bash
pnpm install
```

### Environment

Copy the example env files and fill in your values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

| File | Variables |
|------|-----------|
| `.env` | `VITE_API_BASE_URL=http://localhost:4000` |
| `backend/.env` | `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |

### Run

**Terminal 1 — Backend:**
```bash
pnpm dev:api
```

**Terminal 2 — Frontend:**
```bash
pnpm dev
```

Open **http://localhost:5173** in your browser.

### Demo Login

| Field | Value |
|-------|-------|
| Employee ID | `EMP-1001` |
| Password | `admin123` |

---

## Application Modules

### 1. Login (`/login`)

- Employee ID + password authentication
- Show/hide password toggle
- Remember me option
- Connects to backend `POST /api/auth/sign-in`
- Validates against Supabase `users` table when database is configured

### 2. Dashboard (`/`)

- **KPI cards** — total items, used items, required items, low stock count, total inventory value (₹)
- **Usage trend chart** — monthly issued vs received
- **Category breakdown** — pie chart by item category
- **Monthly consumption** — fuel, parts, safety equipment trends
- **Recent activity feed** — stock issued, received, and alerts
- Refresh dashboard data from API
- Clickable KPI cards navigate to related modules

### 3. Inventory Management (`/inventory`)

- View all inventory items in a sortable, filterable table
- **Search** by item name or ID
- **Filter** by category and stock status (In Stock / Low Stock / Out of Stock)
- **Sort** by ID, name, quantity, or last updated date
- **Expand row** for item details and quick actions
- **Add** new inventory items (saved to database via API)
- **Delete** items (single or bulk selection)
- **Export** to Excel (UI action)
- Quick actions per item: Stock In, Stock Out, Edit, Raise Indent

### 4. Used Items (`/used-items`)

- Track items issued to departments
- View transaction ID, item, quantity, department, issued by, date, remarks
- Search and filter issued records

### 5. Required Items (`/required-items`)

- Items below minimum stock or pending procurement
- Shows current qty, required qty, deficit, priority (Critical / High / Medium / Low)
- Procurement status (Purchase Order Raised, Pending Approval, Indent Raised)

### 6. Stock In (`/stock-in`)

- Record incoming stock receipts
- View supplier, PO number, quantity, date, remarks
- Add new stock-in entries (UI form with GRN generation toast)

### 7. Stock Out (`/stock-out`)

- Record items issued from store
- View department, employee, quantity, purpose, date
- Issue items form with inventory update notification

### 8. Suppliers (`/suppliers`)

- Manage supplier directory
- Contact name, phone, email, address, active/inactive status
- Add new suppliers via modal form
- Search suppliers

### 9. Reports (`/reports`)

- Pre-built report templates (Monthly Consumption, Stock Valuation, Low Stock, Department-wise Usage, etc.)
- Generate and download reports (UI)
- Report history and scheduling options

### 10. Users (`/users`)

- View system users (employee ID, name, role, department, email, status, last login)
- Role types: Administrator, Store Officer, Viewer
- Search and filter users

### 11. Settings (`/settings`)

- Organization profile (company name, financial year)
- Notification preferences
- Display and theme options
- Save settings (local UI state)

### 12. Layout (Shell)

- Collapsible sidebar navigation
- Notification dropdown with stock alerts
- User profile menu with sign out
- Financial year display (FY 2026–27)
- Global search bar
- Responsive sidebar toggle

---

## Backend API

Base URL: `http://localhost:4000` (local)

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Service status, data source, database connection |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/sign-in` | Sign in with employee ID + password |

### Data

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | KPIs, charts, recent activity |
| `GET` | `/api/inventory` | List all inventory items |
| `POST` | `/api/inventory` | Create or update an inventory item |
| `DELETE` | `/api/inventory/:id` | Delete an inventory item |
| `GET` | `/api/used-items` | List used/issued items |
| `GET` | `/api/required-items` | List required/reorder items |
| `GET` | `/api/stock-in` | List stock-in records |
| `GET` | `/api/stock-out` | List stock-out records |
| `GET` | `/api/suppliers` | List suppliers |
| `GET` | `/api/users` | List users |
| `GET` | `/api/reference` | All reference data in one response |

---

## Database (Supabase)

Tables: `inventory_items`, `used_items`, `required_items`, `stock_in`, `stock_out`, `suppliers`, `users`, `dashboard_data`

Schema and seed data: `backend/supabase/schema.sql`

Run once in Supabase SQL Editor before first deploy.

---

## Build Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend dev server |
| `pnpm dev:api` | Start backend dev server (hot reload) |
| `pnpm build` | Build frontend → `dist/` |
| `pnpm build:api` | Compile backend → `backend/dist/` |
| `pnpm start:api` | Run production backend |

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for full production deployment steps (Supabase, backend hosting, frontend hosting, env vars, and verification).

---

## License

Design bundle from Figma Make. See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md).
