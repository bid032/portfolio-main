export interface AdminOrderEmailParams {
  isFree: boolean;
  productTitle: string;
  planName?: string;
  originalPriceText?: string;
  totalAmountText: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  senderReference: string;
  couponCode?: string;
  discountAmount?: number;
  adminDashboardUrl: string;
  screenshotUrl?: string;
  screenshotCid?: string;
}

export interface CustomerApprovalEmailParams {
  customerName: string;
  productTitle: string;
  downloadLink: string;
  expirationMinutes?: number;
  licenseKey?: string;
  planName?: string;
  expiresAt?: string;
  maxDevices?: number;
}

export interface CustomerFreeDownloadEmailParams {
  customerName: string;
  productTitle: string;
  downloadLink: string;
  licenseKey?: string;
  planName?: string;
  expiresAt?: string;
  maxDevices?: number;
}

export function generateAdminOrderEmail(params: AdminOrderEmailParams): string {
  const {
    isFree,
    productTitle,
    planName,
    originalPriceText,
    totalAmountText,
    customerName,
    customerEmail,
    customerPhone,
    paymentMethod,
    senderReference,
    couponCode,
    discountAmount,
    adminDashboardUrl,
    screenshotUrl,
    screenshotCid,
  } = params;

  const imageSrc = screenshotCid ? `cid:${screenshotCid}` : screenshotUrl;
  const hasScreenshot = Boolean(screenshotCid || (screenshotUrl && screenshotUrl !== "/assets/proofs/placeholder.png"));
  const isWebUrl = screenshotUrl && !screenshotUrl.startsWith("data:");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isFree ? "Free Download Request" : "New Order Submitted"}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08080a; color: #f4f4f5; margin: 0; padding: 32px 12px; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 820px; margin: 0 auto; background-color: #111115; border: 1px solid #24242c; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 32px 22px 32px; background-color: #16161d; border-bottom: 2px solid #f57f00;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="color: #f57f00; font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 6px;">
                ABDALLAH STORE &bull; ADMINISTRATIVE PORTAL
              </div>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                ${isFree ? "Free Resource Claimed" : "New Paid Order Submitted"}
              </h1>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 28px 32px;">
        <p style="font-size: 14px; color: #a1a1aa; margin-top: 0; margin-bottom: 24px; line-height: 1.5;">
          ${isFree ? "A customer requested a free digital asset. Download link was automatically issued." : "A new purchase transaction has been submitted and is pending verification in the administrative portal."}
        </p>

        <!-- 2-Column Wide Landscape Layout: Left (Order Details), Right (Transfer Screenshot) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
          <tr>
            <td valign="top" style="${hasScreenshot ? "width: 52%; padding-right: 12px;" : "width: 100%;"}">
              <!-- Order Summary Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181820; border: 1px solid #282834; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500; width: 38%;">Product Title</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #ffffff; font-size: 12px; font-weight: 700; text-align: right; width: 62%;">${productTitle}</td>
                </tr>
                ${planName ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Selected Plan</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #f57f00; font-size: 12px; font-weight: 700; text-align: right;">${planName}</td>
                </tr>
                ` : ""}
                ${originalPriceText ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Plan Base Price</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #d4d4d8; font-size: 12px; font-weight: 600; text-align: right;">${originalPriceText}</td>
                </tr>
                ` : ""}
                ${couponCode ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Coupon Discount</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #10b981; font-size: 12px; font-weight: 700; text-align: right;">${couponCode} (-${discountAmount} EGP)</td>
                </tr>
                ` : ""}
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Final Amount Paid</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #f57f00; font-size: 14px; font-weight: 900; text-align: right;">${totalAmountText}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Customer Name</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #ffffff; font-size: 12px; font-weight: 700; text-align: right;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Customer Email</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #38bdf8; font-size: 12px; font-weight: 600; text-align: right;">${customerEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Phone Number</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #ffffff; font-size: 12px; font-weight: 700; text-align: right;">${customerPhone}</td>
                </tr>
                ${!isFree ? `
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #9a9ab0; font-size: 12px; font-weight: 500;">Payment Method</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #ffffff; font-size: 12px; font-weight: 700; text-align: right;">${paymentMethod === "instapay" ? "InstaPay Transfer" : "Mobile Wallet"}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #9a9ab0; font-size: 12px; font-weight: 500;">Sender Reference</td>
                  <td style="padding: 10px 14px; color: #f57f00; font-size: 13px; font-weight: 800; text-align: right;">${senderReference}</td>
                </tr>
                ` : ""}
              </table>
            </td>

            ${hasScreenshot ? `
            <td valign="top" style="width: 48%; padding-left: 12px;">
              <!-- Payment Screenshot Receipt Box (Right Column) -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #181820; border: 1px solid #282834; border-radius: 12px; overflow: hidden; height: 100%;">
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #23232e; color: #f57f00; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px;">
                    Transfer Proof Screenshot
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px;" align="center" valign="middle">
                    ${isWebUrl ? `
                    <a href="${screenshotUrl}" target="_blank" style="display: block; text-decoration: none;">
                      <img src="${imageSrc}" alt="Payment Proof Screenshot" style="width: 100%; max-height: 280px; object-fit: contain; border-radius: 8px; border: 1px solid #383848; display: block; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" />
                    </a>
                    ` : `
                      <img src="${imageSrc}" alt="Payment Proof Screenshot" style="width: 100%; max-height: 280px; object-fit: contain; border-radius: 8px; border: 1px solid #383848; display: block; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" />
                    `}
                    ${isWebUrl ? `
                    <div style="margin-top: 8px; font-size: 10px; color: #71717a; font-family: monospace;">
                      Click screenshot to view full resolution
                    </div>
                    ` : ""}
                  </td>
                </tr>
              </table>
            </td>
            ` : ""}
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-top: 4px; padding-bottom: 8px;">
              <a href="${adminDashboardUrl}" target="_blank" style="display: inline-block; background-color: #f57f00; color: #000000 !important; font-size: 14px; font-weight: 800; padding: 14px 36px; border-radius: 12px; text-decoration: none !important; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(245,127,0,0.3);">
                Access Admin Dashboard
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #0c0c0f; border-top: 1px solid #202028; text-align: center;">
        <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.5;">
          Abdallah Ahmed &bull; Digital Engineering & Design Studio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateCustomerApprovalEmail(params: CustomerApprovalEmailParams): string {
  const { customerName, productTitle, downloadLink, expirationMinutes = 60, licenseKey, planName, expiresAt, maxDevices } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Verified & Download Link</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08080a; color: #f4f4f5; margin: 0; padding: 32px 12px; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #111115; border: 1px solid #24242c; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px 32px; background-color: #16161d; border-bottom: 2px solid #f57f00;">
        <div style="color: #f57f00; font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 8px;">
          ABDALLAH STORE
        </div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
          Payment Verified & Access Granted
        </h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 15px; color: #e4e4e7; margin-top: 0; margin-bottom: 16px; line-height: 1.6;">
          Dear <strong style="color: #ffffff;">${customerName}</strong>,
        </p>
        <p style="font-size: 14px; color: #a1a1aa; margin-top: 0; margin-bottom: 24px; line-height: 1.6;">
          Your payment transfer has been verified successfully. Your instant access link and license key for <strong style="color: #ffffff;">${productTitle}</strong> are now active.
        </p>

        ${licenseKey ? `
        <!-- Official License Key Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1829; border: 1px solid #1d4ed8; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 20px;">
              <div style="color: #60a5fa; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                 YOUR OFFICIAL LICENSE KEY
              </div>
              <div style="background-color: #030712; border: 1px dashed #3b82f6; border-radius: 10px; padding: 14px; text-align: center; margin-bottom: 14px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">
                  ${licenseKey}
                </span>
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #94a3b8;">
                <tr>
                  <td style="padding: 3px 0;">Subscription Plan: <strong style="color: #ffffff;">${planName || "Standard Plan"}</strong></td>
                  <td align="right" style="padding: 3px 0;">Max Devices: <strong style="color: #ffffff;">${maxDevices || 1} Workstation(s)</strong></td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Valid Until: <strong style="color: #38bdf8;">${expiresAt || "Active"}</strong></td>
                  <td align="right" style="padding: 3px 0;">License Status: <strong style="color: #4ade80;">ACTIVE</strong></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ` : ""}

        <!-- Security Expiration Notice Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #1c170d; border: 1px solid #4a3416; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
          <tr>
            <td style="padding: 16px 20px;">
              <div style="color: #f57f00; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                SECURE DIRECT DOWNLOAD ACCESS
              </div>
              <div style="color: #d4d4d8; font-size: 13px; line-height: 1.5;">
                This download link is unique to your purchase. Please click the button below to download and save your tool file to your device.
              </div>
            </td>
          </tr>
        </table>

        <!-- Download CTA Button -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-top: 8px; padding-bottom: 12px;">
              <a href="${downloadLink}" target="_blank" style="display: inline-block; background-color: #f57f00; color: #000000 !important; font-size: 14px; font-weight: 800; padding: 16px 36px; border-radius: 12px; text-decoration: none !important; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(245,127,0,0.35);">
                Download ${productTitle}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #0c0c0f; border-top: 1px solid #202028; text-align: center;">
        <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.5;">
          Abdallah Ahmed &bull; Digital Engineering & Design Studio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateCustomerFreeDownloadEmail(params: CustomerFreeDownloadEmailParams): string {
  const { customerName, productTitle, downloadLink, licenseKey, planName, expiresAt, maxDevices } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Resource Download Access</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08080a; color: #f4f4f5; margin: 0; padding: 32px 12px; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #111115; border: 1px solid #24242c; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px 32px; background-color: #16161d; border-bottom: 2px solid #f57f00;">
        <div style="color: #f57f00; font-size: 11px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 8px;">
          ABDALLAH STORE
        </div>
        <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
          Digital Resource Access
        </h1>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="padding: 32px;">
        <p style="font-size: 15px; color: #e4e4e7; margin-top: 0; margin-bottom: 16px; line-height: 1.6;">
          Hello <strong style="color: #ffffff;">${customerName}</strong>,
        </p>
        <p style="font-size: 14px; color: #a1a1aa; margin-top: 0; margin-bottom: 24px; line-height: 1.6;">
          Thank you for claiming <strong style="color: #ffffff;">${productTitle}</strong>. Your direct asset download link and license key are ready below.
        </p>

        ${licenseKey ? `
        <!-- Official License Key Box -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1829; border: 1px solid #1d4ed8; border-radius: 14px; margin-bottom: 24px; overflow: hidden;">
          <tr>
            <td style="padding: 20px;">
              <div style="color: #60a5fa; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                 YOUR OFFICIAL LICENSE KEY
              </div>
              <div style="background-color: #030712; border: 1px dashed #3b82f6; border-radius: 10px; padding: 14px; text-align: center; margin-bottom: 14px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: 2px;">
                  ${licenseKey}
                </span>
              </div>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #94a3b8;">
                <tr>
                  <td style="padding: 3px 0;">Subscription Plan: <strong style="color: #ffffff;">${planName || "Free Access"}</strong></td>
                  <td align="right" style="padding: 3px 0;">Max Devices: <strong style="color: #ffffff;">${maxDevices || 1} Workstation(s)</strong></td>
                </tr>
                <tr>
                  <td style="padding: 3px 0;">Valid Until: <strong style="color: #38bdf8;">${expiresAt || "Active"}</strong></td>
                  <td align="right" style="padding: 3px 0;">License Status: <strong style="color: #4ade80;">ACTIVE</strong></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        ` : ""}

        <!-- Download CTA Button -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-top: 8px; padding-bottom: 12px;">
              <a href="${downloadLink}" target="_blank" style="display: inline-block; background-color: #f57f00; color: #000000 !important; font-size: 14px; font-weight: 800; padding: 16px 36px; border-radius: 12px; text-decoration: none !important; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(245,127,0,0.35);">
                Download ${productTitle}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #0c0c0f; border-top: 1px solid #202028; text-align: center;">
        <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.5;">
          Abdallah Ahmed &bull; Digital Engineering & Design Studio
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
