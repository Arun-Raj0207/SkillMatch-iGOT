import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

if (supabaseUrl.startsWith("postgresql://") || supabaseUrl.startsWith("postgres://")) {
  throw new Error(
    "VITE_SUPABASE_URL must be the Supabase project URL, not the Postgres connection string. Use https://<project-ref>.supabase.co"
  );
}

if (!/^https?:\/\//.test(supabaseUrl)) {
  throw new Error("VITE_SUPABASE_URL must start with http:// or https://");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
