import { NextResponse } from "next/server";
import { getOrders, getStoreSettings, deleteOrder, deleteAllOrders } from "@/lib/store-db";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { adminPassword, action, orderId } = body;
    const settings = getStoreSettings();

    if (adminPassword !== settings.adminPasswordHash) {
      return NextResponse.json({ error: "Unauthorized: Invalid Admin Password" }, { status: 401 });
    }

    // Handle delete single order
    if (action === "delete" && orderId) {
      deleteOrder(orderId);
      try {
        if (orderId.startsWith("free_")) {
          const rawId = orderId.replace("free_", "");
          await supabase.from("free_downloads").delete().eq("id", rawId);
        } else {
          await supabase.from("orders").delete().eq("id", orderId);
        }
      } catch (e) {}
      return NextResponse.json({ success: true, message: "Order deleted successfully!" });
    }

    // Handle delete all orders
    if (action === "deleteAll") {
      const count = deleteAllOrders();
      try {
        await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        await supabase.from("free_downloads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      } catch (e) {}
      return NextResponse.json({ success: true, message: `Successfully deleted all ${count} orders!` });
    }

    let allOrders: any[] = [];
    const seenOrderKeys = new Set<string>();

    // 1. Fetch products map for looking up title & slug
    const productMap = new Map<string, any>();
    try {
      const { data: supaProds } = await supabase.from("products").select("*");
      if (supaProds && Array.isArray(supaProds)) {
        supaProds.forEach((p: any) => {
          if (p.id) productMap.set(p.id, p);
          if (p.slug) productMap.set(p.slug, p);
        });
      }
    } catch (e) {}

    // 2. Query Supabase orders table
    try {
      const { data: supaOrders, error: ordersErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!ordersErr && supaOrders && supaOrders.length > 0) {
        supaOrders.forEach((o: any) => {
          const prod = productMap.get(o.product_id) || productMap.get(o.product_slug);
          const mapped = {
            id: o.id,
            productId: o.product_id || o.productId || o.product_slug || "",
            productTitle: o.product_title || o.productTitle || (prod ? prod.title : "Digital Tool"),
            productPrice: Number(o.final_price ?? o.product_price ?? o.productPrice ?? 0),
            finalPrice: Number(o.final_price ?? o.product_price ?? o.productPrice ?? 0),
            pricingType: o.pricing_type || (Number(o.final_price || 0) === 0 ? "free" : "paid"),
            customerName: o.customer_name || o.customerName || (o.customer_email ? o.customer_email.split("@")[0] : "Customer"),
            customerEmail: o.customer_email || o.customerEmail || "",
            customerPhone: o.customer_phone || o.customerPhone || "-",
            senderNumber: o.sender_number || o.senderNumber || o.payment_method || "FREE_DOWNLOAD",
            paymentMethod: o.payment_method || o.paymentMethod || "instapay",
            screenshotUrl: o.payment_screenshot || o.screenshot_url || o.screenshotUrl || "",
            planId: o.plan_id || o.planId,
            planName: o.plan_name || o.planName,
            status: o.status || "approved",
            couponCode: o.discount_code || o.coupon_code || o.couponCode,
            discountAmount: Number(o.discount_amount || o.discountAmount || 0),
            downloadToken: o.download_token || o.downloadToken,
            tokenExpiresAt: o.token_expires_at || o.tokenExpiresAt,
            createdAt: o.created_at || o.createdAt,
            approvedAt: o.approved_at || o.approvedAt,
          };
          const dedupKey = `${mapped.customerEmail}_${mapped.productId}_${mapped.createdAt}`;
          seenOrderKeys.add(dedupKey);
          seenOrderKeys.add(mapped.id);
          allOrders.push(mapped);
        });
      }
    } catch (e) {}

    // 3. Query Supabase free_downloads table (where free downloads are logged)
    try {
      const { data: supaFree, error: freeErr } = await supabase
        .from("free_downloads")
        .select("*")
        .order("created_at", { ascending: false });

      if (!freeErr && supaFree && supaFree.length > 0) {
        supaFree.forEach((f: any) => {
          const freeId = `free_${f.id}`;
          const email = f.email || f.customer_email || "";
          const prodId = f.product_id || f.productId || "";
          const createdAt = f.created_at || f.createdAt || "";
          const dedupKey = `${email}_${prodId}_${createdAt}`;

          if (!seenOrderKeys.has(freeId) && !seenOrderKeys.has(dedupKey)) {
            const prod = productMap.get(prodId);
            seenOrderKeys.add(freeId);
            seenOrderKeys.add(dedupKey);
            allOrders.push({
              id: freeId,
              productId: prodId,
              productTitle: prod ? prod.title : "Digital Tool",
              productPrice: 0,
              finalPrice: 0,
              pricingType: "free",
              customerName: f.customer_name || (email ? email.split("@")[0] : "Free Customer"),
              customerEmail: email,
              customerPhone: f.customer_phone || "-",
              senderNumber: "FREE_DOWNLOAD",
              paymentMethod: "instapay",
              screenshotUrl: "",
              status: "approved",
              createdAt: createdAt,
            });
          }
        });
      }
    } catch (e) {}

    // 4. Merge local DB fallback orders if any exist and sync them to Supabase
    const localOrders = getOrders();
    if (localOrders && localOrders.length > 0) {
      localOrders.forEach((lo) => {
        const dedupKey = `${lo.customerEmail}_${lo.productId}_${lo.createdAt}`;
        if (!seenOrderKeys.has(lo.id) && !seenOrderKeys.has(dedupKey)) {
          seenOrderKeys.add(lo.id);
          seenOrderKeys.add(dedupKey);
          allOrders.push(lo);
        }
      });

      // Async background migration of local JSON orders to Supabase free_downloads
      (async () => {
        try {
          for (const lo of localOrders) {
            const isFree = lo.pricingType === "free" || (lo.finalPrice || lo.productPrice || 0) === 0;
            if (isFree && lo.customerEmail) {
              try {
                await supabase.from("free_downloads").insert([
                  {
                    email: lo.customerEmail,
                    product_id: lo.productId && lo.productId.length === 36 ? lo.productId : undefined,
                    created_at: lo.createdAt || new Date().toISOString(),
                  },
                ]);
              } catch (e) {}
            }
          }
        } catch (e) {}
      })();
    }

    // Sort all combined orders newest first
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, orders: allOrders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
