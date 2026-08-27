import fs from "fs";
import path from "path";
import {
  Product,
  Order,
  StoreSettings,
  Coupon,
  Plan,
  License,
  Device,
  LicenseDeviceBinding,
  LicensePayment,
  LicenseSession,
  AuditLogEntry,
} from "./store-types";
import { supabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store-data.json");

interface DbSchema {
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
  coupons?: Coupon[];
  plans?: Plan[];
  licenses?: License[];
  devices?: Device[];
  licenseDevices?: LicenseDeviceBinding[];
  licensePayments?: LicensePayment[];
  licenseSessions?: LicenseSession[];
  auditLogs?: AuditLogEntry[];
}

const DEFAULT_SETTINGS: StoreSettings = {
  instapayLink: "https://ipn.eg/S/bid032/instapay/0YCdeK",
  walletNumber: "01028463485",
  adminPasswordHash: "abdallah7432*",
  adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "bid032art@gmail.com",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://bid032.com",
  spotlightProductId: "prod_gridora_layout",
  heroBannerText: "⚡ Special Offer: Get 20% OFF on all Illustrator plugins with code WELCOME20!",
  heroBannerEnabled: true,
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coup_welcome20",
    code: "WELCOME20",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 200,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "coup_off100",
    code: "OFF100",
    discountType: "fixed",
    discountValue: 100,
    minOrderAmount: 300,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod_bessanty_bento",
    slug: "bessanty-bento-grid-plugin",
    title: "Bessanty Bento Grid System",
    subtitle: "Adobe Illustrator Layout Generator",
    description: "Automate responsive bento grid layouts in Adobe Illustrator with 50+ presets, live artboard preview, and smart margin controls.",
    category: "plugin",
    pricingType: "paid",
    priceEgp: 450,
    priceUsd: 15,
    badge: "Popular",
    features: [
      "50+ Bento Layout Presets",
      "Live Artboard Preview Engine",
      "Auto Aspect-Ratio & Spacing Adjuster",
      "Adobe Illustrator CC 2023-2026 Compatible",
      "Free Lifetime Updates"
    ],
    compatibility: "Adobe Illustrator CC 2023+",
    version: "v2.4.0",
    fileUrl: "/assets/downloads/bessanty-bento-v2.zip",
    coverImage: "/Photos/Tools/illustrator.png",
    downloadsCount: 184,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_motion_reel_presets",
    slug: "commercial-motion-reel-presets",
    title: "Commercial Motion Reel Suite",
    subtitle: "Premiere Pro Ad & Reel Presets",
    description: "High-converting dynamic transitions, auto-reframe social templates, and studio color grading LUTs built for viral promo ads.",
    category: "tool",
    pricingType: "paid",
    priceEgp: 600,
    priceUsd: 20,
    badge: "Featured",
    features: [
      "30+ Studio Motion Transitions",
      "Vertical 9:16 & 4:5 Reframe Presets",
      "Cinematic Commercial Color LUTs",
      "Drag-and-Drop Workflow"
    ],
    compatibility: "Adobe Premiere Pro CC 2023+",
    version: "v1.8.0",
    fileUrl: "/assets/downloads/commercial-motion-presets.zip",
    coverImage: "/Photos/Tools/premiere.png",
    downloadsCount: 142,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_quickkeyz_automation",
    slug: "quickkeyz-automation-engine",
    title: "QuickKeyz Productivity Engine",
    subtitle: "Design & Code Automation Script",
    description: "Boost design-to-code velocity by 300%. One-click vector asset exporter, design token generator, and key binding automation.",
    category: "script",
    pricingType: "free",
    priceEgp: 0,
    priceUsd: 0,
    badge: "Free",
    features: [
      "One-Click Clean SVG Export",
      "Automated CSS Color Tokenizer",
      "Batch Layer Renaming & Grouping",
      "100% Free & Open Source"
    ],
    compatibility: "Illustrator / VS Code / Windows",
    version: "v1.2.0",
    fileUrl: "/assets/downloads/quickkeyz-engine.zip",
    coverImage: "/Photos/Tools/vscode.png",
    downloadsCount: 520,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_mockup_engine",
    slug: "brand-identity-mockup-engine",
    title: "Brand Identity Mockup Engine",
    subtitle: "Photoshop Smart Action Suite",
    description: "Photorealistic stationery, die-cut packaging, and embossed logo mockup renderer with automated batch lighting.",
    category: "tool",
    pricingType: "paid",
    priceEgp: 350,
    priceUsd: 12,
    badge: "Sale",
    features: [
      "4K Smart-Object Mockup Renderers",
      "Realistic Foil Stamp & Emboss Effects",
      "Batch Image Renderer Script",
      "High-Res Print Ready (300 DPI)"
    ],
    compatibility: "Adobe Photoshop CC 2022+",
    version: "v3.0.0",
    fileUrl: "/assets/downloads/brand-mockup-engine.zip",
    coverImage: "/Photos/Tools/photoshop.png",
    downloadsCount: 98,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_next_portfolio_kit",
    slug: "nextjs-portfolio-store-kit",
    title: "Full-Stack Portfolio & Store Kit",
    subtitle: "Next.js 15 & Tailwind Boilerplate",
    description: "Production-ready Next.js starter kit featuring Lenis smooth scrolling, GSAP reveals, dark/light theme engine, and store checkout.",
    category: "script",
    pricingType: "paid",
    priceEgp: 750,
    priceUsd: 25,
    badge: "New",
    features: [
      "Lenis Smooth Scroll & GSAP Integration",
      "Expiring Download Link HMAC Engine",
      "Bento Grid & Glassmorphism UI System",
      "TypeScript & SEO Best Practices"
    ],
    compatibility: "Next.js 15 / React 19 / TypeScript",
    version: "v1.5.0",
    fileUrl: "/assets/downloads/next-portfolio-store-kit.zip",
    coverImage: "/Photos/Tools/nextjs.png",
    downloadsCount: 76,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod_typescale_calculator",
    slug: "smart-typescale-clamp-calculator",
    title: "Smart TypeScale & Clamp Calculator",
    subtitle: "Fluid Typography Plugin",
    description: "Calculate and export perfectly balanced fluid clamp() font scales directly to CSS variables or Tailwind CSS configuration.",
    category: "plugin",
    pricingType: "free",
    priceEgp: 0,
    priceUsd: 0,
    badge: "Free",
    features: [
      "Instant Fluid Clamp Generator",
      "Direct Export to CSS / Tailwind",
      "Visual Hierarchy Scale Preview",
      "100% Free Tool"
    ],
    compatibility: "Web / Figma / CSS",
    version: "v1.0.5",
    fileUrl: "/assets/downloads/typescale-calculator.zip",
    coverImage: "/Photos/Tools/figma.png",
    downloadsCount: 630,
    createdAt: new Date().toISOString()
  }
];

