import { NextResponse } from "next/server";
import { getCoupons, addCoupon, updateCoupon, toggleCouponActive, deleteCoupon, validateCoupon, getStoreSettings } from "@/lib/store-db";
import { supabase } from "@/lib/supabase";

// GET: Validate a coupon or list all coupons (for Admin)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const amountStr = searchParams.get("amount");
  const productId = searchParams.get("productId");

  if (code && amountStr) {
    const amount = Number(amountStr) || 0;
    
    // Check Supabase coupons table first for real-time validation
    try {
      const { data: supaCoupons } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.toUpperCase().trim())
        .limit(1);

      if (supaCoupons && supaCoupons.length > 0) {
        const found = supaCoupons[0];
        const isActive = found.is_active ?? found.isActive ?? true;
        const usedCount = found.used_count ?? found.usedCount ?? 0;
        const maxUses = found.max_uses ?? found.maxUses;
        const minOrderAmount = found.min_order_amount ?? found.minOrderAmount;
        const discountType = found.discount_type ?? found.discountType;
        const discountValue = found.discount_value ?? found.discountValue;
        const applicableProductId = found.applicable_product_id ?? found.applicableProductId ?? found.productId ?? "all";

        if (!isActive) {
          return NextResponse.json({ valid: false, discountAmount: 0, message: "This coupon code is currently disabled." });
        }
        if (applicableProductId && applicableProductId !== "all" && productId && applicableProductId !== productId) {
          return NextResponse.json({ valid: false, discountAmount: 0, message: "This coupon is not valid for this product." });
        }
        if (maxUses && usedCount >= maxUses) {
          return NextResponse.json({ valid: false, discountAmount: 0, message: "This coupon has reached its maximum usage limit." });
        }
        if (minOrderAmount && amount < minOrderAmount) {
          return NextResponse.json({ valid: false, discountAmount: 0, message: `Coupon requires a minimum order of ${minOrderAmount} EGP.` });
        }

        let discountAmount = 0;
        if (discountType === "percentage") {
          discountAmount = Math.round((amount * discountValue) / 100);
        } else {
          discountAmount = Math.min(discountValue, amount);
        }

        return NextResponse.json({
          valid: true,
          coupon: {
            id: found.id,
            code: found.code,
            discountType,
            discountValue,
            minOrderAmount,
            maxUses,
            usedCount,
            applicableProductId,
            isActive
          },
          discountAmount
        });
      }
    } catch (e) {}

    // Fallback validation
    const result = validateCoupon(code, amount, productId || undefined);
    return NextResponse.json(result);
  }

  // List all coupons (Admin)
  try {
    const { data: supaCoupons, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (!error && supaCoupons && supaCoupons.length > 0) {
      const mappedCoupons = supaCoupons.map((c: any) => ({
        id: c.id,
        code: c.code,
        discountType: c.discount_type || c.discountType,
        discountValue: c.discount_value || c.discountValue,
        minOrderAmount: c.min_order_amount || c.minOrderAmount || 0,
        maxUses: c.max_uses || c.maxUses || 0,
        usedCount: c.used_count || c.usedCount || 0,
        applicableProductId: c.applicable_product_id || c.applicableProductId || c.productId || "all",
        isActive: c.is_active ?? c.isActive ?? true,
        createdAt: c.created_at || c.createdAt
      }));
      return NextResponse.json(mappedCoupons);
    }
  } catch (e) {}

  const coupons = getCoupons();
  return NextResponse.json(coupons);
}

