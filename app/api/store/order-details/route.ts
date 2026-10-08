import { NextResponse } from "next/server";
import { getOrderById, getProductById, getLicenses } from "@/lib/store-db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("orderId");

    if (!id) {
      return NextResponse.json({ error: "Order ID parameter is required." }, { status: 400 });
    }

    let order = getOrderById(id);

    if (!order) {
      // Fallback check licenses
      const licenses = getLicenses();
      const lic = licenses.find((l) => l.id === id || l.rawLicenseKey === id);
      if (lic) {
        const prod = getProductById(lic.productId);
        return NextResponse.json({
          success: true,
          order: {
            id: lic.id,
            createdAt: lic.createdAt || new Date().toISOString(),
            status: "approved",
            productId: lic.productId,
            productTitle: prod?.title || lic.productId,
            productPrice: 0,
            finalPrice: 0,
            discountAmount: 0,
            pricingType: "trial",
            customerName: lic.userEmail.split("@")[0],
            customerEmail: lic.userEmail,
            customerPhone: "-",
            senderNumber: "-",
            paymentMethod: "Free Trial",
            planName: "3-Day Free Trial",
            licenseKey: lic.rawLicenseKey,
            productCover: prod?.coverImage || "/Photos/Tools/illustrator.png",
            productSoftware: prod?.software || "Software Application",
            productVersion: prod?.version || "v1.0.0",
          }
        });
      }
      return NextResponse.json({ error: "Order not found or link has expired." }, { status: 404 });
    }

    const product = getProductById(order.productId);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        createdAt: order.createdAt,
        status: order.status,
        productId: order.productId,
        productTitle: order.productTitle,
        productPrice: order.productPrice,
        finalPrice: order.finalPrice !== undefined ? order.finalPrice : order.productPrice,
        discountAmount: order.discountAmount || 0,
        couponCode: order.couponCode,
        pricingType: order.pricingType,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        senderNumber: order.senderNumber,
        paymentMethod: order.paymentMethod,
        planName: order.planName,
        downloadToken: order.status === "approved" ? order.downloadToken : undefined,
        licenseKey: order.status === "approved" ? order.licenseKey : undefined,
        productCover: product?.coverImage || "/Photos/Tools/illustrator.png",
        productSoftware: product?.software || "Software Application",
        productVersion: product?.version || "v1.0.0",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch order details." }, { status: 500 });
  }
}
