import { NextRequest, NextResponse } from "next/server";
import { validateAndHeartbeatSession } from "@/lib/license-engine";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, license_key, product, device_id } = body;

    if (!session_id) {
      return NextResponse.json(
        {
          valid: false,
          error: "Missing required parameter: session_id is required.",
          errorCode: "INVALID_REQUEST",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = validateAndHeartbeatSession({
      sessionId: session_id,
      rawLicenseKey: license_key,
      productId: product,
      fingerprintHash: device_id,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          status: result.status,
          error: result.error,
          errorCode: result.errorCode,
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { getProductById, getPlans } = await import("@/lib/store-db");
    const prodObj = result.license?.productId ? getProductById(result.license.productId) : null;
    const plans = getPlans();
    const rawPlanId = result.license?.planId || "";
    const planObj = rawPlanId ? plans.find((p) => p.id === rawPlanId || p.slug === rawPlanId || p.name.toLowerCase() === rawPlanId.toLowerCase()) : null;

    let finalPlanName = planObj?.name;
    if (!finalPlanName) {
      if (!rawPlanId) {
        finalPlanName = "Standard License";
      } else if (rawPlanId.toLowerCase().includes("custom")) {
        finalPlanName = "Custom Plan";
      } else if (rawPlanId.toLowerCase().includes("trial")) {
        finalPlanName = "Free Trial (3 Days)";
      } else if (rawPlanId.toLowerCase().includes("lifetime")) {
        finalPlanName = "Lifetime Plan";
      } else {
        finalPlanName = rawPlanId
          .replace(/^plan[-_]/i, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    return NextResponse.json(
      {
        valid: true,
        status: result.status,
        product: result.license?.productId,
        product_title: prodObj?.title || result.license?.productId || "Digital Tool",
        plan: rawPlanId,
        plan_name: finalPlanName,
        expires_at: result.license?.expiresAt,
        server_time: new Date().toISOString(),
        session_id: session_id,
        attestation: result.attestation,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err.message || "Internal server error", errorCode: "SERVER_ERROR" },
      { status: 500, headers: corsHeaders }
    );
  }
}