// POST: Manage coupons (Add / Update / Toggle / Delete)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminPassword, action, couponData, couponId } = body;

    const settings = getStoreSettings();
    if (adminPassword !== settings.adminPasswordHash) {
      return NextResponse.json({ error: "Unauthorized: Invalid Admin Password" }, { status: 401 });
    }

    if (action === "add" && couponData) {
      const newCoupon = addCoupon(couponData);

      // Sync to Supabase with adaptive column mapping
      try {
        let sampleRow: any = null;
        const { data } = await supabase.from("coupons").select("*").limit(1);
        if (data && data.length > 0) sampleRow = data[0];

        const payload: any = {
          id: newCoupon.id,
          code: newCoupon.code,
          created_at: newCoupon.createdAt,
          createdAt: newCoupon.createdAt
        };

        if (sampleRow) {
          const keys = new Set(Object.keys(sampleRow));
          if (keys.has("discount_type")) payload.discount_type = newCoupon.discountType;
          if (keys.has("discountType")) payload.discountType = newCoupon.discountType;

          if (keys.has("discount_value")) payload.discount_value = newCoupon.discountValue;
          if (keys.has("discountValue")) payload.discountValue = newCoupon.discountValue;

          if (keys.has("min_order_amount")) payload.min_order_amount = newCoupon.minOrderAmount;
          if (keys.has("minOrderAmount")) payload.minOrderAmount = newCoupon.minOrderAmount;

          if (keys.has("max_uses")) payload.max_uses = newCoupon.maxUses;
          if (keys.has("maxUses")) payload.maxUses = newCoupon.maxUses;

          if (keys.has("used_count")) payload.used_count = newCoupon.usedCount;
          if (keys.has("usedCount")) payload.usedCount = newCoupon.usedCount;

          if (keys.has("applicable_product_id")) payload.applicable_product_id = newCoupon.applicableProductId || "all";
          if (keys.has("applicableProductId")) payload.applicableProductId = newCoupon.applicableProductId || "all";

          if (keys.has("is_active")) payload.is_active = newCoupon.isActive;
          if (keys.has("isActive")) payload.isActive = newCoupon.isActive;
        } else {
          payload.discount_type = newCoupon.discountType;
          payload.discount_value = newCoupon.discountValue;
          payload.min_order_amount = newCoupon.minOrderAmount;
          payload.max_uses = newCoupon.maxUses;
          payload.used_count = newCoupon.usedCount;
          payload.applicable_product_id = newCoupon.applicableProductId || "all";
          payload.is_active = newCoupon.isActive;
        }

        await supabase.from("coupons").insert([payload]);
      } catch (e) {}

      return NextResponse.json({ success: true, coupon: newCoupon });
    }

    if (action === "update" && couponId && couponData) {
      const updated = updateCoupon(couponId, couponData);

      // Sync to Supabase
      try {
        let sampleRow: any = null;
        const { data } = await supabase.from("coupons").select("*").limit(1);
        if (data && data.length > 0) sampleRow = data[0];

        const payload: any = {};
        if (couponData.code) payload.code = couponData.code.toUpperCase().trim();

        if (sampleRow) {
          const keys = new Set(Object.keys(sampleRow));
          if (keys.has("discount_type")) payload.discount_type = couponData.discountType;
          if (keys.has("discountType")) payload.discountType = couponData.discountType;

          if (keys.has("discount_value")) payload.discount_value = couponData.discountValue;
          if (keys.has("discountValue")) payload.discountValue = couponData.discountValue;

          if (keys.has("min_order_amount")) payload.min_order_amount = couponData.minOrderAmount;
          if (keys.has("minOrderAmount")) payload.minOrderAmount = couponData.minOrderAmount;

          if (keys.has("max_uses")) payload.max_uses = couponData.maxUses;
          if (keys.has("maxUses")) payload.maxUses = couponData.maxUses;

          if (keys.has("applicable_product_id")) payload.applicable_product_id = couponData.applicableProductId || "all";
          if (keys.has("applicableProductId")) payload.applicableProductId = couponData.applicableProductId || "all";
        } else {
          payload.discount_type = couponData.discountType;
          payload.discount_value = couponData.discountValue;
          payload.min_order_amount = couponData.minOrderAmount;
          payload.max_uses = couponData.maxUses;
          payload.applicable_product_id = couponData.applicableProductId || "all";
        }

        await supabase.from("coupons").update(payload).eq("id", couponId);
      } catch (e) {}

      return NextResponse.json({ success: true, coupon: updated });
    }

    if (action === "toggle" && couponId) {
      const toggled = toggleCouponActive(couponId);

      if (toggled) {
        try {
          let sampleRow: any = null;
          const { data } = await supabase.from("coupons").select("*").limit(1);
          if (data && data.length > 0) sampleRow = data[0];

          const payload: any = {};
          if (!sampleRow || sampleRow.hasOwnProperty("is_active")) payload.is_active = toggled.isActive;
          if (!sampleRow || sampleRow.hasOwnProperty("isActive")) payload.isActive = toggled.isActive;

          await supabase.from("coupons").update(payload).eq("id", couponId);
        } catch (e) {}
      }

      return NextResponse.json({ success: true, coupon: toggled });
    }

    if (action === "delete" && couponId) {
      deleteCoupon(couponId);

      try {
        await supabase.from("coupons").delete().eq("id", couponId);
      } catch (e) {}

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
