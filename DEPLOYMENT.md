# Deployment Guide — BCCL Inventory Management System

Step-by-step instructions to deploy the frontend, backend, and Supabase database to production.

---

## Architecture Overview

```
┌─────────────────┐      HTTPS       ┌──────────────────┐      HTTPS       ┌─────────────────┐
│   Frontend      │  ──────────────► │   Backend API    │  ──────────────► │   Supabase      │
│   (Static)      │   /api/* calls   │   (Node/Express) │   service key    │   (PostgreSQL)  │
│   Vercel/Netlify│                  │   Railway/Render │                  │                 │
└─────────────────┘                  └──────────────────┘                  └─────────────────┘
```

- **Frontend** only needs `VITE_API_BASE_URL` — it never talks to Supabase directly.
- **Backend** holds the Supabase secret key — never expose it in the browser or frontend env.

---

## Step 1 — Supabase Database

### 1.1 Create project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**, choose a name and region, set a database password.
3. Wait for the project to finish provisioning.

### 1.2 Run the schema

1. Open your project → **SQL Editor** → **New query**.
2. Copy the entire contents of `backend/supabase/schema.sql`.
3. Paste and click **Run**.
4. Confirm tables appear under **Table Editor**: `inventory_items`, `used_items`, `required_items`, `stock_in`, `stock_out`, `suppliers`, `users`, `dashboard_data`.

### Reset old data (optional)

If you want to **delete all existing rows** (old/real data) and restore only the **pre-stored demo data**, run:

- `backend/supabase/reset_and_seed.sql`

This keeps the tables but truncates all rows and inserts the demo seed again.

### 1.3 Get API credentials

Go to **Project Settings → API** and note:

| Setting | Env variable | Used by |
|---------|--------------|---------|
| Project URL | `SUPABASE_URL` | Backend |
| Secret key (`sb_secret_...`) | `SUPABASE_SERVICE_ROLE_KEY` | Backend only |

> **Never** put the secret key in frontend code, `.env` at the repo root for Vite, or any public host env that builds the React app.

### 1.4 Verify seed data

In **Table Editor**, open `users` — you should see `EMP-1001` (Administrator).  
Open `inventory_items` — you should see 5 seeded items.

---

## Step 2 — Deploy Backend (API)

Choose one host below. All need the same environment variables.

### Required environment variables

| Variable | Example | Required |
|----------|---------|----------|
| `PORT` | `4000` | Set by host automatically on most platforms |
| `SUPABASE_URL` | `https://nfbaytlrtszofxqdrdtv.supabase.co` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_...` | Yes |

---

### Option A — Railway

1. Push your code to GitHub (ensure `.env` is **not** committed — `.gitignore` covers it).
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
3. Select this repository.
4. Set **Root Directory** to `backend` (or configure build commands below).
5. **Settings → Build:**
   - Build command: `pnpm install && pnpm build`
   - Start command: `node dist/server.js`
6. **Variables** — add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
7. Deploy. Copy the public URL (e.g. `https://your-app.up.railway.app`).

---

### Option B — Render

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `node dist/server.js`
   - **Instance type:** Free or paid
4. Add environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Create Web Service. Copy the URL (e.g. `https://inventory-api.onrender.com`).

---

### Option C — Fly.io

```bash
cd backend
fly launch
fly secrets set SUPABASE_URL=https://your-project.supabase.co
fly secrets set SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
fly deploy
```

---

### Verify backend deployment

```bash
curl https://YOUR-BACKEND-URL/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "inventory-backend",
  "dataSource": "supabase",
  "database": "connected"
}
```

Also test:

```bash
curl https://YOUR-BACKEND-URL/api/inventory
```

You should receive a JSON array of inventory items.

---

## Step 3 — Deploy Frontend (Static Site)

The frontend is a Vite SPA. Build output goes to `dist/`.

### Required environment variable (build time)

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | Your deployed backend URL (no trailing slash) |

Example: `VITE_API_BASE_URL=https://inventory-api.onrender.com`