function ensureDbExists(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    const initialDb: DbSchema = {
      settings: DEFAULT_SETTINGS,
      products: DEFAULT_PRODUCTS,
      orders: [],
      coupons: DEFAULT_COUPONS
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      products: parsed.products && parsed.products.length > 0 ? parsed.products : DEFAULT_PRODUCTS,
      orders: parsed.orders || [],
      coupons: parsed.coupons || DEFAULT_COUPONS,
      plans: parsed.plans || [],
      licenses: parsed.licenses || [],
      devices: parsed.devices || [],
      licenseDevices: parsed.licenseDevices || [],
      licensePayments: parsed.licensePayments || [],
      licenseSessions: parsed.licenseSessions || [],
      auditLogs: parsed.auditLogs || [],
    };
  } catch (err) {
    return {
      settings: DEFAULT_SETTINGS,
      products: DEFAULT_PRODUCTS,
      orders: [],
      coupons: DEFAULT_COUPONS,
      plans: [],
      licenses: [],
      devices: [],
      licenseDevices: [],
      licensePayments: [],
      licenseSessions: [],
      auditLogs: [],
    };
  }
}

export function saveDb(data: DbSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export function getStoreSettings(): StoreSettings {
  const db = ensureDbExists();
  const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envSiteUrl) {
    return { ...db.settings, siteUrl: envSiteUrl.replace(/\/$/, "") };
  }
  return db.settings;
}

