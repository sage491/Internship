-- DEPRECATED: use clear_all.sql instead (delete only, no re-seed).
-- This file now matches clear_all.sql.

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
