import { NextRequest, NextResponse } from "next/server";
import { approvePaymentRequest } from "@/lib/license-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_id, approved_by } = body;

    if (!payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment_id parameter.",
        },
        { status: 400 }
      );
    }

    const result = approvePaymentRequest({
      paymentId: payment_id,
      approvedBy: approved_by || "admin",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      license_key: result.rawLicenseKey,
      license: result.license,
      payment: result.payment,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Internal server error" }, { status: 500 });
  }
}
