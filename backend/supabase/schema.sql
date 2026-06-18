-- Inventory Management System — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create extension if not exists "pgcrypto";

-- Inventory
create table if not exists public.inventory_items (
  id text primary key,
  name text not null,
  category text not null default 'Consumables',
  unit text not null default 'Nos',
  quantity integer not null default 0,
  min_stock integer not null default 0,
  location text not null default 'Store A',
  status text not null default 'In Stock',
  last_updated date not null default current_date,
  created_at timestamptz not null default now()
);

-- Used / issued items
create table if not exists public.used_items (
  id text primary key,
  item text not null,
  quantity integer not null,
  department text not null,
  issued_by text not null,
  date date not null,
  remarks text not null default '',
  created_at timestamptz not null default now()
);

-- Required / reorder items
create table if not exists public.required_items (
  id uuid primary key default gen_random_uuid(),
  item text not null unique,
  current_qty integer not null,
  required_qty integer not null,
  deficit integer not null,
  priority text not null,
  status text not null,
  created_at timestamptz not null default now()
);

-- Stock in
create table if not exists public.stock_in (
  id text primary key,
  item text not null,
  supplier text not null,
  quantity integer not null,
  po_number text not null,
  date date not null,
  remarks text not null default '',
  created_at timestamptz not null default now()
);

-- Stock out
create table if not exists public.stock_out (
  id text primary key,
  item text not null,
  quantity integer not null,
  department text not null,
  employee text not null,
  date date not null,
  purpose text not null default '',
  created_at timestamptz not null default now()
);

-- Suppliers
create table if not exists public.suppliers (
  id text primary key,
  name text not null,
  contact text not null,
  phone text not null,
  email text not null,
  address text not null,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

-- Users (employee accounts)
create table if not exists public.users (
  id text primary key,
  name text not null,
  role text not null,
  department text not null,
  email text not null,
  status text not null default 'Active',
  last_login text not null default '',
  password text,
  created_at timestamptz not null default now()
);

-- Dashboard snapshot (static chart / KPI data)
create table if not exists public.dashboard_data (
  id text primary key default 'default',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Row Level Security: backend uses service role key (bypasses RLS).
-- Enable RLS for direct client access safety; no public policies by default.
alter table public.inventory_items enable row level security;
alter table public.used_items enable row level security;
alter table public.required_items enable row level security;
alter table public.stock_in enable row level security;
alter table public.stock_out enable row level security;
alter table public.suppliers enable row level security;
alter table public.users enable row level security;
alter table public.dashboard_data enable row level security;
