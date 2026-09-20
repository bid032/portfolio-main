import { NextResponse } from "next/server";
import { getStoreSettings, updateStoreSettings } from "@/lib/store-db";
import { supabase } from "@/lib/supabase";

let cachedSettingsResponse: any = null;
let lastSettingsFetchTime = 0;
const SETTINGS_CACHE_TTL_MS = 15000;

export async function GET() {
  const settings = getStoreSettings();
  const now = Date.now();

  if (cachedSettingsResponse && now - lastSettingsFetchTime < SETTINGS_CACHE_TTL_MS) {
    return NextResponse.json(cachedSettingsResponse);
  }

  // Query Supabase first with a 1200ms timeout
  try {
    const fetchSupaPromise = supabase.from("settings").select("*").limit(1);
    const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 1200)
    );

    const { data: supaSettings, error } = await Promise.race([fetchSupaPromise, timeoutPromise]);

    if (!error && supaSettings && supaSettings.length > 0) {
      const s = supaSettings[0];
      const result = {
        instapayLink: s.instapay_link || s.instapayLink || settings.instapayLink,
        walletNumber: s.wallet_number || s.walletNumber || settings.walletNumber,
        adminEmail: s.admin_email || s.adminEmail || settings.adminEmail,
        siteUrl: s.site_url || s.siteUrl || settings.siteUrl,
        spotlightProductId: settings.spotlightProductId || s.spotlight_product_id || s.spotlightProductId,
        heroBannerText: settings.heroBannerText || s.hero_banner_text,
        heroBannerEnabled: settings.heroBannerEnabled !== undefined ? settings.heroBannerEnabled : s.hero_banner_enabled,
        usdExchangeRate: settings.usdExchangeRate || s.usd_exchange_rate || 50,
        metaPixelId: settings.metaPixelId || s.meta_pixel_id || s.metaPixelId || "",
      };

      cachedSettingsResponse = result;
      lastSettingsFetchTime = now;

      return NextResponse.json(result);
    }
  } catch (e) {}

  const fallbackResult = {
    instapayLink: settings.instapayLink,
    walletNumber: settings.walletNumber,
    adminEmail: settings.adminEmail,
    siteUrl: settings.siteUrl,
    spotlightProductId: settings.spotlightProductId,
    heroBannerText: settings.heroBannerText,
    heroBannerEnabled: settings.heroBannerEnabled,
    usdExchangeRate: settings.usdExchangeRate || 50,
    metaPixelId: settings.metaPixelId || "",
  };

  return NextResponse.json(fallbackResult);
}

export async function POST(req: Request) {
  try {
    const { adminPassword, instapayLink, walletNumber, newAdminPassword, adminEmail, spotlightProductId, heroBannerText, heroBannerEnabled, usdExchangeRate, metaPixelId } = await req.json();

    const currentSettings = getStoreSettings();

    if (adminPassword !== currentSettings.adminPasswordHash) {
      return NextResponse.json({ error: "Unauthorized: Invalid password" }, { status: 401 });
    }

    const updates: any = {};
    if (instapayLink) updates.instapayLink = instapayLink;
    if (walletNumber) updates.walletNumber = walletNumber;
    if (adminEmail) updates.adminEmail = adminEmail;
    if (newAdminPassword) updates.adminPasswordHash = newAdminPassword;
    if (spotlightProductId !== undefined) updates.spotlightProductId = spotlightProductId;
    if (heroBannerText !== undefined) updates.heroBannerText = heroBannerText;
    if (heroBannerEnabled !== undefined) updates.heroBannerEnabled = heroBannerEnabled;
    if (usdExchangeRate !== undefined) updates.usdExchangeRate = Number(usdExchangeRate);
    if (metaPixelId !== undefined) updates.metaPixelId = metaPixelId.trim();

    const updated = updateStoreSettings(updates);

    // Sync to Supabase settings table
    try {
      await supabase.from("settings").upsert([{
        id: "store_main_settings",
        instapay_link: updated.instapayLink,
        wallet_number: updated.walletNumber,
        admin_email: updated.adminEmail,
        admin_password_hash: updated.adminPasswordHash,
        site_url: updated.siteUrl,
        spotlight_product_id: updated.spotlightProductId,
        hero_banner_text: updated.heroBannerText,
        hero_banner_enabled: updated.heroBannerEnabled,
        usd_exchange_rate: updated.usdExchangeRate,
        meta_pixel_id: updated.metaPixelId,
      }]);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: "Store settings updated successfully!",
      settings: {
        instapayLink: updated.instapayLink,
        walletNumber: updated.walletNumber,
        adminEmail: updated.adminEmail,
        siteUrl: updated.siteUrl,
        spotlightProductId: updated.spotlightProductId,
        heroBannerText: updated.heroBannerText,
        heroBannerEnabled: updated.heroBannerEnabled,
        usdExchangeRate: updated.usdExchangeRate || 50,
        metaPixelId: updated.metaPixelId || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
