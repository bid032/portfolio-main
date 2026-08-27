import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "mail.bid032.com";
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpUser = process.env.SMTP_USER || "info@bid032.com";
const smtpPass = process.env.SMTP_PASS || "zyvxPXaNGyU99Q8";
const smtpFrom = process.env.SMTP_FROM || `"Abdallah Ahmed - Store" <${smtpUser}>`;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true for 465, false for other ports
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
  tls: {
    rejectUnauthorized: false, // Prevents self-signed cert issues on shared cPanel hosts
  },
});

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: any;
    path?: string;
    contentType?: string;
  }>;
}

export async function sendEmail({ to, subject, html, attachments }: SendMailOptions) {
  try {
    const recipients = Array.isArray(to) ? to.join(",") : to;
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: recipients,
      subject,
      html,
      attachments,
    });
    console.log("Email sent successfully via cPanel SMTP:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Failed to send email via cPanel SMTP:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
