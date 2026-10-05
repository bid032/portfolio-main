import { NextRequest, NextResponse } from "next/server";
import { getServerPublicKeyPem } from "@/lib/crypto-attestation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const publicKeyPem = getServerPublicKeyPem();
    return NextResponse.json(
      {
        alg: "ES256",
        publicKeyPem,
      },
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve public key", errorCode: "SERVER_ERROR" },
      { status: 500, headers: corsHeaders }
    );
  }
}
