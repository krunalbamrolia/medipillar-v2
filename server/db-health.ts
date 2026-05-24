import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

/** Tables the Express API reads/writes via Supabase */
export const REQUIRED_TABLES = [
  "profiles",
  "companies",
  "categories",
  "medicines",
  "cart_items",
  "orders",
  "order_items",
  "queries",
] as const;

export type RequiredTable = (typeof REQUIRED_TABLES)[number];

export function isMissingTableError(error: unknown): boolean {
  const e = error as { code?: string; message?: string };
  return (
    e?.code === "PGRST205" ||
    Boolean(e?.message?.includes("schema cache")) ||
    Boolean(e?.message?.includes("Could not find the table"))
  );
}

export function databaseSetupHint(): string {
  return (
    "Supabase tables are missing. Open Supabase Dashboard → SQL Editor, " +
    "run the file: supabase/setup_all_tables.sql — then restart npm run dev."
  );
}

export async function verifyDatabaseTables(): Promise<{
  ok: boolean;
  missing: string[];
}> {
  if (!isSupabaseConfigured()) {
    console.warn("[db] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env");
    return { ok: false, missing: [...REQUIRED_TABLES] };
  }

  const missing: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const { error } = await getSupabaseAdmin().from(table).select("id").limit(1);
    if (error && (error.code === "PGRST205" || error.message.includes(table))) {
      missing.push(table);
    } else if (error && error.code === "42P01") {
      missing.push(table);
    }
  }

  if (missing.length > 0) {
    console.error("\n[db] Missing Supabase tables:", missing.join(", "));
    console.error("[db]", databaseSetupHint(), "\n");
    return { ok: false, missing };
  }

  console.log("[db] All Supabase tables OK:", REQUIRED_TABLES.join(", "));
  return { ok: true, missing: [] };
}
