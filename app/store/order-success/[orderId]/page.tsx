"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaCheckCircle,
  FaClock,
  FaDownload,
  FaCopy,
  FaKey,
  FaWhatsapp,
  FaChevronLeft,
  FaBox,
  FaShieldAlt,
  FaExclamationCircle,
  FaSpinner,
} from "react-icons/fa";

interface OrderDetails {
  id: string;
  productId: string;
  productTitle: string;
  planName?: string;
  finalPrice: number;
  pricingType: "free" | "paid";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentMethod?: string;
  senderNumber?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  licenseKey?: string;
  downloadUrl?: string;
}

function OrderSuccessContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Support both /store/order-success/ORDER_ID and /store/order-success?orderId=ORDER_ID
  const rawId = (params?.orderId as string) || searchParams.get("orderId") || searchParams.get("id") || "";

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!rawId) {
      setLoading(false);
      setError("No Order ID provided.");
      return;
    }

    fetch(`/api/store/order-status?orderId=${encodeURIComponent(rawId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.order) {
          setOrder(data.order);

          // Fire Meta Pixel Conversion Event
          if (typeof window !== "undefined" && window.trackMetaPixel) {
            const isPaid = data.order.pricingType === "paid" && data.order.finalPrice > 0;
            if (isPaid) {
              window.trackMetaPixel("Purchase", {
                value: data.order.finalPrice,
                currency: "EGP",
                content_name: data.order.productTitle,
                content_ids: [data.order.productId],
              });
            } else {
              window.trackMetaPixel("Lead", {
                content_name: data.order.productTitle,
                content_category: "Free Trial",
              });
            }
          }
        } else {
          setError(data.error || "Order not found");
        }
      })
      .catch(() => {
        setError("Failed to load order details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rawId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <FaSpinner className="animate-spin text-3xl text-primary" />
        <p className="text-xs font-mono text-text-muted">Loading order confirmation details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
          <FaExclamationCircle />
        </div>
        <div>
          <h2 className="text-xl font-bold text-secondary">Order Confirmation Not Found</h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            {error || "We could not locate order information for this reference ID."}
          </p>
        </div>
        <Link
          href="/store"
          className="px-6 py-3 rounded-2xl bg-primary text-black font-bold text-xs hover:bg-primary-dark transition-all shadow-lg"
        >
          Return to Digital Store
        </Link>
      </div>
    );
  }

  const isApproved = order.status === "approved" || order.pricingType === "free";
  const formattedDate = new Date(order.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Dynamic absolute download URL that resolves using current window.location.origin
  let resolveDownloadUrl = order.downloadUrl || "";
  if (resolveDownloadUrl && !resolveDownloadUrl.startsWith("http")) {
    if (typeof window !== "undefined") {
      resolveDownloadUrl = `${window.location.origin}${resolveDownloadUrl.startsWith("/") ? "" : "/"}${resolveDownloadUrl}`;
    }
  }

  const whatsappInquiryMsg = encodeURIComponent(
    `Hello Abdallah! I am inquiring about my order #${order.id.slice(0, 8)} for "${order.productTitle}".`
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors bg-surface/80 px-4 py-2 rounded-xl border border-border/60"
        >
          <FaChevronLeft className="text-[10px]" />
          <span>Back to Store</span>
        </Link>

        <span className="text-[11px] font-mono text-text-muted">
          Ref ID: <strong className="text-primary">{order.id.slice(0, 12)}</strong>
        </span>
      </div>

      {/* Main Success Container */}
      <div className="bg-surface/90 border border-primary/40 rounded-3xl p-6 sm:p-10 text-center shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge & Title */}
        <div className="space-y-3">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg border ${
              isApproved
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20"
                : "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-500/20"
            }`}
          >
            {isApproved ? <FaCheckCircle /> : <FaClock />}
          </div>

          <div>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-widest inline-block mb-2 border ${
                isApproved
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              {isApproved ? "Order Successfully Verified" : "Order Submitted • Pending Review"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
              {isApproved ? "Order Completed Successfully!" : "Thank You! Order Under Review"}
            </h1>

            <p className="text-xs text-text-secondary mt-2 max-w-md mx-auto leading-relaxed">
              Hello <strong className="text-secondary">{order.customerName}</strong>! Your order details for{" "}
              <strong className="text-primary">{order.productTitle}</strong> have been recorded.
            </p>
          </div>
        </div>

        {/* License Key Card (If available) */}
        {order.licenseKey && (
          <div className="bg-background border border-amber-500/40 rounded-2xl p-5 space-y-2 text-left shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <FaKey className="text-xs" />
                <span>Your Software License Key</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE KEY
              </span>
            </div>

            <p className="text-lg sm:text-2xl font-mono font-black text-amber-300 tracking-widest break-all select-all pt-1">
              {order.licenseKey}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(order.licenseKey || "");
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 3000);
                }}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                  copiedKey ? "bg-emerald-500 text-black" : "bg-primary text-black hover:bg-primary-dark"
                }`}
              >
                <FaCopy />
                <span>{copiedKey ? "Key Copied to Clipboard!" : "Copy License Key"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Download Button (If unlocked) */}
        {resolveDownloadUrl && (
          <div className="p-1 bg-gradient-to-r from-emerald-500/30 via-primary/40 to-amber-500/30 rounded-2xl">
            <a
              href={resolveDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <FaDownload className="text-base" />
              <span>Download Software Package (.ZIP)</span>
            </a>
          </div>
        )}

        {/* Pending Review Notice */}
        {!isApproved && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
              <FaShieldAlt />
              <span>What Happens Next?</span>
            </h4>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Our system is verifying your payment screenshot and reference (
              <span className="text-amber-300 font-bold">{order.senderNumber || order.customerPhone}</span>). Once verified:
            </p>
            <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside">
              <li>A direct download link will be unlocked on this page.</li>
              <li>Your official License Key & receipt will be emailed to <strong className="text-secondary">{order.customerEmail}</strong>.</li>
            </ul>
          </div>
        )}

        {/* Order Metadata Table */}
        <div className="bg-background/80 border border-border/80 rounded-2xl p-4 text-left space-y-3 text-xs font-mono">
          <h4 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider border-b border-border/60 pb-2">
            Order Reference Summary
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted">
            <div>
              <span className="block text-[10px] uppercase text-text-muted">Order ID</span>
              <span className="text-secondary font-bold select-all">{order.id}</span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-text-muted">Date & Time</span>
              <span className="text-secondary">{formattedDate}</span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-text-muted">Software / Tool</span>
              <span className="text-primary font-bold">{order.productTitle}</span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-text-muted">License Plan</span>
              <span className="text-amber-300 font-bold">{order.planName || "Standard Plan"}</span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-text-muted">Total Price</span>
              <span className="text-emerald-400 font-bold">
                {order.pricingType === "free" ? "FREE" : `${order.finalPrice} EGP`}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase text-text-muted">Customer Email</span>
              <span className="text-secondary">{order.customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Actions & WhatsApp Support */}
        <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`https://wa.me/201028463485?text=${whatsappInquiryMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <FaWhatsapp className="text-base text-emerald-400" />
            <span>Chat Support on WhatsApp</span>
          </a>

          <Link
            href="/store"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-surface border border-border text-secondary font-bold text-xs hover:border-primary transition-all text-center"
          >
            Return to Digital Store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <FaSpinner className="animate-spin text-3xl text-primary" />
          <p className="text-xs font-mono text-text-muted">Loading order confirmation details...</p>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

