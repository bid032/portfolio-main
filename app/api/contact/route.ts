import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "bid032art@gmail.com";

    // Send Portfolio Contact Message via cPanel SMTP (Zero Emojis, Executive Design)
    const result = await sendEmail({
      to: adminEmail,
      subject: `[Contact Form] New Inquiry from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 30px 15px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #121215; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; }
            .header { padding: 28px; border-bottom: 1px solid #27272a; background-color: #18181c; text-align: left; }
            .brand { color: #f57f00; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
            .title { color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; }
            .body { padding: 28px; }
            .field-label { color: #a1a1aa; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            .field-val { color: #ffffff; font-size: 14px; margin-bottom: 18px; }
            .msg-box { background-color: #18181c; border: 1px solid #27272a; border-radius: 12px; padding: 20px; color: #f4f4f5; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
            .footer { padding: 20px 28px; border-top: 1px solid #27272a; background-color: #0d0d0f; font-size: 12px; color: #71717a; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">Abdallah Portfolio</div>
              <h1 class="title">New Inquiry Submission</h1>
            </div>
            <div class="body">
              <div class="field-label">Sender Full Name</div>
              <div class="field-val">${name}</div>

              <div class="field-label">Sender Email Address</div>
              <div class="field-val">${email}</div>

              <div class="field-label">Message Content</div>
              <div class="msg-box">${message}</div>
            </div>
            <div class="footer">
              Abdallah Ahmed - Digital Engineering & Design Studio
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error || "Failed to send message" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}