export function getSiteUrl(req?: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  if (req) {
    const host = req.headers.get("host");
    if (host) {
      const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  const settings = getStoreSettings();
  return (settings.siteUrl || "https://bid032.com").replace(/\/$/, "");
}

export function updateStoreSettings(newSettings: Partial<StoreSettings>): StoreSettings {
  const db = ensureDbExists();
  db.settings = { ...db.settings, ...newSettings };
  saveDb(db);
  return db.settings;
}

export function getProducts(): Product[] {
  const db = ensureDbExists();
  return db.products;
}

export function mapSupabaseProduct(p: any): Product {
  const rawPrice = p.price_egp ?? p.priceEgp ?? p.price ?? p.price_egp_val ?? 0;
  const priceEgp = Number(rawPrice) || 0;

  const rawPricingType = p.pricing_type ?? p.pricingType ?? p.type ?? p.pricing ?? p.price_type;

  let pricingType: "free" | "paid";
  if (rawPricingType === "free" || rawPricingType === "paid") {
    pricingType = rawPricingType;
  } else {
    pricingType = priceEgp === 0 ? "free" : "paid";
  }

  // Safety override: If price > 0, it is guaranteed to be a paid product
  if (priceEgp > 0) {
    pricingType = "paid";
  }

  const rawOrigPrice = p.original_price_egp ?? p.originalPriceEgp ?? p.original_price ?? p.old_price;

  const rawCat = (p.category ?? p.cat ?? p.product_category ?? "plugin").toString().toLowerCase().trim();
  let category: "plugin" | "tool" | "script" = "plugin";
  if (rawCat.includes("tool") || rawCat.includes("app")) {
    category = "tool";
  } else if (rawCat.includes("script") || rawCat.includes("code")) {
    category = "script";
  } else {
    category = "plugin";
  }

  return {
    id: p.id,
    slug: p.slug || p.id,
    title: p.title || "",
    subtitle: p.subtitle || p.sub_title || p.subTitle || p.short_description || "",
    description: p.description || p.desc || "",
    category,
    pricingType,
    priceEgp,
    originalPriceEgp: rawOrigPrice !== undefined && rawOrigPrice !== null && rawOrigPrice !== "" ? Number(rawOrigPrice) : undefined,
    priceUsd: Number(p.price_usd ?? p.priceUsd ?? p.usd_price ?? 0),
    badge: p.badge || p.tag || p.label || "Popular",
    features: Array.isArray(p.features)
      ? p.features
      : (typeof p.features === "string" ? p.features.split(",").map((f: string) => f.trim()).filter(Boolean) : []),
    software: p.software ?? p.software_name ?? p.app_name ?? p.program ?? "",
    compatibility: p.compatibility ?? p.specs ?? p.system ?? p.operating_system ?? p.os ?? "",
    version: p.version || p.ver || "v1.0.0",
    fileUrl: p.file_url ?? p.fileUrl ?? p.fileurl ?? p.download_url ?? p.downloadUrl ?? p.download_link ?? p.file_path ?? p.file ?? p.download_file ?? p.url ?? "",
    coverImage: p.cover_image ?? p.coverImage ?? p.image ?? p.cover ?? "/Photos/Tools/illustrator.png",
    gallery: Array.isArray(p.gallery) ? p.gallery : (typeof p.gallery === "string" ? (() => { try { return JSON.parse(p.gallery); } catch { return undefined; } })() : undefined),
    downloadsCount: p.downloads_count ?? p.downloadsCount ?? 0,
    isExternalAuthor: Boolean(p.is_external_author ?? p.isExternalAuthor ?? false),
    authorName: p.author_name ?? p.authorName ?? "",
    authorLink: p.author_link ?? p.authorLink ?? "",
    sortOrder: Number(p.sort_order ?? p.sortOrder ?? p.order ?? 0),
    isHidden: Boolean(p.is_hidden ?? p.isHidden ?? false),
    createdAt: p.created_at ?? p.createdAt ?? new Date().toISOString()
  };
}

export function getProductById(id: string): Product | undefined {
  const products = getProducts();
  return products.find((p) => p.id === id || p.slug === id);
}

export function addProduct(product: Omit<Product, "id" | "createdAt">): Product {
  const db = ensureDbExists();
  const newProd: Product = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString(),
  };
  db.products.unshift(newProd);
  saveDb(db);
  return newProd;
}

export function updateProduct(id: string, updates: Partial<Product>): Product {
  const db = ensureDbExists();
  const index = db.products.findIndex((p) => p.id === id || p.slug === id);
  if (index === -1) {
    const newProd: Product = {
      id,
      slug: updates.slug || id,
      title: updates.title || "",
      subtitle: updates.subtitle || "",
      description: updates.description || "",
      category: updates.category || "plugin",
      pricingType: updates.pricingType || "paid",
      priceEgp: updates.priceEgp || 0,
      originalPriceEgp: updates.originalPriceEgp,
      priceUsd: updates.priceUsd || 0,
      badge: updates.badge || "Popular",
      features: updates.features || [],
      compatibility: updates.compatibility || "",
      version: updates.version || "v1.0.0",
      fileUrl: updates.fileUrl || "",
      coverImage: updates.coverImage || "/Photos/Tools/illustrator.png",
      downloadsCount: updates.downloadsCount || 0,
      createdAt: new Date().toISOString()
    };
    db.products.unshift(newProd);
    saveDb(db);
    return newProd;
  }

  db.products[index] = { ...db.products[index], ...updates };
  saveDb(db);
  return db.products[index];
}

export function deleteProduct(id: string): boolean {
  const db = ensureDbExists();
  const initialLen = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  saveDb(db);
  return db.products.length < initialLen;
}

export function getCoupons(): Coupon[] {
  const db = ensureDbExists();
  return db.coupons || DEFAULT_COUPONS;
}

export function addCoupon(coupon: Omit<Coupon, "id" | "usedCount" | "createdAt">): Coupon {
  const db = ensureDbExists();
  if (!db.coupons) db.coupons = [];
  const newCoupon: Coupon = {
    ...coupon,
    id: `coup_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    code: coupon.code.toUpperCase().trim(),
    usedCount: 0,
    createdAt: new Date().toISOString()
  };
  db.coupons.unshift(newCoupon);
  saveDb(db);
  return newCoupon;
}

export function updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
  const db = ensureDbExists();
  if (!db.coupons) return null;
  const index = db.coupons.findIndex((c) => c.id === id);
  if (index === -1) return null;

  db.coupons[index] = {
    ...db.coupons[index],
    ...updates,
    code: updates.code ? updates.code.toUpperCase().trim() : db.coupons[index].code,
  };
  saveDb(db);
  return db.coupons[index];
}

export function toggleCouponActive(id: string): Coupon | null {
  const db = ensureDbExists();
  if (!db.coupons) return null;
  const coupon = db.coupons.find((c) => c.id === id);
  if (coupon) {
    coupon.isActive = !coupon.isActive;
    saveDb(db);
  }
  return coupon || null;
}

export function deleteCoupon(id: string): boolean {
  const db = ensureDbExists();
  if (!db.coupons) return false;
  const initialLen = db.coupons.length;
  db.coupons = db.coupons.filter((c) => c.id !== id);
  saveDb(db);
  return db.coupons.length < initialLen;
}

export function validateCoupon(code: string, orderAmount: number, productId?: string): { valid: boolean; coupon?: Coupon; discountAmount: number; message?: string } {
  const coupons = getCoupons();
  const found = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());

  if (!found) {
    return { valid: false, discountAmount: 0, message: "Invalid coupon code." };
  }

  if (!found.isActive) {
    return { valid: false, discountAmount: 0, message: "This coupon code is currently disabled." };
  }

  if (found.applicableProductId && found.applicableProductId !== "all" && productId && found.applicableProductId !== productId) {
    return { valid: false, discountAmount: 0, message: "This coupon is not valid for this product." };
  }

  if (found.maxUses && found.usedCount >= found.maxUses) {
    return { valid: false, discountAmount: 0, message: "This coupon has reached its maximum usage limit." };
  }

  if (found.minOrderAmount && orderAmount < found.minOrderAmount) {
    return { valid: false, discountAmount: 0, message: `Coupon requires a minimum order of ${found.minOrderAmount} EGP.` };
  }

  let discountAmount = 0;
  if (found.discountType === "percentage") {
    discountAmount = Math.round((orderAmount * found.discountValue) / 100);
  } else {
    discountAmount = Math.min(found.discountValue, orderAmount);
  }

  return { valid: true, coupon: found, discountAmount };
}

export function incrementCouponUsage(code: string) {
  const db = ensureDbExists();
  if (!db.coupons) return;
  const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (coupon) {
    coupon.usedCount += 1;
    saveDb(db);
  }
}

export function getOrders(): Order[] {
  const db = ensureDbExists();
  return db.orders;
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find((o) => o.id === id);
}

export function addOrder(order: Omit<Order, "id" | "createdAt" | "status">): Order {
  const db = ensureDbExists();
  const newOrder: Order = {
    ...order,
    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    status: order.pricingType === "free" ? "approved" : "pending",
    createdAt: new Date().toISOString(),
  };
  db.orders.unshift(newOrder);

  if (order.couponCode) {
    incrementCouponUsage(order.couponCode);
  }

  saveDb(db);

  // Sync order to Supabase asynchronously with adaptive column mapping
  (async () => {
    try {
      let sampleRow: any = null;
      const { data } = await supabase.from("orders").select("*").limit(1);
      if (data && data.length > 0) sampleRow = data[0];

      const payload: any = {
        id: newOrder.id,
        status: newOrder.status,
        created_at: newOrder.createdAt,
        createdAt: newOrder.createdAt
      };

      if (sampleRow) {
        const keys = new Set(Object.keys(sampleRow));
        if (keys.has("product_id")) payload.product_id = newOrder.productId;
        if (keys.has("productId")) payload.productId = newOrder.productId;

        if (keys.has("product_title")) payload.product_title = newOrder.productTitle;
        if (keys.has("productTitle")) payload.productTitle = newOrder.productTitle;

        if (keys.has("product_price")) payload.product_price = newOrder.productPrice;
        if (keys.has("productPrice")) payload.productPrice = newOrder.productPrice;
        if (keys.has("price")) payload.price = newOrder.productPrice;

        if (keys.has("pricing_type")) payload.pricing_type = newOrder.pricingType;
        if (keys.has("pricingType")) payload.pricingType = newOrder.pricingType;

        if (keys.has("customer_name")) payload.customer_name = newOrder.customerName;
        if (keys.has("customerName")) payload.customerName = newOrder.customerName;

        if (keys.has("customer_email")) payload.customer_email = newOrder.customerEmail;
        if (keys.has("customerEmail")) payload.customerEmail = newOrder.customerEmail;

        if (keys.has("customer_phone")) payload.customer_phone = newOrder.customerPhone;
        if (keys.has("customerPhone")) payload.customerPhone = newOrder.customerPhone;

        if (keys.has("sender_number")) payload.sender_number = newOrder.senderNumber;
        if (keys.has("senderNumber")) payload.senderNumber = newOrder.senderNumber;

        if (keys.has("payment_method")) payload.payment_method = newOrder.paymentMethod;
        if (keys.has("paymentMethod")) payload.paymentMethod = newOrder.paymentMethod;

        if (keys.has("screenshot_url")) payload.screenshot_url = newOrder.screenshotUrl;
        if (keys.has("screenshotUrl")) payload.screenshotUrl = newOrder.screenshotUrl;

        if (keys.has("coupon_code")) payload.coupon_code = newOrder.couponCode || null;
        if (keys.has("couponCode")) payload.couponCode = newOrder.couponCode || null;

        if (keys.has("discount_amount")) payload.discount_amount = newOrder.discountAmount || 0;
        if (keys.has("discountAmount")) payload.discountAmount = newOrder.discountAmount || 0;

        if (keys.has("plan_id")) payload.plan_id = newOrder.planId || null;
        if (keys.has("planId")) payload.planId = newOrder.planId || null;

        if (keys.has("plan_name")) payload.plan_name = newOrder.planName || null;
        if (keys.has("planName")) payload.planName = newOrder.planName || null;
      } else {
        payload.product_id = newOrder.productId;
        payload.product_title = newOrder.productTitle;
        payload.product_price = newOrder.productPrice;
        payload.pricing_type = newOrder.pricingType;
        payload.customer_name = newOrder.customerName;
        payload.customer_email = newOrder.customerEmail;
        payload.customer_phone = newOrder.customerPhone;
        payload.sender_number = newOrder.senderNumber;
        payload.payment_method = newOrder.paymentMethod;
        payload.screenshot_url = newOrder.screenshotUrl;
        payload.coupon_code = newOrder.couponCode || null;
        payload.discount_amount = newOrder.discountAmount || 0;
        payload.plan_id = newOrder.planId || null;
        payload.plan_name = newOrder.planName || null;
      }

      await supabase.from("orders").insert([payload]);
    } catch (e) {}
  })();

  return newOrder;
}

export function updateOrderStatus(
  orderId: string,
  status: "approved" | "rejected",
  downloadToken?: string,
  tokenExpiresAt?: string
): Order | null {
  const db = ensureDbExists();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;

  order.status = status;
  if (status === "approved") {
    order.approvedAt = new Date().toISOString();
    if (downloadToken) order.downloadToken = downloadToken;
    if (tokenExpiresAt) order.tokenExpiresAt = tokenExpiresAt;
  }
  saveDb(db);

  // Sync update to Supabase
  (async () => {
    try {
      let sampleRow: any = null;
      const { data } = await supabase.from("orders").select("*").limit(1);
      if (data && data.length > 0) sampleRow = data[0];

      const payload: any = { status };
      if (status === "approved") {
        if (!sampleRow || sampleRow.hasOwnProperty("approved_at")) payload.approved_at = order.approvedAt;
        if (!sampleRow || sampleRow.hasOwnProperty("approvedAt")) payload.approvedAt = order.approvedAt;
        if (downloadToken) {
          if (!sampleRow || sampleRow.hasOwnProperty("download_token")) payload.download_token = downloadToken;
          if (!sampleRow || sampleRow.hasOwnProperty("downloadToken")) payload.downloadToken = downloadToken;
        }
        if (tokenExpiresAt) {
          if (!sampleRow || sampleRow.hasOwnProperty("token_expires_at")) payload.token_expires_at = tokenExpiresAt;
          if (!sampleRow || sampleRow.hasOwnProperty("tokenExpiresAt")) payload.tokenExpiresAt = tokenExpiresAt;
        }
      }

      await supabase.from("orders").update(payload).eq("id", orderId);
    } catch (e) {}
  })();

  return order;
}

export function deleteOrder(orderId: string): boolean {
  const db = ensureDbExists();
  const initialLen = db.orders.length;
  db.orders = db.orders.filter((o) => o.id !== orderId);
  saveDb(db);

  // Sync deletion to Supabase asynchronously
  (async () => {
    try {
      await supabase.from("orders").delete().eq("id", orderId);
    } catch (e) {}
  })();

  return db.orders.length < initialLen;
}

export function deleteAllOrders(): number {
  const db = ensureDbExists();
  const count = db.orders.length;
  db.orders = [];
  saveDb(db);

  // Sync deletion to Supabase asynchronously
  (async () => {
    try {
      await supabase.from("orders").delete().neq("id", "0");
    } catch (e) {}
  })();

  return count;
}

// =========================================================
// LICENSE PLATFORM STORE HELPERS
// =========================================================

export function getPlans(): Plan[] {
  const db = ensureDbExists();
  return db.plans || [];
}

export function savePlans(plans: Plan[]) {
  const db = ensureDbExists();
  db.plans = plans;
  saveDb(db);
}

export function getLicenses(): License[] {
  const db = ensureDbExists();
  return db.licenses || [];
}

export function saveLicenses(licenses: License[]) {
  const db = ensureDbExists();
  db.licenses = licenses;
  saveDb(db);
}

export function getDevices(): Device[] {
  const db = ensureDbExists();
  return db.devices || [];
}

export function saveDevices(devices: Device[]) {
  const db = ensureDbExists();
  db.devices = devices;
  saveDb(db);
}

export function getLicenseDeviceBindings(): LicenseDeviceBinding[] {
  const db = ensureDbExists();
  return db.licenseDevices || [];
}

export function saveLicenseDeviceBindings(bindings: LicenseDeviceBinding[]) {
  const db = ensureDbExists();
  db.licenseDevices = bindings;
  saveDb(db);
}

export function getLicensePayments(): LicensePayment[] {
  const db = ensureDbExists();
  return db.licensePayments || [];
}

export function saveLicensePayments(payments: LicensePayment[]) {
  const db = ensureDbExists();
  db.licensePayments = payments;
  saveDb(db);
}

export function getLicenseSessions(): LicenseSession[] {
  const db = ensureDbExists();
  return db.licenseSessions || [];
}

export function saveLicenseSessions(sessions: LicenseSession[]) {
  const db = ensureDbExists();
  db.licenseSessions = sessions;
  saveDb(db);
}

export function getAuditLogs(): AuditLogEntry[] {
  const db = ensureDbExists();
  return db.auditLogs || [];
}

export function saveAuditLogs(logs: AuditLogEntry[]) {
  const db = ensureDbExists();
  db.auditLogs = logs;
  saveDb(db);
}
