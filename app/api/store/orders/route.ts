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
      return NextResponse.json({ success: true, message: "Order deleted successfully!" });
    }

    // Handle delete all orders
    if (action === "deleteAll") {
      const count = deleteAllOrders();
      return NextResponse.json({ success: true, message: `Successfully deleted all ${count} orders!` });
    }

    // Query Supabase first
    try {
      const { data: supaOrders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && supaOrders && supaOrders.length > 0) {
        const mappedOrders = supaOrders.map((o: any) => ({
          id: o.id,
          productId: o.product_id || o.productId,
          productTitle: o.product_title || o.productTitle,
          productPrice: o.product_price || o.productPrice || 0,
          pricingType: o.pricing_type || o.pricingType || "paid",
          customerName: o.customer_name || o.customerName,
          customerEmail: o.customer_email || o.customerEmail,
          customerPhone: o.customer_phone || o.customerPhone,
          senderNumber: o.sender_number || o.senderNumber,
          paymentMethod: o.payment_method || o.paymentMethod || "instapay",
          screenshotUrl: o.screenshot_url || o.screenshotUrl || "",
          planId: o.plan_id || o.planId,
          planName: o.plan_name || o.planName,
          status: o.status || "pending",
          couponCode: o.coupon_code || o.couponCode,
          discountAmount: o.discount_amount || o.discountAmount || 0,
          downloadToken: o.download_token || o.downloadToken,
          tokenExpiresAt: o.token_expires_at || o.tokenExpiresAt,
          createdAt: o.created_at || o.createdAt,
          approvedAt: o.approved_at || o.approvedAt,
        }));

        return NextResponse.json({ success: true, orders: mappedOrders });
      }
    } catch (e) {}

    // Fallback to local DB if Supabase table is not yet populated
    const orders = getOrders();
    return NextResponse.json({ success: true, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
