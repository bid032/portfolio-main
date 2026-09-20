-- =========================================================
-- ABDALLAH AHMED PORTFOLIO STORE - DATABASE SCHEMA
-- Compatible with Supabase / PostgreSQL
-- =========================================================

-- 1. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  instapay_link TEXT NOT NULL DEFAULT 'https://ipn.eg/S/bid032/instapay/0YCdeK',
  wallet_number VARCHAR(20) NOT NULL DEFAULT '01028463485',
  admin_password_hash TEXT NOT NULL DEFAULT 'abdallah7432*',
  admin_email VARCHAR(255) NOT NULL DEFAULT 'bid032.dev@gmail.com',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO store_settings (id, instapay_link, wallet_number, admin_password_hash, admin_email)
VALUES (1, 'https://ipn.eg/S/bid032/instapay/0YCdeK', '01028463485', 'abdallah7432*', 'bid032.dev@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('plugin', 'tool', 'script')),
  pricing_type VARCHAR(10) NOT NULL CHECK (pricing_type IN ('free', 'paid')),
  price_egp NUMERIC(10,2) DEFAULT 0.00,
  price_usd NUMERIC(10,2) DEFAULT 0.00,
  badge VARCHAR(50),
  features TEXT[],
  compatibility TEXT,
  version VARCHAR(20) DEFAULT 'v1.0.0',
  file_url TEXT NOT NULL,
  cover_image TEXT,
  downloads_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  product_price NUMERIC(10,2) DEFAULT 0.00,
  pricing_type VARCHAR(10) NOT NULL CHECK (pricing_type IN ('free', 'paid')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  sender_number TEXT,
  payment_method VARCHAR(20) CHECK (payment_method IN ('instapay', 'wallet')),
  screenshot_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  download_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================
-- MULTI-PRODUCT LICENSE MANAGEMENT PLATFORM TABLES
-- =========================================================

-- 4. PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  duration_days INT NOT NULL DEFAULT 30,
  price_egp NUMERIC(10,2) DEFAULT 0.00,
  price_usd NUMERIC(10,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'EGP',
  trial BOOLEAN DEFAULT FALSE,
  max_devices INT DEFAULT 2,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LICENSES TABLE
CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  license_key_hash TEXT UNIQUE NOT NULL,
  license_key_last4 VARCHAR(10) NOT NULL,
  user_id TEXT,
  user_email TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'expired', 'suspended', 'revoked')),
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_devices INT DEFAULT 2,
  revocation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. DEVICES TABLE
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  fingerprint_hash TEXT NOT NULL,
  installation_id TEXT NOT NULL,
  device_name TEXT,
  platform TEXT,
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- 7. LICENSE DEVICES BINDING TABLE
CREATE TABLE IF NOT EXISTS license_devices (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_heartbeat_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- 8. LICENSE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS license_payments (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  customer_email TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'EGP',
  provider VARCHAR(20) DEFAULT 'manual',
  provider_payment_id TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  proof_url TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. LICENSE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS license_sessions (
  id TEXT PRIMARY KEY,
  license_id TEXT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  session_token_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT FALSE
);

-- 10. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

