"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaCopy,
  FaCheck,
  FaDownload,
  FaKey,
  FaArrowLeft,
  FaShoppingBag,
  FaClock,
  FaShieldAlt,
  FaWhatsapp,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaReceipt,
  FaExternalLinkAlt,
  FaRegLightbulb
} from "react-icons/fa";

interface OrderData {
  id: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  productId: string;
  productTitle: string;
  productPrice: number;
  finalPrice: number;
  discountAmount: number;
  couponCode?: string;
  pricingType?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  senderNumber?: string;
  paymentMethod?: string;
  planName?: string;
  downloadToken?: string;
  licenseKey?: string;
  productCover?: string;
  productSoftware?: string;
  productVersion?: string;
}

export default function OrderSuccessClient({ paramOrderId }: { paramOrderId?: string }) {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("id") || searchParams.get("orderId");
  const orderId = paramOrderId || queryOrderId;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError("No Order ID specified in URL.");
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/store/order-details?id=${encodeURIComponent(orderId as string)}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || "Order not found.");
        }
      } catch (err) {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string, type: "id" | "key") => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const openWhatsAppSupport = () => {
    if (!order) return;
    const msg = `Hello! I have submitted an order on your store.\n\n*Order ID:* ${order.id}\n*Product:* ${order.productTitle}\n*Name:* ${order.customerName}\n*Payment Method:* ${order.paymentMethod || "N/A"}\n\nPlease help me confirm my order.`;
    window.open(`https://wa.me/201028463485?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background text-text-primary pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-8">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors bg-surface/50 border border-border/50 px-3 py-1.5 rounded-full"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Store
          </Link>
          <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Order System Online
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-surface/40 border border-border/50 rounded-3xl backdrop-blur-xl space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-mono text-sm text-text-muted">Loading your order details...</p>
          </div>
        ) : error || !order ? (
          <div className="p-10 text-center bg-surface/40 border border-red-500/30 rounded-3xl backdrop-blur-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto text-2xl font-bold">
              !
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Order Details Not Found</h2>
              <p className="text-sm text-text-muted max-w-md mx-auto">{error || "The requested order ID could not be retrieved."}</p>
            </div>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-black font-bold text-xs hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
            >
              <FaShoppingBag /> Return to Store Catalog
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Success Hero Header Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-emerald-500/15 via-surface/60 to-surface/40 border border-emerald-500/40 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center space-y-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 text-black rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(52,211,153,0.4)] transform hover:scale-105 transition-transform">
                <FaCheckCircle className="text-4xl text-black" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Confirmation Success
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Order Submitted Successfully!
                </h1>
                <p className="text-text-muted text-xs sm:text-sm max-w-lg mx-auto">
                  Thank you, <strong className="text-white">{order.customerName}</strong>! Your order request has been received and registered into our system.
                </p>
              </div>

              {/* Full Order ID Banner */}
              <div className="p-4 bg-background/80 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto shadow-inner">
                <div className="text-left space-y-0.5 min-w-0">
                  <span className="text-[10px] font-mono uppercase text-text-muted block font-semibold tracking-wider">
                    Full Unique Order ID
                  </span>
                  <div className="font-mono text-base sm:text-lg font-black text-emerald-400 tracking-wider truncate select-all">
                    {order.id}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(order.id, "id")}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${copiedId
                      ? "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                      : "bg-surface hover:bg-surface-light border border-border text-white"
                    }`}
                >
                  {copiedId ? (
                    <>
                      <FaCheck className="text-xs" /> Copied!
                    </>
                  ) : (
                    <>
                      <FaCopy className="text-xs text-emerald-400" /> Copy Order ID
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Progress Stepper */}
            <div className="p-6 bg-surface/40 border border-border/50 rounded-3xl backdrop-blur-xl space-y-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <FaClock className="text-primary" /> Order Status & Processing Flow
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-400 text-black font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-400">Order Registered</div>
                    <div className="text-[10px] text-text-muted">Unique ID generated</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${order.status === "approved"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse"
                  }`}>
                  <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${order.status === "approved" ? "bg-emerald-400 text-black" : "bg-amber-400 text-black"
                    }`}>
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      {order.status === "approved" ? "Payment Verified" : "Admin Review"}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {order.status === "approved" ? "Approved by Admin" : "Reviewing payment proof"}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${order.status === "approved"
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                    : "bg-surface/50 border-border/40 text-text-muted"
                  }`}>
                  <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${order.status === "approved" ? "bg-cyan-400 text-black" : "bg-surface-light text-text-muted"
                    }`}>
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold">
                      {order.status === "approved" ? "Access Active" : "Key & Link Delivery"}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {order.status === "approved" ? "Ready to download" : "Sent to email upon approval"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instant Key / Download Box if Approved or Free */}
            {order.status === "approved" && (
              <div className="p-6 bg-gradient-to-r from-cyan-950/40 via-surface/60 to-emerald-950/40 border border-cyan-500/50 rounded-3xl backdrop-blur-xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider font-mono">
                  <FaKey className="text-cyan-400 text-sm" /> License Key & Instant Download Access
                </div>

                {order.licenseKey && (
                  <div className="p-4 bg-background border border-cyan-500/30 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono uppercase text-text-muted block">Your Activated License Key</span>
                    <div className="font-mono text-lg font-black text-cyan-300 tracking-wider break-all select-all">
                      {order.licenseKey}
                    </div>
                    <button
                      onClick={() => copyToClipboard(order.licenseKey!, "key")}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey ? <FaCheck /> : <FaCopy />} {copiedKey ? "Copied Key!" : "Copy License Key"}
                    </button>
                  </div>
                )}

                {order.downloadToken && (
                  <a
                    href={`/api/store/download?token=${order.downloadToken}`}
                    className="w-full py-3.5 rounded-2xl bg-cyan-400 text-black font-black text-xs hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-400/20 cursor-pointer"
                  >
                    <FaDownload className="text-sm" /> Download Software Package
                  </a>
                )}
              </div>
            )}

            {/* Comprehensive Order Details Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Product & Plan Details */}
              <div className="p-6 bg-surface/40 border border-border/50 rounded-3xl backdrop-blur-xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <FaShoppingBag /> Purchased Item & Plan
                </h3>

                <div className="flex items-center gap-4 p-3 bg-surface/60 border border-border/40 rounded-2xl">
                  {order.productCover && (
                    <div className="w-14 h-14 rounded-xl bg-background border border-border overflow-hidden shrink-0 relative">
                      <Image
                        src={order.productCover}
                        alt={order.productTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-sm truncate">{order.productTitle}</h4>
                    <p className="text-[11px] text-text-muted font-mono">{order.productSoftware} • {order.productVersion}</p>
                    <div className="mt-1 inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                      {order.planName || "Standard Plan"}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown Table */}
                <div className="space-y-2 text-xs font-mono pt-2 border-t border-border/40">
                  <div className="flex justify-between text-text-muted">
                    <span>Base Price:</span>
                    <span>{order.productPrice} EGP</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({order.couponCode || "Coupon"}):</span>
                      <span>-{order.discountAmount} EGP</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-border/40">
                    <span>Total Amount Paid:</span>
                    <span className="text-emerald-400">{order.finalPrice} EGP</span>
                  </div>
                </div>
              </div>

              {/* Customer & Payment Info */}
              <div className="p-6 bg-surface/40 border border-border/50 rounded-3xl backdrop-blur-xl space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                  <FaReceipt /> Customer & Payment Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <FaUser className="text-text-muted mt-0.5 shrink-0" />
                    <div>
                      <span className="text-text-muted text-[10px] block font-mono">Customer Name</span>
                      <span className="font-bold text-white">{order.customerName}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <FaEnvelope className="text-text-muted mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-text-muted text-[10px] block font-mono">Delivery Email</span>
                      <span className="font-bold text-emerald-400 font-mono break-all">{order.customerEmail}</span>
                    </div>
                  </div>

                  {order.customerPhone && order.customerPhone !== "-" && (
                    <div className="flex items-start gap-2.5">
                      <FaPhone className="text-text-muted mt-0.5 shrink-0" />
                      <div>
                        <span className="text-text-muted text-[10px] block font-mono">Phone Number</span>
                        <span className="font-bold text-white font-mono">{order.customerPhone}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 pt-2 border-t border-border/40">
                    <FaShieldAlt className="text-text-muted mt-0.5 shrink-0" />
                    <div>
                      <span className="text-text-muted text-[10px] block font-mono">Payment Method & Reference</span>
                      <span className="font-bold text-white uppercase">{order.paymentMethod || "Direct Transfer"}</span>
                      {order.senderNumber && (
                        <span className="block text-[11px] text-text-muted font-mono mt-0.5">
                          Sender: {order.senderNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Assistance Banner */}
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <FaWhatsapp className="text-emerald-400 text-lg" /> Need Instant Approval or Assistance?
                </h4>
                <p className="text-xs text-text-muted max-w-md">
                  Send your Order ID directly to our WhatsApp support team for expedited verification and fast license key issuance.
                </p>
              </div>
              <button
                onClick={openWhatsAppSupport}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer"
              >
                <FaWhatsapp className="text-base" /> Chat on WhatsApp
              </button>
            </div>

            {/* Quick Action Footer Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <Link
                href="/store"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary hover:bg-primary-hover text-black font-black text-xs text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaShoppingBag /> Continue Browsing Store
              </Link>

              <div className="text-xs text-text-muted font-mono flex items-center gap-1.5">
                <FaRegLightbulb className="text-amber-400" /> A confirmation email has been logged to {order.customerEmail}
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
