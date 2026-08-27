import { NextResponse } from "next/server";
import { getOrderById, getProductById, getLicenses, getPlans } from "@/lib/store-db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId") || searchParams.get("id");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = getOrderById(orderId);

    if (!order) {
      // Check if orderId matches a license ID (e.g. trial issued directly)
      const licenses = getLicenses();
      const lic = licenses.find((l) => l.id === orderId);
      if (lic) {
        const prod = getProductById(lic.productId);
        const plans = getPlans();
        const plan = plans.find((p) => p.id === lic.planId);
        
        // Build origin host url
        const origin = req.headers.get("origin") || req.headers.get("referer");
        let hostUrl = "";
        if (origin) {
          try {
            hostUrl = new URL(origin).origin;
          } catch (e) {}
        }

        const downloadUrl = hostUrl
          ? `${hostUrl}/api/store/download?productId=${lic.productId}`
          : `/api/store/download?productId=${lic.productId}`;

        return NextResponse.json({
          success: true,
          order: {
            id: lic.id,
            productTitle: prod ? prod.title : "Digital Asset",
            productId: lic.productId,
            planName: plan ? plan.name : "Free Trial Plan",
            finalPrice: 0,
            pricingType: "free",
            customerName: "Valued Customer",
            customerEmail: lic.userEmail,
            customerPhone: "",
            status: "approved",
            createdAt: lic.createdAt,
            licenseKey: lic.rawLicenseKey || `Key-Ending-${lic.licenseKeyLast4}`,
            downloadUrl,
          },
        });
      }

      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const prod = getProductById(order.productId);
    
    // Resolve origin for download link
    const origin = req.headers.get("origin") || req.headers.get("referer");
    let hostUrl = "";
    if (origin) {
      try {
        hostUrl = new URL(origin).origin;
      } catch (e) {}
    }

    let downloadUrl = "";
    if (order.status === "approved" || order.pricingType === "free") {
      if (order.downloadToken) {
        downloadUrl = hostUrl
          ? `${hostUrl}/api/store/download?token=${order.downloadToken}`
          : `/api/store/download?token=${order.downloadToken}`;
      } else {
        downloadUrl = hostUrl
          ? `${hostUrl}/api/store/download?orderId=${order.id}`
          : `/api/store/download?orderId=${order.id}`;
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        productId: order.productId,
        productTitle: order.productTitle || (prod ? prod.title : "Digital Product"),
        planName: order.planName || "Standard License",
        finalPrice: order.finalPrice !== undefined ? order.finalPrice : order.productPrice,
        pricingType: order.pricingType,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        paymentMethod: order.paymentMethod,
        senderNumber: order.senderNumber,
        status: order.status,
        createdAt: order.createdAt,
        licenseKey: order.licenseKey,
        downloadUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