> Vite embeds this at **build time**. You must rebuild/redeploy the frontend if the backend URL changes.

---

### Option A — Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. **Framework Preset:** Vite
3. **Root Directory:** `.` (project root)
4. **Build Command:** `pnpm install && pnpm build`
5. **Output Directory:** `dist`
6. **Environment Variables:**
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL`
7. Deploy. Open the Vercel URL.

---

### Option B — Netlify

1. Go to [netlify.com](https://netlify.com) → **Add new site** → import from Git.
2. **Build command:** `pnpm install && pnpm build`
3. **Publish directory:** `dist`
4. **Environment variables:**
   - `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL`
5. Deploy.

---

### Option C — Manual / any static host

```bash
# From project root
pnpm install
# Set env before build (Linux/macOS)
export VITE_API_BASE_URL=https://YOUR-BACKEND-URL
pnpm build
# Upload dist/ folder to your host
```

On Windows PowerShell:

```powershell
$env:VITE_API_BASE_URL="https://YOUR-BACKEND-URL"
pnpm build
```

Upload the `dist/` folder to S3, Cloudflare Pages, GitHub Pages, etc.

---

## Step 4 — CORS (if needed)

The backend uses `cors()` with default settings (allows all origins). This works for most deployments.

If you lock down CORS later, update `backend/src/server.ts` to allow only your frontend domain.

---

## Step 5 — Post-Deploy Checklist

| # | Check | How |
|---|-------|-----|
| 1 | Database connected | `GET /api/health` → `"database": "connected"` |
| 2 | Inventory loads | Open app → Inventory Management → items appear |
| 3 | Login works | `EMP-1001` / `admin123` |
| 4 | Dashboard charts | Home page shows KPIs and charts |
| 5 | Add/delete item | Inventory → add item → refresh → still there |
| 6 | HTTPS | Both frontend and backend use `https://` in production |

---

## Local Production Build Test

Before deploying, verify both builds locally:

```bash
# Install
pnpm install

# Build backend
pnpm build:api

# Build frontend (point at local API)
# Windows PowerShell:
$env:VITE_API_BASE_URL="http://localhost:4000"
pnpm build

# Start backend (ensure backend/.env has Supabase credentials)
pnpm start:api

# Serve frontend build (optional)
npx serve dist
```

Open the served URL and test login + inventory.

---

## Environment Files Reference

### `backend/.env` (local / backend host)

```env
PORT=4000
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_YOUR-KEY
```

### `.env` (local / frontend build)

```env
VITE_API_BASE_URL=http://localhost:4000
```

Production frontend: set `VITE_API_BASE_URL` on the hosting platform, not in a committed file.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `database: "disconnected"` | Check `SUPABASE_URL` and secret key on backend host. Re-run `schema.sql` if tables are missing. |
| Frontend shows mock/empty data | `VITE_API_BASE_URL` not set at build time. Rebuild frontend with correct URL. |
| CORS errors | Ensure backend URL in `VITE_API_BASE_URL` matches deployed backend exactly (https, no trailing slash). |
| Login fails | Confirm `users` table has seed data. Password for `EMP-1001` is `admin123`. |
| `EADDRINUSE` on port 4000 | Another process is using port 4000. Stop it or change `PORT` in `backend/.env`. |
| Build fails on host | Ensure Node 18+ and pnpm are available. Use build command `pnpm install && pnpm build`. |

---

## Security Recommendations

1. **Rotate keys** if they were ever shared in chat or committed to git.
2. **Never commit** `.env` or `backend/.env` — they are in `.gitignore`.
3. Use **HTTPS** for both frontend and backend in production.
4. Change default demo password (`admin123`) before going live.
5. Restrict Supabase **Row Level Security** policies if you add direct client access later.

---

## Quick Reference — Your Supabase Project

| Item | Value |
|------|-------|
| Project ref | `nfbaytlrtszofxqdrdtv` |
| API URL | `https://nfbaytlrtszofxqdrdtv.supabase.co` |
| Demo login | `EMP-1001` / `admin123` |

Replace secret key values in your host dashboard — do not paste them in public repos.
