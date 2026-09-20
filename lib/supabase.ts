import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbxwddtepdpwcvteqnaf.supabase.co";
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_secret_B1jiXBcwo4BX4Oda-rCGfQ_r-5FjLfD";

export const supabase = createClient(supabaseUrl, supabaseKey);
