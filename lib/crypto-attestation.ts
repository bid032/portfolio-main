import crypto from "crypto";

// Fallback in-memory KeyPair if env variables are missing
let fallbackKeyPair: { privateKey: string; publicKey: string } | null = null;

function getKeyPair(): { privateKey: string; publicKey: string } {
  const privateKeyEnv = process.env.LICENSE_PRIVATE_KEY_PEM;
  const publicKeyEnv = process.env.LICENSE_PUBLIC_KEY_PEM;

  if (privateKeyEnv && publicKeyEnv) {
    return {
      privateKey: privateKeyEnv.replace(/\\n/g, "\n"),
      publicKey: publicKeyEnv.replace(/\\n/g, "\n"),
    };
  }

  if (!fallbackKeyPair) {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "prime256v1", // ECDSA P-256 for ES256
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
    fallbackKeyPair = { privateKey, publicKey };
  }

  return fallbackKeyPair;
}

export interface AttestationPayload {
  version: string;
  audience: string; // Product ID or client audience
  licenseHash: string;
  product: string;
  plan: string;
  serverTime: string;
  expiresAt: string;
  sessionId: string;
  maxDevices: number;
}

export interface SignedAttestation {
  alg: "ES256";
  payload: AttestationPayload;
  signature: string; // Base64 signature
  publicKeyPem: string; // Public key for verification
}

/**
 * Signs a license attestation payload using ES256 (ECDSA P-256 with SHA-256)
 */
export function createSignedAttestation(payloadData: Omit<AttestationPayload, "version" | "serverTime">): SignedAttestation {
  const { privateKey, publicKey } = getKeyPair();

  const payload: AttestationPayload = {
    version: "1.0",
    serverTime: new Date().toISOString(),
    ...payloadData,
  };

  // Canonical JSON stringification to ensure stable hash
  const canonicalString = JSON.stringify(payload, Object.keys(payload).sort());

  const signer = crypto.createSign("SHA256");
  signer.update(canonicalString);
  signer.end();

  const signature = signer.sign(privateKey, "base64");

  return {
    alg: "ES256",
    payload,
    signature,
    publicKeyPem: publicKey,
  };
}

/**
 * Verifies a signed attestation payload using public key
 */
export function verifySignedAttestation(attestation: SignedAttestation, customPublicKeyPem?: string): boolean {
  try {
    const publicKey = customPublicKeyPem || attestation.publicKeyPem || getKeyPair().publicKey;

    const canonicalString = JSON.stringify(attestation.payload, Object.keys(attestation.payload).sort());

    const verifier = crypto.createVerify("SHA256");
    verifier.update(canonicalString);
    verifier.end();

    return verifier.verify(publicKey, attestation.signature, "base64");
  } catch (err) {
    return false;
  }
}

/**
 * Returns the server public key for distribution to SDK clients
 */
export function getServerPublicKeyPem(): string {
  return getKeyPair().publicKey;
}
