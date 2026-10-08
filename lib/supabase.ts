import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbxwddtepdpwcvteqnaf.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Pz-0lICwIju02Hd3MqXISA_V_KtPKDl";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use working publishable key if service key is missing or invalid secret key format
const supabaseKey = (serviceKey && !serviceKey.startsWith("sb_secret_")) ? serviceKey : anonKey;

export const supabase = createClient(supabaseUrl, supabaseKey);
