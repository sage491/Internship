-- Delete ALL data from every table (no re-seed).
-- Run in Supabase Dashboard → SQL Editor.

begin;

truncate table
  public.inventory_items,
  public.used_items,
  public.required_items,
  public.stock_in,
  public.stock_out,
  public.suppliers,
  public.users,
  public.dashboard_data
restart identity;

commit;
