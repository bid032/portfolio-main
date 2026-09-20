import { sendEmail } from "./mailer";

export interface SendLicenseEmailOptions {
  toEmail: string;
  customerName?: string;
  productName: string;
  rawLicenseKey: string;
  planName?: string;
  durationDays?: number;
  expiresAt: string;
  isTrial?: boolean;
  downloadUrl?: string;
}

export function generateLicenseEmailHtml(options: SendLicenseEmailOptions): string {
  const { toEmail, customerName, productName, rawLicenseKey, planName, durationDays, expiresAt, isTrial, downloadUrl } = options;
  const displayName = customerName || toEmail.split("@")[0];

  // Gracefully handle date parsing without producing 'Invalid Date'
  let formattedExpiry = "Pending Activation";
  if (expiresAt && expiresAt !== "Pending Activation" && expiresAt.toLowerCase() !== "null") {
    const parsedDate = new Date(expiresAt);
    if (!isNaN(parsedDate.getTime())) {
      formattedExpiry = parsedDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else {
      formattedExpiry = expiresAt;
    }
  } else if (isTrial) {
    formattedExpiry = "3 Days from First Activation";
  }

  const finalPlanName = planName || (isTrial ? "3-Day Free Trial" : "Standard License");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} License</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #f1f5f9; margin: 0; padding: 30px 15px; -webkit-font-smoothing: antialiased; }
    .container { max-width: 580px; margin: 0 auto; background: #13151c; border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 20px; padding: 32px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { text-align: center; border-bottom: 1px solid #222634; padding-bottom: 20px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 5px 14px; background: rgba(251, 191, 36, 0.15); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.35); border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .logo { font-size: 22px; font-weight: 900; color: #fbbf24; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
    .title { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; }
    .subtitle { font-size: 13.5px; color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6; }
    .key-box { background: #08090d; border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 16px; padding: 22px; text-align: center; margin-bottom: 22px; box-shadow: inset 0 0 20px rgba(251, 191, 36, 0.05); }
    .key-label { font-size: 10px; font-family: monospace; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; font-weight: 700; }
    .key-code { font-size: 23px; font-family: 'Courier New', Courier, monospace; font-weight: 900; color: #fbbf24; letter-spacing: 3px; word-break: break-all; margin: 0; text-shadow: 0 0 10px rgba(251, 191, 36, 0.2); }
    .download-box { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .download-title { margin: 0 0 12px 0; font-size: 13px; color: #34d399; font-weight: 700; }
    .btn-download { display: inline-block; padding: 13px 30px; background-color: #10b981; color: #000000 !important; font-weight: 900; font-size: 14px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35); transition: all 0.2s ease; }
    .details-card { background: #1a1d26; border: 1px solid #2a2e3d; border-radius: 14px; padding: 16px 20px; margin-bottom: 24px; }
    .details-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .details-table td { padding: 10px 0; border-bottom: 1px solid #2a2e3d; }
    .details-table tr:last-child td { border-bottom: none; }
    .details-label { color: #94a3b8; font-weight: 600; }
    .details-val { text-align: right; font-weight: 800; color: #ffffff !important; }
    .val-badge { display: inline-block; padding: 2px 8px; background: rgba(251, 191, 36, 0.15); color: #fbbf24 !important; border-radius: 6px; font-weight: 700; font-size: 12px; }
    .steps-box { background: #0f1117; border: 1px solid #222634; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px; }
    .steps-title { font-size: 12px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .steps-list { margin: 0; padding-left: 18px; color: #cbd5e1; font-size: 12px; line-height: 1.7; }
    .footer { text-align: center; font-size: 11.5px; color: #64748b; border-top: 1px solid #222634; padding-top: 18px; margin-top: 24px; line-height: 1.5; }
    .footer a { color: #38bdf8; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${isTrial ? "3-Day Free Trial" : "License Key"}</div>
      <h2 class="logo">BID032 STORE</h2>
    </div>
    
    <h1 class="title">Hello ${displayName},</h1>
    <p class="subtitle">Thank you for choosing BID032 Tools! Your license key and download link for <strong>${productName}</strong> are ready below.</p>
    
    <div class="key-box">
      <div class="key-label">Your License Key</div>
      <div class="key-code">${rawLicenseKey}</div>
    </div>

    ${downloadUrl ? `
    <div class="download-box">
      <div class="download-title">Download & Install Extension Asset:</div>
      <a href="${downloadUrl}" target="_blank" class="btn-download">Download Extension Asset</a>
    </div>
    ` : ''}
    
    <div class="details-card">
      <table class="details-table">
        <tr>
          <td class="details-label">Product Name</td>
          <td class="details-val">${productName}</td>
        </tr>
        <tr>
          <td class="details-label">Plan Type</td>
          <td class="details-val"><span class="val-badge">${finalPlanName}</span></td>
        </tr>
        <tr>
          <td class="details-label">Expires On</td>
          <td class="details-val">${formattedExpiry}</td>
        </tr>
      </table>
    </div>

    <div class="steps-box">
      <div class="steps-title">Quick Activation Steps</div>
      <ol class="steps-list">
        <li>Click the green button above to download the extension asset file.</li>
        <li>Open your Adobe app (Photoshop / Illustrator) and launch the plugin panel.</li>
        <li>Enter your License Key above, then click <strong>Activate</strong>.</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>Need assistance or have questions? Contact support at <a href="mailto:info@bid032.com">info@bid032.com</a></p>
      <p>© ${new Date().getFullYear()} BID032 Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendLicenseEmail(options: SendLicenseEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[BID032 Email Dispatch] Sending license key to ${options.toEmail} for ${options.productName}`);

    const html = generateLicenseEmailHtml(options);
    const subject = `${options.isTrial ? "Your 3-Day Free Trial Key & Extension Download Link" : "Your License Key"} for ${options.productName} - BID032`;

    // 1. Primary: Send via cPanel SMTP Transporter
    const mailResult = await sendEmail({
      to: options.toEmail,
      subject,
      html,
    });

    // 2. Secondary Optional: Resend API if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || "BID032 Store <licenses@bid032.com>",
            to: [options.toEmail],
            subject,
            html,
          }),
        });
      } catch (resendErr) {
        console.error("[BID032 Resend Fallback Error]", resendErr);
      }
    }

    return mailResult;
  } catch (err: any) {
    console.error("[BID032 Email Dispatch Error]", err);
    return { success: false, error: err.message };
  }
}

