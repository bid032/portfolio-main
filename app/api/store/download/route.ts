import { NextResponse } from "next/server";
import { verifyDownloadToken, generateDownloadToken } from "@/lib/token";
import { getProductById } from "@/lib/store-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Lightweight zip archive builder in pure Node Buffer
 */
function createZipBuffer(filename: string, contentBuffer: Buffer): Buffer {
  const nameBuf = Buffer.from(filename, "utf-8");
  const date = new Date();
  const dosTime = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xffff;
  const dosDate = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;

  let crc = 0xffffffff;
  for (let i = 0; i < contentBuffer.length; i++) {
    crc ^= contentBuffer[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  crc = (crc ^ 0xffffffff) >>> 0;

  const localHeader = Buffer.alloc(30 + nameBuf.length);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(0, 6);
  localHeader.writeUInt16LE(0, 8);
  localHeader.writeUInt16LE(dosTime, 10);
  localHeader.writeUInt16LE(dosDate, 12);
  localHeader.writeUInt32LE(crc, 14);
  localHeader.writeUInt32LE(contentBuffer.length, 18);
  localHeader.writeUInt32LE(contentBuffer.length, 22);
  localHeader.writeUInt16LE(nameBuf.length, 26);
  localHeader.writeUInt16LE(0, 28);
  nameBuf.copy(localHeader, 30);

  const cdHeader = Buffer.alloc(46 + nameBuf.length);
  cdHeader.writeUInt32LE(0x02014b50, 0);
  cdHeader.writeUInt16LE(20, 4);
  cdHeader.writeUInt16LE(20, 6);
  cdHeader.writeUInt16LE(0, 8);
  cdHeader.writeUInt16LE(0, 10);
  cdHeader.writeUInt16LE(dosTime, 12);
  cdHeader.writeUInt16LE(dosDate, 14);
  cdHeader.writeUInt32LE(crc, 16);
  cdHeader.writeUInt32LE(contentBuffer.length, 20);
  cdHeader.writeUInt32LE(contentBuffer.length, 24);
  cdHeader.writeUInt16LE(nameBuf.length, 28);
  cdHeader.writeUInt16LE(0, 30);
  cdHeader.writeUInt16LE(0, 32);
  cdHeader.writeUInt16LE(0, 34);
  cdHeader.writeUInt16LE(0, 36);
  cdHeader.writeUInt32LE(0, 38);
  cdHeader.writeUInt32LE(0, 42);
  nameBuf.copy(cdHeader, 46);

  const cdOffset = localHeader.length + contentBuffer.length;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(cdHeader.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([localHeader, contentBuffer, cdHeader, eocd]);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const orderIdParam = searchParams.get("orderId") || searchParams.get("order");
  const productIdParam = searchParams.get("productId") || searchParams.get("product");

  let orderId: string | undefined = undefined;
  let productId: string | undefined = productIdParam || undefined;
  let customerEmail: string | undefined = undefined;
  let isAuthorized = false;

  // 1. Try to verify via signed token
  if (token) {
    const { valid, payload } = verifyDownloadToken(token);
    if (payload) {
      orderId = payload.orderId;
      productId = payload.productId;
      customerEmail = payload.email;
    }
    // A valid token signature provides authorization
    if (valid) {
      isAuthorized = true;
    }
  }

  // 2. Fallback to order ID
  if (!orderId && orderIdParam) {
    orderId = orderIdParam;
  }

  if (orderId) {
    try {
      const { getOrderById } = await import("@/lib/store-db");
      const order = getOrderById(orderId);
      if (order) {
        if (!productId) productId = order.productId;
        if (!customerEmail) customerEmail = order.customerEmail;
        if (order.status === "approved" || order.pricingType === "free") {
          isAuthorized = true;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback for free products
  if (!isAuthorized && productId) {
    try {
      const product = getProductById(productId);
      if (product && product.pricingType === "free") {
        isAuthorized = true;
      }
    } catch (e) {}
  }

  if (!isAuthorized) {
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en" dir="ltr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Download Access | Abdallah Store</title>
          <style>
            body { background-color: #0a0a0a; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
            .card { background-color: #111111; border: 1px solid #333333; border-radius: 20px; padding: 40px 30px; max-width: 480px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            h1 { color: #f57f00; font-size: 22px; margin-bottom: 12px; }
            p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin-bottom: 25px; }
            .btn { display: inline-block; background-color: #f57f00; color: #000000; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Order Verification Pending</h1>
            <p>
              This download link is associated with a paid order that is currently pending verification.<br/>
              Once approved by the admin in dashboard, your download will be unlocked automatically.
            </p>
            <a href="/#contact" class="btn">Contact Support</a>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(htmlResponse, {
      status: 403,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  let fileUrl = "";
  const product = productId ? getProductById(productId) : undefined;

  if (product && product.fileUrl) {
    fileUrl = product.fileUrl;
  } else if (productId) {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data } = await supabase.from("products").select("*").eq("id", productId).single();
      if (data) {
        fileUrl = data.file_url || data.fileUrl || data.download_url || "";
      }
    } catch (e) {}
  }

  if (!fileUrl) {
    fileUrl = `/assets/downloads/${product?.slug || "digital-asset"}.zip`;
  }

  const isAbsolute = fileUrl.startsWith("http://") || fileUrl.startsWith("https://");
  const formattedUrl = isAbsolute ? fileUrl : (fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`);

  // Handle local files
  if (!isAbsolute && (formattedUrl.startsWith("/uploads/") || formattedUrl.startsWith("/assets/"))) {
    try {
      const path = await import("path");
      const fs = await import("fs");
      const localFilePath = path.join(process.cwd(), "public", formattedUrl);

      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        const fileName = path.basename(localFilePath);
        const cleanFileName = fileName.replace(/^\d+_\d+_/, "").replace(/^\d+_/, "");

        const response = new NextResponse(fileBuffer);
        response.headers.set("Content-Type", "application/zip");
        response.headers.set("Content-Disposition", `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`);
        return response;
      }
    } catch (e) { }
  }

  // Handle external/Supabase URLs
  if (isAbsolute) {
    try {
      const fetchRes = await fetch(formattedUrl);
      if (fetchRes.ok) {
        const urlPath = new URL(formattedUrl).pathname;
        let ext = urlPath.includes(".") ? urlPath.substring(urlPath.lastIndexOf(".")) : ".zip";
        if (ext.length > 5) ext = ".zip";

        const titleName = product?.title
          ? product.title.replace(/[/\:\\?%*:|"<>]/g, "_").trim()
          : "Product_Asset";
        const cleanFileName = `${titleName}${ext}`;

        const blob = await fetchRes.arrayBuffer();
        const response = new NextResponse(Buffer.from(blob));
        response.headers.set("Content-Type", fetchRes.headers.get("content-type") || "application/zip");
        response.headers.set("Content-Disposition", `attachment; filename="${cleanFileName}"; filename*=UTF-8''${encodeURIComponent(cleanFileName)}`);
        return response;
      }
    } catch (e) { }
  }

  // Fallback: If external Supabase or local file is missing, generate a valid ZIP package!
  try {
    const titleName = product?.title ? product.title.replace(/[/\:\\?%*:|"<>]/g, "_").trim() : "Product_Asset";
    const zipFileName = `${titleName}_Package.zip`;

    let licenseKeyStr = "N/A - Direct Unlocked Access";
    let planNameStr = "Direct Access Plan";
    let expiresAtStr = "Active / Permanent Access";
    let maxDevicesStr = "1 Workstation";

    try {
      const { getLicenses, getPlans, getOrderById } = await import("@/lib/store-db");
      const licenses = getLicenses();
      const foundLic = licenses.find((l) => (customerEmail && productId && l.userEmail === customerEmail && l.productId === productId));
      
      if (foundLic) {
        licenseKeyStr = foundLic.rawLicenseKey || `Key-Ending-${foundLic.licenseKeyLast4}`;
        expiresAtStr = foundLic.expiresAt
          ? new Date(foundLic.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : `Pending Activation (${foundLic.durationValue || foundLic.durationDays || 30} ${foundLic.durationUnit || "days"})`;
        maxDevicesStr = `${foundLic.maxDevices} Workstation(s)`;

        const plans = getPlans();
        const plan = plans.find((p) => p.id === foundLic.planId);
        if (plan) planNameStr = plan.name;
      }

      if (orderId) {
        const ord = getOrderById(orderId);
        if (ord?.planName) planNameStr = ord.planName;
        if (ord?.licenseKey) licenseKeyStr = ord.licenseKey;
      }
    } catch (e) {}

    const txtContent = `======================================================
ABDALLAH STORE - OFFICIAL SOFTWARE LICENSE PACKAGE
======================================================

Tool / Product: ${product?.title || "Digital Tool & Preset Package"}
Version: ${product?.version || "v1.0.0"}
Order Reference ID: ${orderId || "DIGITAL-CLAIM"}
Licensed Customer: ${customerEmail || "Customer"}

------------------------------------------------------
SOFTWARE LICENSE KEY & SUBSCRIPTION DETAILS:
------------------------------------------------------
License Key: ${licenseKeyStr}
Selected Plan: ${planNameStr}
License Expiration: ${expiresAtStr}
Max Allowed Workstations: ${maxDevicesStr}
Status: ACTIVE & VERIFIED

------------------------------------------------------
Included Features & Specs:
${product?.features ? product.features.map((f: string) => `- ${f}`).join("\n") : "- Full Unlocked Commercial License"}

Installation & Setup:
1. Extract the contents of this ZIP archive to your plugins directory.
2. Launch ${product?.compatibility || "Adobe Creative Cloud"} and enter your License Key above.

Customer Support:
For license inquiries, custom workflows, or device unbinding:
${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://bid032.com"}
======================================================`;

    const txtBuffer = Buffer.from(txtContent, "utf-8");
    const zipBuffer = createZipBuffer(`LICENSE_${titleName}.txt`, txtBuffer);

    const response = new NextResponse(new Uint8Array(zipBuffer));
    response.headers.set("Content-Type", "application/zip");
    response.headers.set("Content-Disposition", `attachment; filename="${zipFileName}"; filename*=UTF-8''${encodeURIComponent(zipFileName)}`);
    return response;
  } catch (err) {
    return new NextResponse("Error generating download file package", { status: 500 });
  }
}
