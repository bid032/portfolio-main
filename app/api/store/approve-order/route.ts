import { NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, getProductById, getStoreSettings, getSiteUrl } from "@/lib/store-db";
import { generateDownloadToken } from "@/lib/token";
import { sendEmail } from "@/lib/mailer";
import { generateCustomerApprovalEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { orderId, adminPassword } = await req.json();

    const settings = getStoreSettings();

    if (adminPassword !== settings.adminPasswordHash) {
      return NextResponse.json({ error: "Unauthorized: Incorrect Admin Password" }, { status: 401 });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const product = getProductById(order.productId);
    if (!product) {
      return NextResponse.json({ error: "Associated product not found" }, { status: 404 });
    }

    // Issue Software License linked to selected Plan & Product
    const { issueLicense } = await import("@/lib/license-engine");
    const { rawLicenseKey, license } = issueLicense({
      userEmail: order.customerEmail,
      productId: product.id,
      planId: order.planId || "plan_default",
      actorId: "admin",
    });

    order.licenseKey = rawLicenseKey;

    // Generate 1-hour expiring signed token
    const token = generateDownloadToken(order.id, product.id, order.customerEmail);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    updateOrderStatus(order.id, "approved", token, expiresAt);

    // Determine site URL dynamically from env / request
    const siteUrl = getSiteUrl(req);

    const downloadLink = `${siteUrl}/api/store/download?token=${token}`;

    const expiresAtDate = license.expiresAt
      ? new Date(license.expiresAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : `Starts on 1st Activation (${license.durationValue || license.durationDays || 30} ${license.durationUnit || "days"})`;

    // Send Customer Email via cPanel SMTP with 1-hour expiring download link & license key
    const emailRes = await sendEmail({
      to: order.customerEmail,
      subject: `Order Confirmed: Download Access & License Key for ${product.title}`,
      html: generateCustomerApprovalEmail({
        customerName: order.customerName,
        productTitle: product.title,
        downloadLink,
        expirationMinutes: 60,
        licenseKey: rawLicenseKey,
        planName: order.planName || "Standard Plan",
        expiresAt: expiresAtDate,
        maxDevices: license.maxDevices,
      }),
    });

    return NextResponse.json({
      success: true,
      emailSent: emailRes.success,
      emailErrorMsg: emailRes.error || null,
      message: emailRes.success
        ? "Order approved! Download link and License Key sent successfully to customer email via info@bid032.com"
        : `Order approved! (Email note: ${emailRes.error}). Direct download link generated below.`,
      downloadLink,
      rawLicenseKey,
      license,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
