import { NextResponse } from "next/server";
import { addOrder, getProductById, getStoreSettings, updateOrderStatus, mapSupabaseProduct, getSiteUrl } from "@/lib/store-db";
import { sendEmail } from "@/lib/mailer";
import { generateDownloadToken } from "@/lib/token";
import { generateAdminOrderEmail } from "@/lib/email-templates";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const productId = formData.get("productId") as string;
    const customerName = formData.get("customerName") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const senderNumber = (formData.get("senderNumber") as string) || "";
    const couponCode = (formData.get("couponCode") as string) || undefined;
    const discountAmount = Number(formData.get("discountAmount")) || 0;
    const paymentMethod = (formData.get("paymentMethod") as "instapay" | "wallet") || "instapay";
    const screenshotFile = formData.get("screenshot") as File | null;
    const planId = (formData.get("planId") as string) || undefined;
    const rawPassedFinalPrice = formData.get("finalPrice");
    const passedFinalPrice = rawPassedFinalPrice !== null ? Number(rawPassedFinalPrice) : null;

    const localProduct = getProductById(productId);
    let product = localProduct;

    // Fetch directly from Supabase to guarantee fetching the exact live row and columns (id or slug)
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`id.eq.${productId},slug.eq.${productId}`)
        .single();
      if (data) {
        const supaProd = mapSupabaseProduct(data);
        product = localProduct
          ? {
              ...supaProd,
              ...localProduct,
              fileUrl: localProduct.fileUrl || supaProd.fileUrl,
            }
          : supaProd;
      }
    } catch (e) { }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Look up plan price if planId is selected
    let selectedPlanPrice: number | null = null;
    let selectedPlanName = "Direct Lifetime Access";
    if (planId && planId !== "direct") {
      try {
        const { getPlans } = await import("@/lib/store-db");
        const allPlans = getPlans();
        const foundPlan = allPlans.find((p: any) => p.id === planId);
        if (foundPlan) {
          selectedPlanPrice = Number(foundPlan.priceEgp);
          selectedPlanName = `${foundPlan.name} (${foundPlan.durationDays > 3000 ? "Lifetime" : `${foundPlan.durationDays} Days`})`;
        }
      } catch (e) { }
    }

    const basePriceEgp = selectedPlanPrice !== null ? selectedPlanPrice : product.priceEgp;
    const finalPrice = passedFinalPrice !== null && !isNaN(passedFinalPrice)
      ? Math.max(0, passedFinalPrice)
      : Math.max(0, basePriceEgp - discountAmount);

    const isFree = finalPrice === 0 && (product.pricingType === "free" && basePriceEgp === 0);
    const finalSenderNumber = senderNumber || (isFree ? "FREE_DOWNLOAD" : "");

    if (!productId || !customerName || !customerEmail || !customerPhone || (!isFree && !finalSenderNumber)) {
      return NextResponse.json({ error: "Please fill in all required customer details." }, { status: 400 });
    }

    let screenshotUrl = "/assets/proofs/placeholder.png";
    let screenshotBuffer: Buffer | null = null;

    if (screenshotFile && screenshotFile.size > 0) {
      try {
        screenshotBuffer = Buffer.from(await screenshotFile.arrayBuffer());
        const ext = (screenshotFile.name || "proof.png").split(".").pop() || "png";
        const fileName = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const proofsDir = path.join(process.cwd(), "public", "assets", "proofs");
        if (!fs.existsSync(proofsDir)) {
          fs.mkdirSync(proofsDir, { recursive: true });
        }
        const filePath = path.join(proofsDir, fileName);
        fs.writeFileSync(filePath, screenshotBuffer);
        screenshotUrl = `/assets/proofs/${fileName}`;
      } catch (e) {
        if (screenshotBuffer) {
          const base64 = screenshotBuffer.toString("base64");
          const mimeType = screenshotFile.type || "image/png";
          screenshotUrl = `data:${mimeType};base64,${base64}`;
        }
      }
    }

    const newOrder = addOrder({
      productId: product.id,
      productTitle: product.title,
      planId: planId,
      planName: selectedPlanName,
      productPrice: basePriceEgp,
      discountAmount: discountAmount,
      finalPrice: finalPrice,
      pricingType: isFree ? "free" : "paid",
      customerName,
      customerEmail,
      customerPhone,
      senderNumber: finalSenderNumber,
      paymentMethod,
      screenshotUrl,
      couponCode,
    });

    let downloadUrl: string | undefined = undefined;
    let freeLicenseKey: string | undefined = undefined;

    const settings = getStoreSettings();

    if (isFree) {
      const { issueLicense } = await import("@/lib/license-engine");
      const { rawLicenseKey, license } = issueLicense({
        userEmail: customerEmail,
        productId: product.id,
        planId: planId || "plan_default",
        actorId: "checkout_free",
      });

      freeLicenseKey = rawLicenseKey;
      newOrder.licenseKey = rawLicenseKey;

      const token = generateDownloadToken(newOrder.id, product.id, customerEmail);
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      updateOrderStatus(newOrder.id, "approved", token, expiresAt);
      downloadUrl = `/api/store/download?token=${token}`;

      const { generateCustomerFreeDownloadEmail } = await import("@/lib/email-templates");
      const expiresAtDate = license.expiresAt
        ? new Date(license.expiresAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : `Starts on 1st Activation (${license.durationValue || license.durationDays || 30} ${license.durationUnit || "days"})`;

      // Send Instant Free Download & License Key Email to Customer
      sendEmail({
        to: customerEmail,
        subject: `Your Free Download & License Key for ${product.title}`,
        html: generateCustomerFreeDownloadEmail({
          customerName,
          productTitle: product.title,
          downloadLink: `${getSiteUrl(req)}${downloadUrl}`,
          licenseKey: rawLicenseKey,
          planName: selectedPlanName,
          expiresAt: expiresAtDate,
          maxDevices: license.maxDevices,
        }),
      }).catch(() => { });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || settings.adminEmail || "bid032art@gmail.com";

    // Prepare attachments with CID inline reference for email
    const attachments = [];
    const screenshotCid = "transfer_proof_image";
    if (screenshotBuffer) {
      attachments.push({
        filename: screenshotFile?.name || `transfer_proof_${Date.now()}.png`,
        content: screenshotBuffer,
        contentType: screenshotFile?.type || "image/png",
        cid: screenshotCid,
      });
    }

    const fullScreenshotUrl = screenshotUrl.startsWith("data:") || screenshotUrl.startsWith("http")
      ? screenshotUrl
      : `${settings.siteUrl}${screenshotUrl}`;

    // Send Notification Email to Admin
    sendEmail({
      to: adminEmail,
      subject: `[Order Alert] ${isFree ? "Free Item Claimed" : "Action Required"}: ${product.title} - ${customerName}`,
      html: generateAdminOrderEmail({
        isFree,
        productTitle: product.title,
        planName: selectedPlanName,
        originalPriceText: `${basePriceEgp} EGP`,
        totalAmountText: isFree ? "FREE" : `${finalPrice} EGP`,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        senderReference: finalSenderNumber,
        couponCode,
        discountAmount,
        adminDashboardUrl: `${settings.siteUrl}/store/admin`,
        screenshotUrl: isFree ? undefined : fullScreenshotUrl,
        screenshotCid: (isFree || !screenshotBuffer) ? undefined : screenshotCid,
      }),
      attachments: attachments.length > 0 ? attachments : undefined,
    }).catch(() => { });

    return NextResponse.json({
      success: true,
      message: isFree ? "Free download unlocked!" : "Order submitted successfully! Pending admin approval.",
      orderId: newOrder.id,
      isFree,
      downloadUrl
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
