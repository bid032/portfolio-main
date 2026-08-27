import { NextResponse } from "next/server";
import { getProducts, addProduct, updateProduct, deleteProduct, getStoreSettings, mapSupabaseProduct } from "@/lib/store-db";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// In-memory server cache for ultra-fast response (< 1ms)
let cachedProducts: any[] | null = null;
let lastProductsFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

export function invalidateProductsCache() {
  cachedProducts = null;
  lastProductsFetchTime = 0;
}

export async function GET() {
  try {
    const localProducts = getProducts();
    const now = Date.now();

    // Serve from memory cache if fresh
    if (cachedProducts && now - lastProductsFetchTime < CACHE_TTL_MS) {
      return NextResponse.json(cachedProducts);
    }

    // Attempt fetching directly from Supabase with a 1200ms timeout
    const fetchSupaPromise = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 1200)
    );

    const { data: supaProducts, error } = await Promise.race([fetchSupaPromise, timeoutPromise]);

    if (!error && supaProducts && supaProducts.length > 0) {
      const mapped = supaProducts.map((p: any) => {
        const mappedProd = mapSupabaseProduct(p);
        const localMatch = localProducts.find((lp) => lp.id === mappedProd.id || lp.slug === mappedProd.slug);
        if (localMatch) {
          return {
            ...mappedProd,
            ...localMatch,
            downloadsCount: mappedProd.downloadsCount ?? localMatch.downloadsCount ?? 0,
          };
        }
        return mappedProd;
      });

      const supaIds = new Set(supaProducts.map((p: any) => p.id).concat(supaProducts.map((p: any) => p.slug)));
      const localOnly = localProducts.filter((lp) => !supaIds.has(lp.id) && !supaIds.has(lp.slug));

      const finalResult = [...mapped, ...localOnly];
      cachedProducts = finalResult;
      lastProductsFetchTime = now;

      return NextResponse.json(finalResult);
    }
  } catch (e) {
    console.error("Supabase GET products exception:", e);
  }

  // Fallback to local DB if Supabase is slow or offline
  const products = getProducts();
  return NextResponse.json(products);
}

function isValidUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Helper to filter payload to only columns that exist in the Supabase table
async function getAdaptivePayload(rawProductData: any, isNew: boolean = false, productId?: string) {
  // Try fetching sample row or target row to inspect actual schema keys
  let sampleRow: any = null;
  if (productId) {
    const { data } = await supabase.from("products").select("*").eq("id", productId).single();
    if (data) sampleRow = data;
  }
  if (!sampleRow) {
    const { data } = await supabase.from("products").select("*").limit(1);
    if (data && data.length > 0) sampleRow = data[0];
  }

  const payload: any = {};
  if (isNew && productId && isValidUuid(productId)) {
    payload.id = productId;
  }

  const featuresVal = Array.isArray(rawProductData.features)
    ? rawProductData.features
    : (typeof rawProductData.features === "string"
      ? rawProductData.features.split(",").map((f: string) => f.trim()).filter(Boolean)
      : []);

  if (sampleRow) {
    const keys = new Set(Object.keys(sampleRow));

    if (keys.has("title")) payload.title = rawProductData.title;
    if (keys.has("slug")) payload.slug = rawProductData.slug;
    
    if (keys.has("subtitle")) payload.subtitle = rawProductData.subtitle;
    if (keys.has("sub_title")) payload.sub_title = rawProductData.subtitle;
    if (keys.has("subTitle")) payload.subTitle = rawProductData.subtitle;

    if (keys.has("description")) payload.description = rawProductData.description;
    if (keys.has("desc")) payload.desc = rawProductData.description;

    if (keys.has("category")) payload.category = rawProductData.category;
    if (keys.has("cat")) payload.cat = rawProductData.category;

    if (keys.has("pricing_type")) payload.pricing_type = rawProductData.pricingType;
    if (keys.has("pricingType")) payload.pricingType = rawProductData.pricingType;
    if (keys.has("pricing")) payload.pricing = rawProductData.pricingType;
    if (keys.has("price_type")) payload.price_type = rawProductData.pricingType;
    if (keys.has("type") && !keys.has("category")) payload.type = rawProductData.pricingType;

    if (keys.has("price_egp")) payload.price_egp = rawProductData.priceEgp;
    if (keys.has("priceEgp")) payload.priceEgp = rawProductData.priceEgp;
    if (keys.has("price")) payload.price = rawProductData.priceEgp;

    if (keys.has("original_price_egp")) payload.original_price_egp = rawProductData.originalPriceEgp ?? null;
    if (keys.has("originalPriceEgp")) payload.originalPriceEgp = rawProductData.originalPriceEgp ?? null;
    if (keys.has("original_price")) payload.original_price = rawProductData.originalPriceEgp ?? null;

    if (keys.has("price_usd")) payload.price_usd = rawProductData.priceUsd;
    if (keys.has("priceUsd")) payload.priceUsd = rawProductData.priceUsd;
    if (keys.has("usd_price")) payload.usd_price = rawProductData.priceUsd;

    if (keys.has("badge")) payload.badge = rawProductData.badge;
    if (keys.has("tag")) payload.tag = rawProductData.badge;
    if (keys.has("label")) payload.label = rawProductData.badge;

    if (keys.has("compatibility")) payload.compatibility = rawProductData.compatibility;
    if (keys.has("specs")) payload.specs = rawProductData.compatibility;

    if (keys.has("version")) payload.version = rawProductData.version;
    if (keys.has("ver")) payload.ver = rawProductData.version;

    if (keys.has("features")) payload.features = featuresVal;

    if (keys.has("file_url")) payload.file_url = rawProductData.fileUrl;
    if (keys.has("fileUrl")) payload.fileUrl = rawProductData.fileUrl;
    if (keys.has("fileurl")) payload.fileurl = rawProductData.fileUrl;
    if (keys.has("download_url")) payload.download_url = rawProductData.fileUrl;
    if (keys.has("downloadUrl")) payload.downloadUrl = rawProductData.fileUrl;
    if (keys.has("download_link")) payload.download_link = rawProductData.fileUrl;
    if (keys.has("file_path")) payload.file_path = rawProductData.fileUrl;
    if (keys.has("file")) payload.file = rawProductData.fileUrl;
    if (keys.has("url")) payload.url = rawProductData.fileUrl;

    if (keys.has("cover_image")) payload.cover_image = rawProductData.coverImage;
    if (keys.has("coverImage")) payload.coverImage = rawProductData.coverImage;
    if (keys.has("image")) payload.image = rawProductData.coverImage;
    if (keys.has("gallery")) payload.gallery = rawProductData.gallery || [];

    if (keys.has("is_external_author")) payload.is_external_author = Boolean(rawProductData.isExternalAuthor);
    if (keys.has("isExternalAuthor")) payload.isExternalAuthor = Boolean(rawProductData.isExternalAuthor);

    if (keys.has("author_name")) payload.author_name = rawProductData.authorName ?? "";
    if (keys.has("authorName")) payload.authorName = rawProductData.authorName ?? "";

    if (keys.has("author_link")) payload.author_link = rawProductData.authorLink ?? "";
    if (keys.has("authorLink")) payload.authorLink = rawProductData.authorLink ?? "";

    if (keys.has("sort_order")) payload.sort_order = Number(rawProductData.sortOrder ?? 0);
    if (keys.has("sortOrder")) payload.sortOrder = Number(rawProductData.sortOrder ?? 0);

    if (keys.has("is_hidden")) payload.is_hidden = Boolean(rawProductData.isHidden);
    if (keys.has("isHidden")) payload.isHidden = Boolean(rawProductData.isHidden);
  } else {
    // Standard default payload if sample row is null
    payload.title = rawProductData.title;
    payload.slug = rawProductData.slug;
    payload.subtitle = rawProductData.subtitle;
    payload.description = rawProductData.description;
    payload.category = rawProductData.category;
    payload.pricing_type = rawProductData.pricingType;
    payload.pricingType = rawProductData.pricingType;
    payload.price_egp = rawProductData.priceEgp;
    payload.original_price_egp = rawProductData.originalPriceEgp ?? null;
    payload.price_usd = rawProductData.priceUsd;
    payload.badge = rawProductData.badge;
    payload.compatibility = rawProductData.compatibility;
    payload.version = rawProductData.version;
    payload.features = featuresVal;
    payload.cover_image = rawProductData.coverImage;
    payload.gallery = rawProductData.gallery || [];
    payload.file_url = rawProductData.fileUrl;
    payload.fileUrl = rawProductData.fileUrl;
    payload.download_url = rawProductData.fileUrl;
    payload.file = rawProductData.fileUrl;
    payload.is_external_author = Boolean(rawProductData.isExternalAuthor);
    payload.isExternalAuthor = Boolean(rawProductData.isExternalAuthor);
    payload.author_name = rawProductData.authorName ?? "";
    payload.authorName = rawProductData.authorName ?? "";
    payload.author_link = rawProductData.authorLink ?? "";
    payload.authorLink = rawProductData.authorLink ?? "";
    payload.sort_order = Number(rawProductData.sortOrder ?? 0);
    payload.sortOrder = Number(rawProductData.sortOrder ?? 0);
    payload.is_hidden = Boolean(rawProductData.isHidden);
    payload.isHidden = Boolean(rawProductData.isHidden);
  }

  return payload;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminPassword, action, productData, productId } = body;

    const settings = getStoreSettings();
    if (adminPassword !== settings.adminPasswordHash) {
      return NextResponse.json({ error: "Unauthorized: Invalid Admin Password" }, { status: 401 });
    }

    if (action === "add") {
      const newProd = addProduct(productData);
      const adaptivePayload = await getAdaptivePayload(newProd, true, newProd.id);

      const { error: supaErr } = await supabase.from("products").insert([adaptivePayload]);

      if (supaErr) {
        console.warn("Primary Supabase insert warning:", supaErr.message);
        const fallbackPayload = { ...adaptivePayload };
        delete fallbackPayload.id;

        if (Array.isArray(fallbackPayload.features)) {
          fallbackPayload.features = fallbackPayload.features.join(", ");
        }

        const { error: supaErr2 } = await supabase.from("products").insert([fallbackPayload]);
        if (supaErr2) {
          console.warn("Secondary Supabase insert warning:", supaErr2.message);
        }
      }

      invalidateProductsCache();
      return NextResponse.json({ success: true, product: newProd });
    }

    if (action === "update" && productId) {
      // 1. Update in local storage
      const updated = updateProduct(productId, productData);

      // 2. Dynamically build adaptive payload matching exact existing columns in Supabase
      const adaptivePayload = await getAdaptivePayload(productData, false, productId);

      let supaErr = (await supabase.from("products").update(adaptivePayload).eq("id", productId)).error;

      if (supaErr) {
        // Retry update by slug if id is UUID column mismatch
        supaErr = (await supabase.from("products").update(adaptivePayload).eq("slug", updated.slug)).error;
      }

      if (supaErr) {
        console.warn("Primary Supabase update warning:", supaErr.message);

        // Fallback retry with features as string if column type is text
        const fallbackPayload = { ...adaptivePayload };
        if (Array.isArray(fallbackPayload.features)) {
          fallbackPayload.features = fallbackPayload.features.join(", ");
        }

        const { error: supaErr2 } = await supabase.from("products").update(fallbackPayload).eq("slug", updated.slug);
        if (supaErr2) {
          console.warn("Secondary Supabase update warning:", supaErr2.message);
        }
      }

      invalidateProductsCache();
      return NextResponse.json({ success: true, product: updated });
    }

    if (action === "delete" && productId) {
      deleteProduct(productId);

      // Delete from Supabase
      const { error: supaErr } = await supabase.from("products").delete().eq("id", productId);
      if (supaErr) {
        console.error("Supabase product delete error:", supaErr);
      }

      invalidateProductsCache();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
