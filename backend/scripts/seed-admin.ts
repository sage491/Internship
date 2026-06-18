import "dotenv/config";
import { getSupabase, isSupabaseConfigured } from "../src/lib/supabase.js";

async function main() {
  if (!isSupabaseConfigured()) {
    console.error("Supabase is not configured.");
    process.exit(1);
  }

  const { error } = await getSupabase().from("users").upsert({
    id: "EMP-1001",
    name: "Administrator",
    role: "Administrator",
    department: "IT & Systems",
    email: "admin@bccl.co.in",
    status: "Active",
    last_login: new Date().toISOString().slice(0, 16).replace("T", " "),
    password: "admin123",
  });

  if (error) throw error;
  console.log("Admin user ready: EMP-1001 / admin123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
