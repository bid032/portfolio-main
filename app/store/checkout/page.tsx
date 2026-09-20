"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product, Plan } from "@/lib/store-types";
import {
  FaMobileAlt,
  FaQrcode,
  FaUpload,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaCopy,
  FaTag,
  FaCheck,
  FaTimes,
  FaChevronLeft,
  FaBolt,
  FaDownload,
  FaDesktop,
  FaBox,
  FaLock,
  FaStar,
  FaLayerGroup,
  FaExternalLinkAlt,
  FaGlobe,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaInfoCircle
} from "react-icons/fa";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "wallet">("instapay");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [usdExchangeRate, setUsdExchangeRate] = useState<number>(50);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("direct");

  // Store settings
  const [instapayLink, setInstapayLink] = useState("https://ipn.eg/S/bid032/instapay/0YCdeK");
  const [walletNumber, setWalletNumber] = useState("01028463485");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [instantDownloadUrl, setInstantDownloadUrl] = useState<string | null>(null);
  const [trialLicenseKey, setTrialLicenseKey] = useState<string | null>(null);
  const [trialCopied, setTrialCopied] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (productId) {
      fetch("/api/store/products")
        .then((res) => res.json())
        .then((data: Product[]) => {
          if (Array.isArray(data)) {
            const found = data.find((p) => p.id === productId || p.slug === productId);
            if (found) {
              setProduct(found);
              if (found.slug && typeof window !== "undefined") {
                window.history.replaceState(null, "", `/store/${found.slug}`);
              }
            }
          }
        })
        .catch(() => { });
    }

    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.instapayLink) setInstapayLink(data.instapayLink);
        if (data.walletNumber) setWalletNumber(data.walletNumber);
        if (data.usdExchangeRate) setUsdExchangeRate(Number(data.usdExchangeRate));
      })
      .catch(() => { });

    fetch("/api/store/licenses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plans)) {
          setPlans(data.plans);
        }
      })
      .catch(() => { });
  }, [productId]);

  const productPlans = product ? plans.filter((p) => p.productId === product.id) : [];
  const selectedPlan = productPlans.find((p) => p.id === selectedPlanId);

  const basePriceEgp = selectedPlan ? selectedPlan.priceEgp : (product?.priceEgp || 0);
  const basePriceUsd = selectedPlan
    ? (selectedPlan.priceUsd || (usdExchangeRate > 0 ? Math.round((selectedPlan.priceEgp / usdExchangeRate) * 10) / 10 : 0))
    : (product?.priceUsd || (product?.priceEgp && usdExchangeRate > 0 ? Math.round((product.priceEgp / usdExchangeRate) * 10) / 10 : 0));

  const finalPrice = Math.max(0, basePriceEgp - discountAmount);
  const finalPriceUsd = usdExchangeRate > 0
    ? Math.max(0, Math.round((finalPrice / usdExchangeRate) * 10) / 10)
    : (basePriceEgp > 0 ? Math.max(0, Math.round((finalPrice / basePriceEgp) * basePriceUsd * 10) / 10) : basePriceUsd);

  const isFreeOrTrial = (selectedPlan && (selectedPlan.trial || selectedPlan.priceEgp === 0)) || finalPrice === 0 || product?.pricingType === "free";

  const applyOrRefreshCoupon = async (codeToUse: string, currentBasePrice: number) => {
    if (!product || !codeToUse.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch(`/api/store/coupons?code=${encodeURIComponent(codeToUse.trim())}&amount=${currentBasePrice}&productId=${product.id}`);
      const data = await res.json();

      if (data.valid) {
        setAppliedCoupon(codeToUse.toUpperCase().trim());
        setDiscountAmount(data.discountAmount);
        setCouponSuccess(`Coupon applied! Saved ${data.discountAmount} EGP.`);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponError("Failed to validate coupon code.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!product || !couponCode.trim()) return;
    await applyOrRefreshCoupon(couponCode, basePriceEgp);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const foundPlan = productPlans.find((p) => p.id === planId);
    const newBaseEgp = foundPlan ? foundPlan.priceEgp : (product?.priceEgp || 0);
    if (appliedCoupon) {
      applyOrRefreshCoupon(appliedCoupon, newBaseEgp);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product || !name || !email || !phone) {
      setError("Please fill in all required customer details.");
      return;
    }

    if (!isFreeOrTrial && (!senderNumber || !screenshotFile)) {
      setError("Please fill in sender number and upload your payment proof screenshot.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isFreeOrTrial) {
        if (selectedPlan?.trial || (product.pricingType === "paid" && finalPrice === 0)) {
          // Request instant 3-day trial key
          const res = await fetch("/api/v1/license/trial", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userEmail: email,
              customerName: name,
              customerPhone: phone,
              productId: product.id,
            }),
          });

          const data = await res.json();
          if (res.ok && data.rawLicenseKey) {
            setTrialLicenseKey(data.rawLicenseKey);
            if (data.downloadUrl || (product as any).downloadUrl) {
              setInstantDownloadUrl(data.downloadUrl || (product as any).downloadUrl);
            }
            setSubmitted(true);
            const orderId = data.licenseId || data.id || data.rawLicenseKey;
            if (orderId) {
              router.push(`/store/order-success/${encodeURIComponent(orderId)}`);
            }
          } else {
            setError(data.error || "Could not generate free trial key.");
          }
        } else {
          // Free product download
          const res = await fetch("/api/store/free-download", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              productId: product.id,
            }),
          });

          const data = await res.json();
          if (res.ok) {
            if (data.downloadUrl || (product as any).downloadUrl) {
              setInstantDownloadUrl(data.downloadUrl || (product as any).downloadUrl);
            }
            setSubmitted(true);
            const orderId = data.orderId || data.id;
            if (orderId) {
              router.push(`/store/order-success/${encodeURIComponent(orderId)}`);
            }
          } else {
            setError(data.error || "Could not process free download.");
          }
        }
      } else {
        // Paid purchase order with payment proof
        const formData = new FormData();
        formData.append("productId", product.id);
        formData.append("customerName", name);
        formData.append("customerEmail", email);
        formData.append("customerPhone", phone);
        if (senderNumber) formData.append("senderNumber", senderNumber);
        formData.append("paymentMethod", paymentMethod);
        if (selectedPlanId && selectedPlanId !== "direct") {
          formData.append("planId", selectedPlanId);
        }
        if (screenshotFile) formData.append("screenshot", screenshotFile);
        formData.append("finalPrice", String(finalPrice));
        if (appliedCoupon) {
          formData.append("couponCode", appliedCoupon);
          formData.append("discountAmount", String(discountAmount));
        }

        const res = await fetch("/api/store/checkout", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (res.ok) {
          if (data.downloadUrl) setInstantDownloadUrl(data.downloadUrl);
          setSubmitted(true);
          const orderId = data.orderId || data.id;
          if (orderId) {
            router.push(`/store/order-success/${encodeURIComponent(orderId)}`);
          }
        } else {
          setError(data.error || "An error occurred while submitting your order.");
        }
      }
    } catch (err) {
      setError("Could not connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <p className="text-text-muted text-lg mb-4">No product selected for checkout.</p>
        <Link href="/store" className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl shadow-lg">
          Back to Digital Store
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto my-12 bg-surface/90 border border-primary/40 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-2xl space-y-5"
      >
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto mb-2 text-3xl">
          <FaCheckCircle />
        </div>
        <h2 className="text-2xl font-black text-secondary">
          {trialLicenseKey
            ? "Free Trial Key Activated!"
            : instantDownloadUrl
            ? "Your Free Access is Ready!"
            : "Order Submitted Successfully!"}
        </h2>
        <p className="text-text-secondary text-sm leading-relaxed">
          Thank you, <strong>{name}</strong>!{" "}
          {trialLicenseKey ? (
            <>
              Your 3-day free trial key for <strong>{product.title}</strong> has been issued. A copy has also been sent to <strong className="text-secondary">{email}</strong>.
            </>
          ) : instantDownloadUrl ? (
            <>
              Your access token has been generated. Click below to download <strong>{product.title}</strong> directly.
            </>
          ) : (
            <>
              Your payment proof and sender account (<span className="text-primary font-bold">{senderNumber}</span>) are currently being reviewed.
              <br /><br />
              Once verified, a <strong>private 1-hour expiring download link</strong> will be dispatched directly to your email: <strong className="text-secondary">{email}</strong>.
            </>
          )}
        </p>

        {trialLicenseKey && (
          <div className="bg-background border border-emerald-500/30 rounded-2xl p-4 space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-widest block">
              Your 3-Day License Key
            </span>
            <p className="text-xl font-mono font-black text-amber-300 tracking-widest selection:bg-amber-500 selection:text-black">
              {trialLicenseKey}
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(trialLicenseKey);
                setTrialCopied(true);
                setTimeout(() => setTrialCopied(false), 3000);
              }}
              className={`mt-2 w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                trialCopied ? "bg-emerald-500 text-black" : "bg-primary text-black hover:bg-primary-dark"
              }`}
            >
              <FaCopy />
              <span>{trialCopied ? "Copied to Clipboard!" : "Copy License Key"}</span>
            </button>
          </div>
        )}

        {instantDownloadUrl && (
          <div className="pt-2">
            <a
              href={instantDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <FaDownload />
              <span>Download Digital File Now</span>
            </a>
          </div>
        )}

        <div className="pt-4 border-t border-border/60 flex justify-center gap-3">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-surface border border-border text-secondary font-bold text-xs hover:border-primary transition-all"
          >
            <FaChevronLeft className="text-[10px]" />
            <span>Return to Store</span>
          </Link>
        </div>
      </motion.div>
    );
  }

  const featureList = Array.isArray(product.features)
    ? product.features
    : (product.features && typeof product.features === "string")
      ? (product.features as string).split(",").map((f) => f.trim()).filter(Boolean)
      : [];

  return (
    <div className="space-y-8">
      {/* Navigation & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary transition-colors bg-surface/80 px-4 py-2 rounded-xl border border-border/60"
        >
          <FaChevronLeft className="text-[10px]" />
          <span>Back to Digital Store</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <span className="hover:text-secondary cursor-pointer">Store</span>
          <span>/</span>
          <span className="uppercase text-primary font-bold">{product.category}</span>
          <span>/</span>
          <span className="text-secondary font-bold truncate max-w-[200px]">{product.title}</span>
        </div>
      </div>

      {/* Main 2-Column Product & Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT COLUMN: Product Media, Cover, Highlights & Details (Span 7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Cover Image Showcase Banner */}
          <div className="relative group bg-surface/90 border border-border/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-orange-500/10 to-amber-500/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition-all duration-500 -z-10" />

            <div className="relative aspect-video w-full bg-black/40 flex items-center justify-center overflow-hidden border-b border-border/40">
              {product.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.coverImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-text-muted">
                  <FaBox className="text-5xl text-primary/40 mb-3" />
                  <span className="text-sm font-bold">Digital Tool Cover Preview</span>
                </div>
              )}

              {/* Floating Overlays */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary text-black shadow-lg">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                    <FaStar className="text-[9px]" />
                    <span>{product.badge}</span>
                  </span>
                )}
                {product.version && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white border border-white/20 backdrop-blur-md">
                    {product.version}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Header Section */}
            <div className="p-6 sm:p-8 space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight leading-snug">
                  {product.title}
                </h1>
                {product.subtitle && (
                  <p className="text-sm font-semibold text-primary/90 mt-1.5 leading-relaxed">
                    {product.subtitle}
                  </p>
                )}
                {product.isExternalAuthor && (
                  <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <FaGlobe className="text-amber-400" />
                    <span>Tool Creator: {product.authorName || "External Author"}</span>
                    {product.authorLink && (
                      <a
                        href={product.authorLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-200 underline inline-flex items-center gap-1 ml-1 font-bold"
                      >
                        <span>Creator Profile</span>
                        <FaExternalLinkAlt className="text-[9px]" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Specs & Highlights Bar */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-background/80 border border-border/60 p-3 rounded-2xl flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-1">
                    <FaBolt className="text-primary" /> Delivery
                  </span>
                  <span className="text-xs font-bold text-secondary mt-1">Instant Link</span>
                </div>

                <div className="bg-background/80 border border-border/60 p-3 rounded-2xl flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-1">
                    <FaBox className="text-primary" /> Software
                  </span>
                  <span className="text-xs font-bold text-secondary mt-1 truncate w-full">
                    {product.software || "Adobe Illustrator"}
                  </span>
                </div>

                <div className="bg-background/80 border border-border/60 p-3 rounded-2xl flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase text-text-muted flex items-center gap-1">
                    <FaDesktop className="text-primary" /> System
                  </span>
                  <span className="text-xs font-bold text-secondary mt-1 truncate w-full">
                    {product.compatibility || "Windows / Mac"}
                  </span>
                </div>
              </div>

              {/* Description Paragraph */}
              <div className="pt-4 border-t border-border/40">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 font-mono">
                  About This {(product.category || "").toLowerCase().includes("tool") ? "Tool" : (product.category || "").toLowerCase().includes("script") ? "Script" : "Plugin"}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Key Features Bullet Grid */}
              {featureList.length > 0 && (
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider font-mono">
                    Key Features & Capabilities
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {featureList.map((feature, idx) => (
                      <div
                        key={idx}
                        className="bg-background/60 border border-border/60 p-3 rounded-xl flex items-start gap-2.5 text-xs text-secondary font-medium hover:border-primary/40 transition-colors"
                      >
                        <FaCheckCircle className="text-primary text-sm shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Checkout & Payment Sidebar (Span 5) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">

          <div className="bg-surface/90 border border-primary/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">

            {/* Ambient Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header & Order Summary */}
            <div className="border-b border-border/60 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary block mb-0.5">
                  Checkout & Instant Access
                </span>
                <h2 className="text-xl font-black text-secondary">Complete Order</h2>
              </div>

              {/* Currency Selector Switcher */}
              <div className="flex items-center bg-background border border-border rounded-xl p-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setCurrency("EGP")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${currency === "EGP" ? "bg-primary text-black" : "text-text-muted hover:text-white"}`}
                >
                  EGP (ج.م)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${currency === "USD" ? "bg-primary text-black" : "text-text-muted hover:text-white"}`}
                >
                  USD ($)
                </button>
              </div>
            </div>
            {/* Plan Selector Dropdown (if available for paid product) */}
            {productPlans.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs shrink-0">
                      <FaLayerGroup />
                    </div>
                    <span className="text-xs font-black text-secondary uppercase tracking-wider font-mono">
                      Select License Plan *
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    {productPlans.length} Plans Available
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedPlanId}
                    onChange={(e) => handleSelectPlan(e.target.value)}
                    className={`w-full bg-background/90 border rounded-xl px-4 py-3 text-xs text-secondary font-mono outline-none font-bold appearance-none cursor-pointer pr-10 shadow-inner transition-all ${
                      !selectedPlanId ? "border-amber-500/60 ring-2 ring-amber-500/20" : "border-primary/50"
                    }`}
                  >
                    <option value="" disabled className="bg-surface text-text-muted py-2 font-mono">
                      -- Choose a License Plan --
                    </option>
                    {productPlans.map((plan) => {
                      const planPriceDisplay = currency === "EGP" ? `${plan.priceEgp} EGP` : `$${plan.priceUsd || (usdExchangeRate > 0 ? Math.round((plan.priceEgp / usdExchangeRate) * 10) / 10 : 0)} USD`;
                      return (
                        <option key={plan.id} value={plan.id} className="bg-surface text-secondary py-2 font-mono font-bold">
                          {plan.name} — {plan.priceEgp === 0 || plan.trial ? "Free Trial (0 EGP)" : planPriceDisplay} ({plan.durationDays} Days Access • Max {plan.maxDevices} Devices) {plan.trial ? "[Trial Plan]" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-400 text-xs font-bold">
                    ▼
                  </div>
                </div>
              </div>
            )}

            {/* Prompt user if tool has plans and no plan is selected */}
            {productPlans.length > 0 && !selectedPlan ? (
              <div className="bg-background/90 border border-amber-500/30 rounded-2xl p-6 text-center space-y-2.5 shadow-inner">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg mx-auto">
                  <FaLayerGroup />
                </div>
                <h4 className="font-bold text-secondary text-xs uppercase tracking-wider font-mono">Select a License Plan to Proceed</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Please select one of the available plans above to view pricing details, discount options, and complete your order.
                </p>
              </div>
            ) : (
              <>
                {/* Pricing Box */}
                <div className="bg-background/90 border border-border/80 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Selected Option:</span>
                    <span className="font-mono text-secondary font-bold">
                      {selectedPlan ? selectedPlan.name : "Standard License"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span>Base Price ({currency}):</span>
                    <span className="font-mono text-secondary">
                      {currency === "EGP" ? `${basePriceEgp} EGP` : `$${basePriceUsd} USD`}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                      <span>Discount ({appliedCoupon}):</span>
                      <span className="font-mono">
                        -{currency === "EGP" ? `${discountAmount} EGP` : `$${usdExchangeRate > 0 ? Math.round((discountAmount / usdExchangeRate) * 10) / 10 : 0} USD`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <span className="text-xs font-bold text-text-secondary uppercase font-mono">Total Payable:</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary font-mono">
                        {currency === "EGP" ? `${finalPrice} EGP` : `$${finalPriceUsd} USD`}
                      </span>
                      <span className="block text-[10px] text-text-muted font-mono">
                        {currency === "EGP" ? `≈ $${finalPriceUsd} USD` : `≈ ${finalPrice} EGP`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discount Coupon Card (Only for Paid Plans) */}
                {!isFreeOrTrial && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs shrink-0">
                          <FaTag />
                        </div>
                        <span className="text-xs font-black text-secondary uppercase tracking-wider font-mono">
                          Discount Coupon Code
                        </span>
                      </div>
                      {appliedCoupon && (
                        <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FaCheck className="text-[8px]" /> Active
                        </span>
                      )}
                    </div>

                    {appliedCoupon ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xs shrink-0">
                            <FaCheck />
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-mono font-black text-emerald-300 uppercase tracking-wide">{appliedCoupon}</span>
                              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                                Saved {discountAmount} EGP
                              </span>
                            </div>
                            <p className="text-[10px] text-text-muted mt-0.5">Coupon code applied successfully.</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
                          title="Cancel & Remove Coupon"
                        >
                          <FaTimes className="text-[10px]" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="e.g. OFF50 or WELCOME20"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary font-mono uppercase outline-none focus:border-primary font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-dark transition-all disabled:opacity-50 shrink-0 shadow-md"
                        >
                          {couponLoading ? "Validating..." : "Apply"}
                        </button>
                      </div>
                    )}

                    {couponSuccess && !appliedCoupon && <p className="text-emerald-400 text-xs font-bold flex items-center gap-1"><FaCheck /> {couponSuccess}</p>}
                    {couponError && <p className="text-red-400 text-xs font-bold">{couponError}</p>}
                  </div>
                )}

                {/* Payment Method Selector (Only for Paid Items) */}
                {!isFreeOrTrial ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs shrink-0">
                        <FaShieldAlt />
                      </div>
                      <span className="text-xs font-black text-secondary uppercase tracking-wider font-mono">
                        Select Payment Method
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("instapay")}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          paymentMethod === "instapay"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(245,127,0,0.2)]"
                            : "border-border/60 text-text-secondary hover:border-border"
                        }`}
                      >
                        <FaQrcode className="text-xl" />
                        <span className="text-xs">InstaPay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("wallet")}
                        className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                          paymentMethod === "wallet"
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-[0_0_15px_rgba(245,127,0,0.2)]"
                            : "border-border/60 text-text-secondary hover:border-border"
                        }`}
                      >
                        <FaMobileAlt className="text-xl" />
                        <span className="text-xs">Mobile Wallet</span>
                      </button>
                    </div>

                    {/* Method Details Box */}
                    {paymentMethod === "instapay" ? (
                      <div className="bg-background border border-primary/40 rounded-2xl p-4 space-y-3">
                        <p className="text-xs text-text-secondary font-medium">
                          Send <strong>{currency === "EGP" ? `${finalPrice} EGP` : `$${finalPriceUsd} USD`}</strong> via InstaPay to:
                        </p>
                        <div className="flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border">
                          <span className="text-xs font-mono text-primary font-bold truncate">{instapayLink}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(instapayLink)}
                            className="text-xs text-text-muted hover:text-primary flex items-center gap-1 shrink-0 ml-2 font-bold transition-colors"
                          >
                            <FaCopy />
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                        <a
                          href={instapayLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-center py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold text-xs hover:bg-primary hover:text-black transition-all"
                        >
                          Open InstaPay App ↗
                        </a>
                      </div>
                    ) : (
                      <div className="bg-background border border-primary/40 rounded-2xl p-4 space-y-3">
                        <p className="text-xs text-text-secondary font-medium">
                          Send <strong>{currency === "EGP" ? `${finalPrice} EGP` : `$${finalPriceUsd} USD`}</strong> via Vodafone Cash / Wallet to:
                        </p>
                        <div className="flex items-center justify-between bg-surface p-2.5 rounded-xl border border-border">
                          <span className="text-sm font-mono text-primary font-extrabold">{walletNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(walletNumber)}
                            className="text-xs text-text-muted hover:text-primary flex items-center gap-1 shrink-0 ml-2 font-bold transition-colors"
                          >
                            <FaCopy />
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1.5 shadow-inner">
                    <span className="text-xs font-black text-emerald-400 uppercase font-mono tracking-wider flex items-center justify-center gap-1.5">
                      <FaCheckCircle className="text-emerald-400" />
                      <span>{selectedPlan?.trial ? "3-Day Free Trial Activation" : "Free Item Download"}</span>
                    </span>
                    <p className="text-[11px] text-text-secondary">
                      No payment required! Enter your details below to activate your key and download instantly.
                    </p>
                  </div>
                )}

                {/* Customer Form */}
                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2 pb-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs shrink-0">
                      <FaUser />
                    </div>
                    <span className="text-xs font-black text-secondary uppercase tracking-wider font-mono">
                      {isFreeOrTrial ? "Customer Details" : "Customer & Payment Details"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abdallah Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">WhatsApp / Phone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+20 101 234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {!isFreeOrTrial && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">
                          Sender Phone Number or InstaPay Handle *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 01028463485 or handle@instapay"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary focus:border-primary outline-none"
                        />
                      </div>

                      {/* File Screenshot Uploader */}
                      <div>
                        <label className="block text-xs font-bold text-text-secondary mb-1">
                          Upload Payment Screenshot *
                        </label>

                        <div className="relative border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-4 text-center cursor-pointer transition-colors bg-background/50">
                          <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                          />

                          {previewUrl ? (
                            <div className="flex flex-col items-center gap-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={previewUrl} alt="Screenshot Preview" className="max-h-28 rounded-lg object-contain border border-border" />
                              <span className="text-[11px] text-primary font-bold">Screenshot attached (click to change)</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-text-muted py-2">
                              <FaUpload className="text-xl text-primary" />
                              <span className="text-xs font-semibold text-secondary">Click here to upload payment proof</span>
                              <span className="text-[10px]">PNG, JPG, WEBP (Up to 5MB)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {error && <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/30">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 mt-4 ${
                      isFreeOrTrial
                        ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer"
                        : "bg-primary hover:bg-primary-dark text-black shadow-[0_0_20px_rgba(245,127,0,0.35)] cursor-pointer"
                    }`}
                  >
                    {isFreeOrTrial ? <FaCheckCircle /> : null}
                    <span>
                      {loading
                        ? "Processing..."
                        : isFreeOrTrial
                        ? selectedPlan?.trial
                          ? "Activate 3-Day Free Trial Key"
                          : "Get Instant Download Access"
                        : `Confirm & Submit Order (${currency === "EGP" ? `${finalPrice} EGP` : `$${finalPriceUsd} USD`})`}
                    </span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen">
      <Suspense fallback={<div className="text-center py-20 text-text-muted">Loading checkout page...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
