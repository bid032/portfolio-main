const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load .env.local manually
const envPath = path.join(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qbxwddtepdpwcvteqnaf.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_secret_B1jiXBcwo4BX4Oda-rCGfQ_r-5FjLfD";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey.slice(0, 15) + "...");

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSupabase() {
  console.log("Connecting to Supabase...");
  
  const tables = ["products", "orders", "coupons", "plans", "licenses", "store_settings", "free_downloads"];
  const dump = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        console.log(`Table ${table}: error -> ${error.message}`);
      } else {
        console.log(`Table ${table}: fetched ${data ? data.length : 0} rows`);
        dump[table] = data;
      }
    } catch (e) {
      console.log(`Table ${table}: exception -> ${e.message}`);
    }
  }

  const dumpPath = path.join(__dirname, "../tmp/supabase_dump.json");
  if (!fs.existsSync(path.dirname(dumpPath))) {
    fs.mkdirSync(path.dirname(dumpPath), { recursive: true });
  }
  fs.writeFileSync(dumpPath, JSON.stringify(dump, null, 2));
  console.log(`Dump saved to ${dumpPath}`);
}

inspectSupabase();
