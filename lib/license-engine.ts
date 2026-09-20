import crypto from "crypto";
import {
  Plan,
  License,
  Device,
  LicenseDeviceBinding,
  LicensePayment,
  LicenseSession,
  AuditLogEntry,
  LicenseStatus,
  PaymentStatus,
} from "./store-types";
import {
  getPlans,
  getLicenses,
  getDevices,
  getLicenseDeviceBindings,
  getLicensePayments,
  getLicenseSessions,
  getAuditLogs,
  savePlans,
  saveLicenses,
  saveDevices,
  saveLicenseDeviceBindings,
  saveLicensePayments,
  saveLicenseSessions,
  saveAuditLogs,
  getProducts,
} from "./store-db";
import { createSignedAttestation, SignedAttestation } from "./crypto-attestation";

/**
 * Generates a cryptographically secure random license key.
 * Format: XXXX-XXXX-XXXX-XXXX (e.g., LXR7-K92M-PQ8D-X4TA)
 */
export function generateRawLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars (0, O, 1, I)
  const getRandomChunk = (length: number) => {
    const bytes = crypto.randomBytes(length);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  };

  return `${getRandomChunk(4)}-${getRandomChunk(4)}-${getRandomChunk(4)}-${getRandomChunk(4)}`;
}

/**
 * Hashes a raw license key with SHA-256
 */
export function hashLicenseKey(rawKey: string): string {
  const cleanKey = rawKey.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return crypto.createHash("sha256").update(cleanKey).digest("hex");
}

/**
 * Extract last 4 chars for safe display
 */
export function getLicenseKeyLast4(rawKey: string): string {
  const cleanKey = rawKey.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleanKey.slice(-4);
}

/**
 * Log an event to audit_logs
 */
