import "dotenv/config";
import { getSupabase, isSupabaseConfigured } from "../src/lib/supabase.js";

const TABLES = [
  "inventory_items",
  "used_items",
  "required_items",
  "stock_in",
  "stock_out",
  "suppliers",
  "users",
  "dashboard_data",
] as const;

async function main() {
  if (!isSupabaseConfigured()) {
    console.error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env");
    process.exit(1);
  }

  for (const table of TABLES) {
    const query = getSupabase().from(table).delete({ count: "exact" });

    const { error, count } =
      table === "dashboard_data"
        ? await query.neq("id", "")
        : await query.gte("created_at", "1970-01-01T00:00:00Z");

    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`Cleared ${table} (${count ?? 0} rows)`);
  }

  console.log("All tables cleared.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
