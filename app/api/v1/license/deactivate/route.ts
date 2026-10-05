import { NextRequest, NextResponse } from "next/server";
import { deactivateDeviceSession } from "@/lib/license-engine";

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
    const { session_id, license_key } = body;

    if (!session_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: session_id.",
          errorCode: "INVALID_REQUEST",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const result = deactivateDeviceSession({
      sessionId: session_id,
      rawLicenseKey: license_key,
    });

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error", errorCode: "SERVER_ERROR" },
      { status: 500, headers: corsHeaders }
    );
  }
}
