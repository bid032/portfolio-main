import { Suspense } from "react";
import OrderSuccessClient from "../OrderSuccessClient";

export const metadata = {
  title: "Order Details & Status | Official Store",
  description: "View your submitted order details, status, and software activation access.",
};

export default async function OrderSuccessDynamicPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-sm text-text-muted">Loading order confirmation...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessClient paramOrderId={orderId} />
    </Suspense>
  );
}