export function createAuditLog(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, any>
): AuditLogEntry {
  const logs = getAuditLogs();
  const entry: AuditLogEntry = {
    id: `log_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    actorId,
    action,
    entityType,
    entityId,
    metadata: metadata || {},
    createdAt: new Date().toISOString(),
  };

  logs.unshift(entry);
  saveAuditLogs(logs);
  return entry;
}

/**
 * Initialize default plans for products if empty
 */
export function ensureDefaultPlans(): Plan[] {
  let plans = getPlans();
  const validPaidProducts = getProducts().filter((p) => p.pricingType === "paid" && !p.isHidden);
  const validProductIds = new Set(validPaidProducts.map((p) => p.id));

  // Purge any orphan plans belonging to deleted, hidden, or free products
  const activePlans = plans.filter((plan) => validProductIds.has(plan.productId));

  if (activePlans.length !== plans.length) {
    savePlans(activePlans);
    plans = activePlans;
  }

  if (plans.length > 0) return plans;

  const defaultPlans: Plan[] = [];

  validPaidProducts.forEach((prod) => {
    // 3-Day Free Trial Plan
    defaultPlans.push({
      id: `plan_${prod.id}_trial`,
      productId: prod.id,
      name: `3-Day Free Trial`,
      slug: `${prod.slug}-trial-3d`,
      durationDays: 3,
      priceEgp: 0,
      priceUsd: 0,
      currency: "EGP",
      trial: true,
      maxDevices: 1,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    // 1-Month Subscription Plan
    defaultPlans.push({
      id: `plan_${prod.id}_monthly`,
      productId: prod.id,
      name: `1 Month License`,
      slug: `${prod.slug}-monthly`,
      durationDays: 30,
      priceEgp: prod.priceEgp || 350,
      priceUsd: prod.priceUsd || 12,
      currency: "EGP",
      trial: false,
      maxDevices: 1,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    // 1-Year Pro Plan
    defaultPlans.push({
      id: `plan_${prod.id}_yearly`,
      productId: prod.id,
      name: `1 Year License`,
      slug: `${prod.slug}-yearly`,
      durationDays: 365,
      priceEgp: (prod.priceEgp || 350) * 8,
      priceUsd: (prod.priceUsd || 12) * 8,
      currency: "EGP",
      trial: false,
      maxDevices: 1,
      status: "active",
      createdAt: new Date().toISOString(),
    });
  });

  savePlans(defaultPlans);
  return defaultPlans;
}

/**
 * Helper to calculate total duration in milliseconds
 */
export function getDurationInMs(durationValue?: number, durationUnit?: string, durationDaysFallback?: number): number {
  if (durationValue && durationValue > 0 && durationUnit) {
    if (durationUnit === "minutes") return durationValue * 60 * 1000;
    if (durationUnit === "hours") return durationValue * 60 * 60 * 1000;
    if (durationUnit === "days") return durationValue * 24 * 60 * 60 * 1000;
  }
  const days = durationDaysFallback && durationDaysFallback > 0 ? durationDaysFallback : 30;
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Issue a new License (Returns raw key ONCE alongside saved hashed entity)
 * Defaults to "pending" activation so expiration starts upon FIRST device activation.
 */
export function issueLicense({
  userEmail,
  productId,
  planId,
  userId,
  customDurationValue,
  customDurationUnit,
  customDurationDays,
  maxDevicesOverride,
  actorId = "system",
  startImmediately = false,
}: {
  userEmail: string;
  productId: string;
  planId: string;
  userId?: string;
  customDurationValue?: number;
  customDurationUnit?: "minutes" | "hours" | "days";
  customDurationDays?: number;
  maxDevicesOverride?: number;
  actorId?: string;
  startImmediately?: boolean;
}): { rawLicenseKey: string; license: License } {
  const plans = ensureDefaultPlans();
  const plan = plans.find((p) => p.id === planId || p.slug === planId);

  const durationValue = customDurationValue ?? (plan ? (plan.durationValue ?? plan.durationDays) : (customDurationDays ?? 30));
  const durationUnit = customDurationUnit ?? (plan ? (plan.durationUnit ?? "days") : "days");
  const durationDays = customDurationDays ?? (plan ? plan.durationDays : 30);
  const maxDevices = maxDevicesOverride || (plan ? plan.maxDevices : 2);

  const rawLicenseKey = generateRawLicenseKey();
  const licenseKeyHash = hashLicenseKey(rawLicenseKey);
  const licenseKeyLast4 = getLicenseKeyLast4(rawLicenseKey);

  const now = new Date();

  let status: LicenseStatus = "pending";
  let startsAt: string | null = null;
  let activatedAt: string | null = null;
  let expiresAt: string | null = null;

  if (startImmediately) {
    const durationMs = getDurationInMs(durationValue, durationUnit, durationDays);
    status = "active";
    startsAt = now.toISOString();
    activatedAt = now.toISOString();
    expiresAt = new Date(now.getTime() + durationMs).toISOString();
  }

  const newLicense: License = {
    id: `lic_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    licenseKeyHash,
    licenseKeyLast4,
    rawLicenseKey,
    userId: userId || undefined,
    userEmail: userEmail.trim().toLowerCase(),
    productId,
    planId: plan ? plan.id : planId,
    status,
    durationValue,
    durationUnit,
    durationDays,
    startsAt,
    activatedAt,
    expiresAt,
    maxDevices,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const licenses = getLicenses();
  licenses.unshift(newLicense);
  saveLicenses(licenses);

  createAuditLog(actorId, "license_created", "license", newLicense.id, {
    userEmail: newLicense.userEmail,
    productId,
    planId,
    durationValue,
    durationUnit,
    status,
    maxDevices,
  });

  return { rawLicenseKey, license: newLicense };
}

/**
 * Anti-abuse Free Trial creation check
 */
export function requestFreeTrial({
  userEmail,
  productId,
  fingerprintHash,
  installationId,
  deviceName,
  platform,
}: {
  userEmail: string;
  productId: string;
  fingerprintHash: string;
  installationId: string;
  deviceName?: string;
  platform?: string;
}): { success: boolean; rawLicenseKey?: string; license?: License; attestation?: SignedAttestation; error?: string; errorCode?: string } {
  const cleanEmail = userEmail.trim().toLowerCase();
  const cleanFingerprint = fingerprintHash.trim().toLowerCase();

  const licenses = getLicenses();
  const plans = ensureDefaultPlans();
  const trialPlan = plans.find((p) => p.productId === productId && p.trial);

  if (!trialPlan) {
    return { success: false, error: "Free trial plan is not available for this product.", errorCode: "TRIAL_UNAVAILABLE" };
  }

  // Anti-abuse Check 1: Has this email already claimed a trial for this product?
  const existingEmailTrial = licenses.find(
    (l) => l.userEmail === cleanEmail && l.productId === productId && l.planId === trialPlan.id
  );
  if (existingEmailTrial) {
    return {
      success: false,
      error: "This email account has already used the free trial for this tool.",
      errorCode: "TRIAL_ALREADY_USED",
    };
  }

  // Anti-abuse Check 2: Has this device fingerprint already claimed a trial for this product?
  const devices = getDevices();
  const matchingDevice = devices.find((d) => d.fingerprintHash === cleanFingerprint);

  if (matchingDevice) {
    const bindings = getLicenseDeviceBindings();
    const boundLicenseIds = bindings.filter((b) => b.deviceId === matchingDevice.id).map((b) => b.licenseId);
    const existingDeviceTrial = licenses.find(
      (l) => boundLicenseIds.includes(l.id) && l.productId === productId && l.planId === trialPlan.id
    );

    if (existingDeviceTrial) {
      return {
        success: false,
        error: "This device has already claimed a free trial for this product.",
        errorCode: "TRIAL_ALREADY_USED",
      };
    }
  }

  // Issue Trial License (timer starts when activated on device!)
  const { rawLicenseKey, license } = issueLicense({
    userEmail: cleanEmail,
    productId,
    planId: trialPlan.id,
    customDurationValue: trialPlan.durationValue || trialPlan.durationDays || 3,
    customDurationUnit: trialPlan.durationUnit || "days",
    customDurationDays: trialPlan.durationDays || 3,
    maxDevicesOverride: 1,
    actorId: `trial_user_${cleanEmail}`,
  });

  return {
    success: true,
    rawLicenseKey,
    license,
  };
}

/**
 * Activate a License on a Device
 * FIRST ACTIVATION triggers the expiration timer calculation!
 */
export function activateDeviceOnLicense({
  rawLicenseKey,
  productId,
  fingerprintHash,
  installationId,
  deviceName,
  platform,
}: {
  rawLicenseKey: string;
  productId: string;
  fingerprintHash: string;
  installationId: string;
  deviceName?: string;
  platform?: string;
}): { success: boolean; license?: License; session?: LicenseSession; attestation?: SignedAttestation; error?: string; errorCode?: string } {
  const keyHash = hashLicenseKey(rawLicenseKey);
  const licenses = getLicenses();
  const license = licenses.find((l) => l.licenseKeyHash === keyHash);

  if (!license) {
    return { success: false, error: "Invalid license key.", errorCode: "INVALID_LICENSE" };
  }

  if (productId && license.productId !== productId) {
    return { success: false, error: "License key does not belong to this product.", errorCode: "PRODUCT_NOT_ALLOWED" };
  }

  if (license.status === "revoked") {
    return { success: false, error: "This license has been revoked.", errorCode: "LICENSE_REVOKED" };
  }

  if (license.status === "suspended") {
    return { success: false, error: "This license is currently suspended.", errorCode: "LICENSE_SUSPENDED" };
  }

  const now = new Date();

  // FIRST ACTIVATION / TIMER START LOGIC
  // If license was pending or has no activatedAt/expiresAt timestamp, activate timer NOW!
  if (!license.activatedAt || !license.expiresAt || license.status === "pending") {
    const durationMs = getDurationInMs(license.durationValue, license.durationUnit, license.durationDays);
    license.activatedAt = now.toISOString();
    license.startsAt = now.toISOString();
    license.expiresAt = new Date(now.getTime() + durationMs).toISOString();
    license.status = "active";
    license.updatedAt = now.toISOString();
    saveLicenses(licenses);
  } else {
    // If already activated previously, check expiration
    if (new Date(license.expiresAt).getTime() < now.getTime()) {
      license.status = "expired";
      saveLicenses(licenses);
      return { success: false, error: "This license has expired.", errorCode: "LICENSE_EXPIRED" };
    }
  }

  // 1. Register or find Device
  const devices = getDevices();
  let device = devices.find((d) => d.fingerprintHash === fingerprintHash && d.installationId === installationId);

  if (!device) {
    device = {
      id: `dev_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      fingerprintHash,
      installationId,
      deviceName,
      platform,
      firstSeenAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      status: "active",
    };
    devices.unshift(device);
    saveDevices(devices);
  } else {
    device.lastSeenAt = now.toISOString();
    if (deviceName) device.deviceName = deviceName;
    if (platform) device.platform = platform;
    saveDevices(devices);
  }

  // 2. Check Device Bindings
  const bindings = getLicenseDeviceBindings();
  let binding = bindings.find((b) => b.licenseId === license.id && b.deviceId === device!.id);

  if (!binding) {
    const activeBindingsCount = bindings.filter((b) => b.licenseId === license.id && b.status === "active").length;
    if (activeBindingsCount >= license.maxDevices) {
      return {
        success: false,
        error: `Device limit reached. Maximum ${license.maxDevices} device(s) allowed for this plan.`,
        errorCode: "DEVICE_LIMIT_REACHED",
      };
    }

    binding = {
      id: `bind_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      licenseId: license.id,
      deviceId: device.id,
      activatedAt: now.toISOString(),
      lastHeartbeatAt: now.toISOString(),
      status: "active",
    };
    bindings.unshift(binding);
    saveLicenseDeviceBindings(bindings);
  } else {
    binding.lastHeartbeatAt = now.toISOString();
    binding.status = "active";
    saveLicenseDeviceBindings(bindings);
  }

  // 3. Create Session Token & Session
  const rawSessionToken = `sess_tok_${crypto.randomBytes(16).toString("hex")}`;
  const sessionTokenHash = crypto.createHash("sha256").update(rawSessionToken).digest("hex");
  const sessionExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  const sessions = getLicenseSessions();
  const session: LicenseSession = {
    id: rawSessionToken,
    licenseId: license.id,
    deviceId: device.id,
    sessionTokenHash,
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    expiresAt: sessionExpiresAt,
    revoked: false,
  };

  sessions.unshift(session);
  saveLicenseSessions(sessions);

  // 4. Create Cryptographic Signed Attestation
  const attestation = createSignedAttestation({
    audience: productId,
    licenseHash: license.licenseKeyHash,
    product: productId,
    plan: license.planId,
    expiresAt: license.expiresAt || new Date().toISOString(),
    sessionId: session.id,
    maxDevices: license.maxDevices,
  });

  createAuditLog("system", "license_activated", "license", license.id, {
    deviceId: device.id,
    deviceName: device.deviceName,
    platform: device.platform,
    sessionId: session.id,
  });

  return {
    success: true,
    license,
    session,
    attestation,
  };
}

/**
 * Validate License Session & Heartbeat
 */
export function validateAndHeartbeatSession({
  sessionId,
  rawLicenseKey,
  productId,
  fingerprintHash,
}: {
  sessionId: string;
  rawLicenseKey?: string;
  productId: string;
  fingerprintHash?: string;
}): { valid: boolean; status: LicenseStatus; license?: License; attestation?: SignedAttestation; error?: string; errorCode?: string } {
  const sessions = getLicenseSessions();
  const session = sessions.find((s) => s.id === sessionId && !s.revoked);

  if (!session) {
    return { valid: false, status: "revoked", error: "Session invalid or revoked.", errorCode: "INVALID_SESSION" };
  }

  const licenses = getLicenses();
  const license = licenses.find((l) => l.id === session.licenseId);

  if (!license) {
    return { valid: false, status: "revoked", error: "License not found.", errorCode: "INVALID_LICENSE" };
  }

  if (rawLicenseKey) {
    const hash = hashLicenseKey(rawLicenseKey);
    if (license.licenseKeyHash !== hash) {
      return { valid: false, status: "revoked", error: "License key mismatch.", errorCode: "INVALID_LICENSE" };
    }
  }

  if (productId && license.productId !== productId) {
    return { valid: false, status: "revoked", error: "Product mismatch.", errorCode: "PRODUCT_NOT_ALLOWED" };
  }

  if (license.status === "revoked" || license.status === "suspended") {
    return { valid: false, status: license.status, error: `License is ${license.status}.`, errorCode: `LICENSE_${license.status.toUpperCase()}` };
  }

  const now = new Date();
  if (license.expiresAt && new Date(license.expiresAt).getTime() < now.getTime()) {
    license.status = "expired";
    saveLicenses(licenses);
    return { valid: false, status: "expired", error: "License has expired.", errorCode: "LICENSE_EXPIRED" };
  }

  // Update session & device heartbeat timestamps
  session.lastSeenAt = now.toISOString();
  saveLicenseSessions(sessions);

  const bindings = getLicenseDeviceBindings();
  const binding = bindings.find((b) => b.licenseId === license.id && b.deviceId === session.deviceId);
  if (binding) {
    binding.lastHeartbeatAt = now.toISOString();
    saveLicenseDeviceBindings(bindings);
  }

  // Create fresh signed attestation
  const attestation = createSignedAttestation({
    audience: productId,
    licenseHash: license.licenseKeyHash,
    product: productId,
    plan: license.planId,
    expiresAt: license.expiresAt || new Date().toISOString(),
    sessionId: session.id,
    maxDevices: license.maxDevices,
  });

  return {
    valid: true,
    status: license.status,
    license,
    attestation,
  };
}

/**
 * Deactivate Device Session
 */
export function deactivateDeviceSession({
  sessionId,
  rawLicenseKey,
}: {
  sessionId: string;
  rawLicenseKey?: string;
}): { success: boolean; message: string } {
  const sessions = getLicenseSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (session) {
    session.revoked = true;
    saveLicenseSessions(sessions);

    const bindings = getLicenseDeviceBindings();
    const binding = bindings.find((b) => b.licenseId === session.licenseId && b.deviceId === session.deviceId);
    if (binding) {
      binding.status = "revoked";
      saveLicenseDeviceBindings(bindings);
    }

    createAuditLog("system", "device_deactivated", "device", session.deviceId, {
      licenseId: session.licenseId,
      sessionId,
    });
  }

  return { success: true, message: "Device session deactivated successfully." };
}

/**
 * Payment Approval Flow (Creates license & updates status atomically)
 */
export function approvePaymentRequest({
  paymentId,
  approvedBy = "admin",
}: {
  paymentId: string;
  approvedBy?: string;
}): { success: boolean; payment?: LicensePayment; rawLicenseKey?: string; license?: License; error?: string } {
  const payments = getLicensePayments();
  const payment = payments.find((p) => p.id === paymentId);

  if (!payment) {
    return { success: false, error: "Payment request not found." };
  }

  if (payment.status === "approved" || payment.status === "paid") {
    return { success: false, error: "Payment is already approved." };
  }

  // Issue License
  const { rawLicenseKey, license } = issueLicense({
    userEmail: payment.customerEmail,
    productId: payment.productId,
    planId: payment.planId,
    actorId: approvedBy,
  });

  // Update Payment Status
  payment.status = "approved";
  payment.approvedBy = approvedBy;
  payment.approvedAt = new Date().toISOString();
  saveLicensePayments(payments);

  createAuditLog(approvedBy, "payment_approved", "payment", payment.id, {
    licenseId: license.id,
    customerEmail: payment.customerEmail,
    amount: payment.amount,
  });

  return {
    success: true,
    payment,
    rawLicenseKey,
    license,
  };
}
