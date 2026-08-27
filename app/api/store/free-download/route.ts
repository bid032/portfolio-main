import { NextResponse } from "next/server";
import { addOrder, getProductById, getStoreSettings, mapSupabaseProduct, getSiteUrl } from "@/lib/store-db";
import { sendEmail } from "@/lib/mailer";
import { generateCustomerFreeDownloadEmail } from "@/lib/email-templates";

export async function POST(req: Request) {
  try {
    const { productId, customerEmail, customerName } = await req.json();

    if (!productId || !customerEmail) {
      return NextResponse.json({ error: "Email and Product ID are required" }, { status: 400 });
    }

    const localProduct = getProductById(productId);
    let product = localProduct;

    // Fetch directly from Supabase to guarantee fetching live row and columns (id or slug)
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

    if (product.pricingType !== "free") {
      return NextResponse.json({ error: "This product requires payment." }, { status: 400 });
    }

    const rawFileUrl = product.fileUrl || "";
    if (!rawFileUrl) {
      return NextResponse.json({ error: "No download file attached to this product yet." }, { status: 404 });
    }

    const settings = getStoreSettings();

    const name = customerName || customerEmail.split("@")[0];

    // Register free download order
    const newOrder = addOrder({
      productId: product.id,
      productTitle: product.title,
      productPrice: 0,
      pricingType: "free",
      customerName: name,
      customerEmail,
      customerPhone: "-",
      senderNumber: "-",
      paymentMethod: "instapay",
      screenshotUrl: "",
    });

    const siteUrl = getSiteUrl(req);

    const { generateDownloadToken } = await import("@/lib/token");
    const token = generateDownloadToken(newOrder.id, product.id, customerEmail);
    const downloadRouteUrl = `/api/store/download?token=${token}`;
    const fullDownloadLink = `${siteUrl}${downloadRouteUrl}`;

    // Send direct download email via cPanel SMTP
    await sendEmail({
      to: customerEmail,
      subject: `Download Access: ${product.title}`,
      html: generateCustomerFreeDownloadEmail({
        customerName: name,
        productTitle: product.title,
        downloadLink: fullDownloadLink,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Download link sent to your email!",
      downloadUrl: downloadRouteUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server Error" }, { status: 500 });
  }
}
