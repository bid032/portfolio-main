import { NextRequest, NextResponse } from "next/server";
import {
  getLicenses,
  getPlans,
  getLicensePayments,
  getDevices,
  getAuditLogs,
  saveLicenses,
  savePlans,
  saveLicensePayments,
  saveLicenseDeviceBindings,
  getLicenseDeviceBindings,
  getProducts,
} from "@/lib/store-db";
import { issueLicense, approvePaymentRequest, createAuditLog, ensureDefaultPlans } from "@/lib/license-engine";
import { sendLicenseEmail } from "@/lib/email-service";

export async function GET() {
  try {
    const plans = ensureDefaultPlans();
    const licenses = getLicenses();
    const payments = getLicensePayments();
    const devices = getDevices();
    const licenseDevices = getLicenseDeviceBindings();
    const auditLogs = getAuditLogs();

    return NextResponse.json({
      success: true,
      plans,
      licenses,
      payments,
      devices,
      licenseDevices,
      auditLogs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to fetch license platform data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, adminPassword } = body;

    // Basic admin authentication check
    if (adminPassword !== "abdallah7432*") {
      return NextResponse.json({ success: false, error: "Unauthorized access." }, { status: 401 });
    }

    if (action === "issue_license") {
      const {
        userEmail,
        productId,
        planId,
        customDurationValue,
        durationValue,
        customDurationUnit,
        durationUnit,
        customDurationDays,
        durationDays,
        maxDevices,
      } = body;

      if (!userEmail || !productId) {
        return NextResponse.json({ success: false, error: "Missing required fields: userEmail, productId." }, { status: 400 });
      }

      const val = customDurationValue ?? durationValue;
      const unit = customDurationUnit ?? durationUnit;
      const days = customDurationDays ?? durationDays;

      const result = issueLicense({
        userEmail,
        productId,
        planId: planId || "custom",
        customDurationValue: val ? Number(val) : undefined,
        customDurationUnit: unit || undefined,
        customDurationDays: days ? Number(days) : undefined,
        maxDevicesOverride: maxDevices ? Number(maxDevices) : undefined,
        actorId: "admin",
      });

      if (result && result.rawLicenseKey && result.license) {
        const products = getProducts();
        const prodObj = products.find((p) => p.id === productId);
        let downloadUrl: string | undefined = prodObj?.fileUrl || (prodObj as any)?.downloadUrl;
        if (downloadUrl && !downloadUrl.startsWith("http") && !downloadUrl.startsWith("//")) {
          const host = req.headers.get("host") || "";
          const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
          const baseUrl = host ? `${proto}://${host}` : "https://bid032.com";
          downloadUrl = `${baseUrl.replace(/\/$/, "")}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
        }

        sendLicenseEmail({
          toEmail: userEmail,
          productName: prodObj ? prodObj.title : productId,
          rawLicenseKey: result.rawLicenseKey,
          planName: planId,
          expiresAt: result.license.expiresAt || "Pending First Device Activation",
          downloadUrl,
        });
      }

      return NextResponse.json({
        success: true,
        rawLicenseKey: result.rawLicenseKey,
        license: result.license,
      });
    }

    if (action === "revoke_license" || action === "suspend_license" || action === "reactivate_license") {
      const { licenseId, reason } = body;
      const licenses = getLicenses();
      const license = licenses.find((l) => l.id === licenseId);

      if (!license) {
        return NextResponse.json({ success: false, error: "License not found." }, { status: 404 });
      }

      const newStatus = action === "revoke_license" ? "revoked" : action === "suspend_license" ? "suspended" : "active";
      license.status = newStatus;
      if (reason) license.revocationReason = reason;
      license.updatedAt = new Date().toISOString();
      saveLicenses(licenses);

      createAuditLog("admin", `license_${newStatus}`, "license", license.id, { reason });

      return NextResponse.json({ success: true, license });
    }

    if (action === "extend_license") {
      const { licenseId, additionalValue, additionalUnit, additionalDays } = body;
      const licenses = getLicenses();
      const license = licenses.find((l) => l.id === licenseId);

      if (!license) {
        return NextResponse.json({ success: false, error: "License not found." }, { status: 404 });
      }

      const unit = additionalUnit || "days";
      const val = Number(additionalValue || additionalDays || 30);
      const addMs = unit === "minutes" ? val * 60 * 1000 : unit === "hours" ? val * 3600 * 1000 : val * 86400 * 1000;

      if (!license.expiresAt || license.status === "pending") {
        license.durationValue = (license.durationValue || 30) + val;
        license.durationUnit = unit;
      } else {
        const currentExpires = new Date(license.expiresAt).getTime();
        const now = Date.now();
        const baseTime = currentExpires > now ? currentExpires : now;
        const newExpiresAt = new Date(baseTime + addMs).toISOString();
        license.expiresAt = newExpiresAt;
        if (license.status === "expired") license.status = "active";
      }

      license.updatedAt = new Date().toISOString();
      saveLicenses(licenses);

      createAuditLog("admin", "license_extended", "license", license.id, { additionalValue: val, additionalUnit: unit });

      return NextResponse.json({ success: true, license });
    }

    if (action === "update_license_duration") {
      const { licenseId, durationValue, durationUnit, exactExpiresAt, setFromNow } = body;
      const licenses = getLicenses();
      const license = licenses.find((l) => l.id === licenseId);

      if (!license) {
        return NextResponse.json({ success: false, error: "License not found." }, { status: 404 });
      }

      if (exactExpiresAt) {
        license.expiresAt = new Date(exactExpiresAt).toISOString();
      } else if (durationValue !== undefined && durationUnit) {
        const val = Number(durationValue);
        const unit = durationUnit;
        const addMs = unit === "minutes" ? val * 60 * 1000 : unit === "hours" ? val * 3600 * 1000 : unit === "months" ? val * 30 * 86400 * 1000 : unit === "years" ? val * 365 * 86400 * 1000 : val * 86400 * 1000;

        license.durationValue = val;
        license.durationUnit = unit;
        license.durationDays = unit === "minutes" ? val / 1440 : unit === "hours" ? val / 24 : unit === "months" ? val * 30 : unit === "years" ? val * 365 : val;

        if (setFromNow || license.expiresAt || license.startsAt) {
          const baseTime = (setFromNow || !license.startsAt) ? Date.now() : new Date(license.startsAt).getTime();
          license.expiresAt = new Date(baseTime + addMs).toISOString();
        }
      }

      if (license.expiresAt) {
        const now = Date.now();
        const exp = new Date(license.expiresAt).getTime();
        if (exp > now && license.status === "expired") {
          license.status = "active";
        } else if (exp <= now && license.status === "active") {
          license.status = "expired";
        }
      }

      license.updatedAt = new Date().toISOString();
      saveLicenses(licenses);

      createAuditLog("admin", "license_duration_updated", "license", license.id, { durationValue, durationUnit, exactExpiresAt });

      return NextResponse.json({ success: true, license });
    }

    if (action === "reset_devices") {
      const { licenseId } = body;
      const bindings = getLicenseDeviceBindings();
      const updatedBindings = bindings.filter((b) => b.licenseId !== licenseId);
      saveLicenseDeviceBindings(updatedBindings);

      createAuditLog("admin", "device_bindings_reset", "license", licenseId);

      return NextResponse.json({ success: true, message: "Device bindings reset successfully." });
    }

    if (action === "approve_payment") {
      const { paymentId } = body;
      const result = approvePaymentRequest({ paymentId, approvedBy: "admin" });
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      if (result.rawLicenseKey && result.license && result.payment) {
        const products = getProducts();
        const prodObj = products.find((p) => p.id === result.payment?.productId);
        let downloadUrl: string | undefined = prodObj?.fileUrl || (prodObj as any)?.downloadUrl;
        if (downloadUrl && !downloadUrl.startsWith("http") && !downloadUrl.startsWith("//")) {
          const host = req.headers.get("host") || "";
          const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
          const baseUrl = host ? `${proto}://${host}` : "https://bid032.com";
          downloadUrl = `${baseUrl.replace(/\/$/, "")}${downloadUrl.startsWith("/") ? "" : "/"}${downloadUrl}`;
        }

        sendLicenseEmail({
          toEmail: result.payment.customerEmail,
          productName: prodObj ? prodObj.title : result.payment.productId,
          rawLicenseKey: result.rawLicenseKey,
          planName: result.payment.planId,
          expiresAt: result.license.expiresAt || "Pending First Device Activation",
          downloadUrl,
        });
      }

      return NextResponse.json({
        success: true,
        rawLicenseKey: result.rawLicenseKey,
        license: result.license,
        payment: result.payment,
      });
    }

    if (action === "reject_payment") {
      const { paymentId, reason } = body;
      const payments = getLicensePayments();
      const payment = payments.find((p) => p.id === paymentId);

      if (!payment) {
        return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
      }

      payment.status = "rejected";
      payment.rejectedReason = reason || "Payment verification failed.";
      payment.updatedAt = new Date().toISOString();
      saveLicensePayments(payments);

      createAuditLog("admin", "payment_rejected", "payment", payment.id, { reason });

      return NextResponse.json({ success: true, payment });
    }

    if (action === "create_plan") {
      const { productId, name, durationValue, durationUnit, durationDays, priceEgp, priceUsd, maxDevices, trial } = body;
      const plans = getPlans();

      const unit = durationUnit || "days";
      const val = Number(durationValue || durationDays || 30);
      const calculatedDays = unit === "minutes" ? val / 1440 : unit === "hours" ? val / 24 : val;

      const newPlan: any = {
        id: `plan_${productId}_${Date.now()}`,
        productId,
        name,
        slug: `${productId}-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        durationValue: val,
        durationUnit: unit,
        durationDays: calculatedDays,
        priceEgp: Number(priceEgp || 0),
        priceUsd: Number(priceUsd || 0),
        currency: "EGP",
        trial: Boolean(trial),
        maxDevices: Number(maxDevices || 2),
        status: "active",
        createdAt: new Date().toISOString(),
      };

      plans.unshift(newPlan);
      savePlans(plans);

      createAuditLog("admin", "plan_created", "plan", newPlan.id, { name, productId });

      return NextResponse.json({ success: true, plan: newPlan });
    }

    if (action === "delete_plan") {
      const { planId } = body;
      let plans = getPlans();
      plans = plans.filter((p) => p.id !== planId);
      savePlans(plans);

      createAuditLog("admin", "plan_deleted", "plan", planId);
      return NextResponse.json({ success: true, message: "Subscription plan deleted successfully." });
    }

    if (action === "update_plan") {
      const { planId, productId, name, durationValue, durationUnit, durationDays, priceEgp, priceUsd, maxDevices, trial } = body;
      const plans = getPlans();
      const plan = plans.find((p) => p.id === planId);

      if (!plan) {
        return NextResponse.json({ success: false, error: "Plan not found." }, { status: 404 });
      }

      const unit = durationUnit || plan.durationUnit || "days";
      const val = durationValue !== undefined ? Number(durationValue) : (durationDays !== undefined ? Number(durationDays) : plan.durationValue || plan.durationDays || 30);
      const calculatedDays = unit === "minutes" ? val / 1440 : unit === "hours" ? val / 24 : val;

      if (productId !== undefined) plan.productId = productId;
      if (name !== undefined) plan.name = name;
      plan.durationValue = val;
      plan.durationUnit = unit;
      plan.durationDays = calculatedDays;
      if (priceEgp !== undefined) plan.priceEgp = Number(priceEgp);
      if (priceUsd !== undefined) plan.priceUsd = Number(priceUsd);
      if (maxDevices !== undefined) plan.maxDevices = Number(maxDevices);
      if (trial !== undefined) plan.trial = Boolean(trial);
      plan.updatedAt = new Date().toISOString();

      savePlans(plans);

      createAuditLog("admin", "plan_updated", "plan", plan.id, { productId, name, priceEgp, durationValue: val, durationUnit: unit });

      return NextResponse.json({ success: true, plan });
    }

    if (action === "delete_license") {
      const { licenseId } = body;
      let licenses = getLicenses();
      licenses = licenses.filter((l) => l.id !== licenseId);
      saveLicenses(licenses);

      createAuditLog("admin", "license_deleted", "license", licenseId);
      return NextResponse.json({ success: true, message: "License deleted permanently." });
    }

    if (action === "update_max_devices") {
      const { licenseId, maxDevices } = body;
      const licenses = getLicenses();
      const license = licenses.find((l) => l.id === licenseId);

      if (!license) {
        return NextResponse.json({ success: false, error: "License not found." }, { status: 404 });
      }

      license.maxDevices = Number(maxDevices || 1);
      license.updatedAt = new Date().toISOString();
      saveLicenses(licenses);

      createAuditLog("admin", "license_max_devices_updated", "license", license.id, { maxDevices });

      return NextResponse.json({ success: true, license });
    }

    return NextResponse.json({ success: false, error: "Unknown admin action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Failed to process admin action" }, { status: 500 });
  }
}
