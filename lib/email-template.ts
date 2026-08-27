export interface ContactEmailProps {
  name: string;
  email: string;
  message: string;
}

export function getContactEmailHtml({ name, email, message }: ContactEmailProps): string {
  // Sanitize line breaks in message for safe rendering
  const formattedMessage = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #aaaaaa;">
  
  <!-- Main Wrapper -->
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0a0a; width: 100%; padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <!-- Card Container (Max Width 600px) -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #111111; border: 1px solid #222222; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
          
          <!-- Top Glow Accent Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #f57f00 0%, #ff9f33 50%, #f57f00 100%);"></td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #1a1a1a;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <!-- Brand Logo / Name -->
                    <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; text-decoration: none;">
                      Abdallah Ahmed<span style="color: #f57f00;">.</span>
                    </span>
                  </td>
                  <td align="right">
                    <!-- Badge -->
                    <span style="display: inline-block; background-color: rgba(245, 127, 0, 0.12); color: #f57f00; border: 1px solid rgba(245, 127, 0, 0.3); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; padding: 5px 12px; border-radius: 20px;">
                      New Message
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- Greeting / Heading -->
              <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 22px; font-weight: 700; tracking: -0.3px;">
                You received a new inquiry!
              </h1>
              <p style="margin: 0 0 28px 0; color: #888888; font-size: 14px; line-height: 1.5;">
                Someone submitted the contact form on your portfolio website.
              </p>

              <!-- Information Grid (Name & Email) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <!-- Sender Name Card -->
                  <td width="48%" style="vertical-align: top; padding-right: 2%;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #666666; margin-bottom: 8px;">
                      SENDER NAME
                    </div>
                    <div style="background-color: #161616; border: 1px solid #242424; border-radius: 10px; padding: 14px 16px; color: #ffffff; font-size: 14px; font-weight: 600; word-break: break-word;">
                      ${name}
                    </div>
                  </td>

                  <!-- Sender Email Card -->
                  <td width="48%" style="vertical-align: top; padding-left: 2%;">
                    <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #666666; margin-bottom: 8px;">
                      EMAIL ADDRESS
                    </div>
                    <div style="background-color: #161616; border: 1px solid #242424; border-radius: 10px; padding: 14px 16px; color: #f57f00; font-size: 14px; font-weight: 500; word-break: break-word;">
                      <a href="mailto:${email}" style="color: #f57f00; text-decoration: none;">${email}</a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Message Card -->
              <div style="margin-bottom: 32px;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #666666; margin-bottom: 8px;">
                  MESSAGE CONTENT
                </div>
                <div style="background-color: #161616; border-left: 3px solid #f57f00; border-top: 1px solid #242424; border-right: 1px solid #242424; border-bottom: 1px solid #242424; border-radius: 4px 12px 12px 4px; padding: 20px; color: #e5e5e5; font-size: 14px; line-height: 1.7;">
                  ${formattedMessage}
                </div>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re:%20Portfolio%20Inquiry" style="display: inline-block; background-color: #f57f00; color: #0a0a0a; font-weight: 700; font-size: 14px; padding: 14px 32px; text-decoration: none; border-radius: 10px; text-align: center; box-shadow: 0 4px 20px rgba(245, 127, 0, 0.25);">
                      Reply directly to ${name} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d0d0d; border-top: 1px solid #1a1a1a; text-align: center;">
              <p style="margin: 0; color: #555555; font-size: 12px; line-height: 1.5;">
                This message was sent automatically via the contact form on <a href="https://bid032.com" style="color: #777777; text-decoration: underline;">bid032.com</a>.
              </p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
