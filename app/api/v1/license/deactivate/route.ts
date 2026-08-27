import { NextRequest, NextResponse } from "next/server";
import { deactivateDeviceSession } from "@/lib/license-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, license_key } = body;

    if (!session_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: session_id.",
          errorCode: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    const result = deactivateDeviceSession({
      sessionId: session_id,
      rawLicenseKey: license_key,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error", errorCode: "SERVER_ERROR" }, { status: 500 });
  }
}
