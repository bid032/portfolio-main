export type CategoryType = "plugin" | "tool" | "script" | "all";
export type PricingType = "free" | "paid" | "all";
export type OrderStatus = "pending" | "approved" | "rejected";

export interface ProductMedia {
  type: "image" | "video" | "gif";
  url: string;
  caption?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: "plugin" | "tool" | "script";
  pricingType: "free" | "paid";
  priceEgp: number;
  originalPriceEgp?: number;
  priceUsd: number;
  badge?: "Popular" | "New" | "Featured" | "Sale" | "Free";
  features: string[];
  software?: string; // e.g. "Adobe Illustrator"
  compatibility: string; // e.g. "Windows / Mac"
  version: string;
  fileUrl: string; // Direct download link or asset path
  coverImage: string;
  gallery?: ProductMedia[];
  rating?: number;
  downloadsCount?: number;
  isExternalAuthor?: boolean;
  authorName?: string;
  authorLink?: string;
  sortOrder?: number;
  isHidden?: boolean;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number; // e.g. 20 for 20% or 100 for 100 EGP
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  applicableProductId?: string; // "all" or specific product ID
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  planId?: string;
  planName?: string;
  productPrice: number;
  discountAmount?: number;
  finalPrice?: number;
  couponCode?: string;
  pricingType: "free" | "paid";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  senderNumber: string; // Phone or Account number transferred from
  paymentMethod: "instapay" | "wallet";
  screenshotUrl: string;
  status: OrderStatus;
  createdAt: string;
  approvedAt?: string;
  downloadToken?: string;
  tokenExpiresAt?: string;
  licenseKey?: string;
}

export interface StoreSettings {
  instapayLink: string;
  walletNumber: string;
  adminPasswordHash: string; // Or plain PIN hash
  adminEmail: string;
  siteUrl: string;
  spotlightProductId?: string;
  heroBannerText?: string;
  heroBannerEnabled?: boolean;
  usdExchangeRate?: number;
  metaPixelId?: string;
}

// =========================================================
// MULTI-PRODUCT LICENSE PLATFORM TYPES
// =========================================================

export type LicenseStatus = "pending" | "active" | "expired" | "suspended" | "revoked";
export type PaymentStatus = "pending" | "processing" | "paid" | "approved" | "rejected" | "refunded" | "cancelled";

export interface Plan {
  id: string;
  productId: string;
  name: string;
  slug: string;
  durationValue?: number;
  durationUnit?: "minutes" | "hours" | "days";
  durationDays: number;
  priceEgp: number;
  priceUsd: number;
  currency: string;
  trial: boolean;
  maxDevices: number;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt?: string;
}

export interface License {
  id: string;
  licenseKeyHash: string;
  licenseKeyLast4: string;
  rawLicenseKey?: string;
  userId?: string;
  userEmail: string;
  productId: string;
  planId: string;
  status: LicenseStatus;
  durationValue?: number;
  durationUnit?: "minutes" | "hours" | "days";
  durationDays?: number;
  startsAt?: string | null;
  activatedAt?: string | null;
  expiresAt?: string | null;
  maxDevices: number;
  revocationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Device {
  id: string;
  licenseId?: string;
  userId?: string;
  fingerprintHash: string;
  installationId: string;
  deviceName?: string;
  platform?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: "active" | "revoked";
}

export interface LicenseDeviceBinding {
  id: string;
  licenseId: string;
  deviceId: string;
  activatedAt: string;
  lastHeartbeatAt: string;
  status: "active" | "revoked";
}

export interface LicensePayment {
  id: string;
  userId?: string;
  customerEmail: string;
  productId: string;
  planId: string;
  amount: number;
  currency: string;
  provider: "instapay" | "vodafone_cash" | "stripe" | "manual";
  providerPaymentId?: string;
  status: PaymentStatus;
  paymentReference?: string;
  proofUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LicenseSession {
  id: string;
  licenseId: string;
  deviceId: string;
  sessionTokenHash: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revoked: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

