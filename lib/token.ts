import crypto from "crypto";

const SECRET_KEY = process.env.STORE_SECRET_KEY || "abdallah-store-secret-token-2026-key";

export interface TokenPayload {
  orderId: string;
  productId: string;
  email: string;
  expiresAt: number; // Unix timestamp in ms
}

/**
 * Generates a signed token valid for paid & claimed products (default: 10 years)
 */
export function generateDownloadToken(
  orderId: string,
  productId: string,
  email: string,
  durationMs: number = 10 * 365 * 24 * 60 * 60 * 1000
): string {
  const expiresAt = Date.now() + durationMs;
  const payloadData = `${orderId}:${productId}:${email}:${expiresAt}`;
  
  const hmac = crypto.createHmac("sha256", SECRET_KEY);
  hmac.update(payloadData);
  const signature = hmac.digest("hex");

  const fullToken = Buffer.from(JSON.stringify({
    orderId,
    productId,
    email,
    expiresAt,
    sig: signature
  })).toString("base64url");

  return fullToken;
}

/**
 * Verifies if a download token is valid and signed
 */
export function verifyDownloadToken(token: string): { valid: boolean; error?: string; payload?: TokenPayload } {
  try {
    const jsonStr = Buffer.from(token, "base64url").toString("utf-8");
    const data = JSON.parse(jsonStr);

    const { orderId, productId, email, expiresAt, sig } = data;

    if (!orderId || !productId || !email || !sig) {
      return { valid: false, error: "Invalid token payload" };
    }

    // Verify HMAC signature
    const payloadData = `${orderId}:${productId}:${email}:${expiresAt}`;
    const hmac = crypto.createHmac("sha256", SECRET_KEY);
    hmac.update(payloadData);
    const expectedSignature = hmac.digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))) {
      return { valid: false, error: "Token signature mismatch" };
    }

    // Check expiration (Optional override for active orders)
    if (expiresAt && Date.now() > expiresAt) {
      return { valid: false, error: "Token has expired", payload: { orderId, productId, email, expiresAt } };
    }

    return { valid: true, payload: { orderId, productId, email, expiresAt } };
  } catch (err) {
    return { valid: false, error: "Malformed token" };
  }
}
