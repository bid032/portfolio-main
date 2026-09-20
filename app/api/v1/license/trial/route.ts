import { NextRequest, NextResponse } from "next/server";
import { requestFreeTrial } from "@/lib/license-engine";
import { sendLicenseEmail } from "@/lib/email-service";
import { getProducts } from "@/lib/store-db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body.email || body.userEmail;
    const product = body.product || body.productId;
    const device_id = body.device_id || body.deviceFingerprint || `dev_web_${Date.now()}`;
    const installation_id = body.installation_id || `inst_${Date.now()}`;
    const device_name = body.device_name || body.deviceName || "Client Device";
    const platform = body.platform || "Web / Desktop";

    if (!email || !product) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: email and product are required.",
          errorCode: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    // Verify product is a paid tool
    const products = getProducts();
    const prodObj = products.find((p) => p.id === product || p.slug === product);
    if (prodObj && (prodObj.pricingType === "free" || prodObj.priceEgp === 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "Free products do not require a license key. You can download them directly for free.",
          errorCode: "FREE_PRODUCT_NO_LICENSE",
        },
        { status: 400 }
      );
    }

    const result = requestFreeTrial({
      userEmail: email,
      productId: product,
      fingerprintHash: device_id,
      installationId: installation_id,
      deviceName: device_name,
      platform,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          errorCode: result.errorCode,
        },
        { status: 400 }
      );
    }

    const prodTitle = prodObj ? prodObj.title : product;

    // Resolve extension download link for email (works locally and online dynamically)
    let downloadUrl: string | undefined = prodObj?.fileUrl || (prodObj as any)?.downloadUrl;
    if (downloadUrl && !downloadUrl.startsWith("http") && !downloadUrl.startsWith("//")) {
      const host = req.headers.get("host") || "";
      const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      
      let baseUrl = "";
      if (host) {
        baseUrl = `${proto}://${host}`;
      } else {
        const { getStoreSettings } = await import("@/lib/store-db");
        const settings = getStoreSettings();
        baseUrl = settings.siteUrl || "https://bid032.com";
      }
      
      downloadUrl = `${baseUrl.replace(/\/$/, "")}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
    }

    // Trigger automated email delivery containing license key & extension link
    if (result.rawLicenseKey && result.license) {
      await sendLicenseEmail({
        toEmail: email,
        customerName: body.customerName || body.name || body.userName,
        productName: prodTitle,
        rawLicenseKey: result.rawLicenseKey,
        planName: "3-Day Free Trial",
        expiresAt: result.license.expiresAt || "Pending Activation",
        isTrial: true,
        downloadUrl,
      });
    }

    return NextResponse.json({
      success: true,
      rawLicenseKey: result.rawLicenseKey,
      license_key: result.rawLicenseKey,
      status: result.license?.status,
      product: result.license?.productId,
      plan: result.license?.planId,
      starts_at: result.license?.startsAt,
      expires_at: result.license?.expiresAt,
      attestation: result.attestation,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error", errorCode: "SERVER_ERROR" }, { status: 500 });
  }
}
