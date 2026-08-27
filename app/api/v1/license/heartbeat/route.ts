import { NextRequest, NextResponse } from "next/server";
import { validateAndHeartbeatSession } from "@/lib/license-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, license_key, product, device_id } = body;

    if (!session_id || !product) {
      return NextResponse.json(
        {
          valid: false,
          error: "Missing required parameters: session_id and product.",
          errorCode: "INVALID_REQUEST",
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      status: result.status,
      product: result.license?.productId,
      plan: result.license?.planId,
      expires_at: result.license?.expiresAt,
      server_time: new Date().toISOString(),
      session_id,
      attestation: result.attestation,
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message || "Internal server error", errorCode: "SERVER_ERROR" }, { status: 500 });
  }
}
