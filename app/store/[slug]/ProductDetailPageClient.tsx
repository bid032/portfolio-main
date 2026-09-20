"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product, ProductMedia } from "@/lib/store-types";
import { DEFAULT_PRODUCTS } from "@/lib/default-products";
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
  FaDesktop,
  FaBox,
  FaLock,
  FaStar,
  FaLayerGroup,
  FaDownload,
  FaVideo,
  FaPlay,
  FaImage,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaGift,
  FaInfoCircle,
  FaExternalLinkAlt,
  FaGlobe
} from "react-icons/fa";

interface Props {
  slug: string;
  initialProduct?: Product | null;
}

export default function ProductDetailPageClient({ slug, initialProduct }: Props) {
  const [product, setProduct] = useState<Product | null>(() => {
    if (initialProduct) return initialProduct;
    if (!slug) return null;
    return DEFAULT_PRODUCTS.find((p) => p.slug === slug || p.id === slug) || null;
  });
  const [pageLoading, setPageLoading] = useState(!initialProduct && !product);
  const [selectedMedia, setSelectedMedia] = useState<ProductMedia | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "wallet">("instapay");

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

  // Free Download State
  const [freeEmail, setFreeEmail] = useState("");
  const [freeName, setFreeName] = useState("");
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeSuccess, setFreeSuccess] = useState(false);
  const [freeError, setFreeError] = useState("");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);
  const [couponError, setCouponError] = useState<string>("");
  const [couponSuccess, setCouponSuccess] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [instantDownloadUrl, setInstantDownloadUrl] = useState<string | null>(null);
  const [trialLicenseKey, setTrialLicenseKey] = useState<string | null>(null);

  // 3-Day Free Trial & License Plans State
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [trialEmail, setTrialEmail] = useState("");
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialResultKey, setTrialResultKey] = useState<string | null>(null);
  const [trialError, setTrialError] = useState("");
  const [trialCopied, setTrialCopied] = useState(false);
  const [productPlans, setProductPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    fetch("/api/store/licenses")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans && Array.isArray(data.plans)) {
          setProductPlans(data.plans);
        }
      })
      .catch(() => { });
  }, []);

  const handleRequestTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !trialEmail) return;

    setTrialLoading(true);
    setTrialError("");

    try {
      const res = await fetch("/api/v1/license/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: trialEmail,
          customerName: name || trialEmail.split("@")[0],
          productId: product.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.rawLicenseKey) {
        setTrialResultKey(data.rawLicenseKey);
      } else {
        setTrialError(data.error || "Failed to generate trial key.");
      }
    } catch (err) {
      setTrialError("Network error. Please try again.");
    } finally {
      setTrialLoading(false);
    }
  };

  const handleFreeDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !freeEmail) return;

    setFreeLoading(true);
    setFreeError("");

    try {
      const res = await fetch("/api/store/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerEmail: freeEmail,
          customerName: freeName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFreeSuccess(true);
        if (data.downloadUrl) {
          window.location.href = data.downloadUrl;
        }
      } else {
        setFreeError(data.error || "An error occurred while preparing your download.");
      }
    } catch (err) {
      setFreeError("Could not connect to server. Please try again later.");
    } finally {
      setFreeLoading(false);
    }
  };

  const [usdExchangeRate, setUsdExchangeRate] = useState<number>(0);

  useEffect(() => {
    if (slug) {
      try {
        const cachedProds = sessionStorage.getItem("store_products_cache");
        if (cachedProds) {
          const parsed = JSON.parse(cachedProds);
          if (Array.isArray(parsed)) {
            const found = parsed.find((p: Product) => p.slug === slug || p.id === slug);
            if (found) setProduct(found);
          }
        }
      } catch (e) {}

      fetch("/api/store/products")
        .then((res) => res.json())
        .then((data: Product[]) => {
          if (Array.isArray(data)) {
            const found = data.find((p) => p.slug === slug || p.id === slug);
            if (found) setProduct(found);
            try {
              sessionStorage.setItem("store_products_cache", JSON.stringify(data));
            } catch (e) {}
          }
        })
        .catch(() => { })
        .finally(() => setPageLoading(false));
    } else {
      setPageLoading(false);
    }

    try {
      const cachedSets = sessionStorage.getItem("store_settings_cache");
      if (cachedSets) {
        const parsed = JSON.parse(cachedSets);
        if (parsed.instapayLink) setInstapayLink(parsed.instapayLink);
        if (parsed.walletNumber) setWalletNumber(parsed.walletNumber);
        if (parsed.usdExchangeRate) setUsdExchangeRate(Number(parsed.usdExchangeRate));
      }
    } catch (e) {}

    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.instapayLink) setInstapayLink(data.instapayLink);
        if (data.walletNumber) setWalletNumber(data.walletNumber);
        if (data.usdExchangeRate) setUsdExchangeRate(Number(data.usdExchangeRate));
        try {
          sessionStorage.setItem("store_settings_cache", JSON.stringify(data));
        } catch (e) {}
      })
      .catch(() => { });
  }, [slug]);

  const filteredPlans = product ? productPlans.filter((p: any) => p.productId === product.id) : [];
  const selectedPlan = filteredPlans.find((p: any) => p.id === selectedPlanId);

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

  const handleSelectPlan = (planId: string, planPriceEgp: number) => {
    setSelectedPlanId(planId);
    if (appliedCoupon) {
      applyOrRefreshCoupon(appliedCoupon, planPriceEgp);
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
          } else {
            setError(data.error || "Could not generate free trial key.");
          }
        } else {
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
          } else {
            setError(data.error || "Could not process free download.");
          }
        }
      } else {
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

  if (pageLoading && !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 pt-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm font-bold font-mono">Loading digital tool details...</p>
      </div>
    );
  }

  if (!product || product.isHidden) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 pt-32">
        <p className="text-text-muted text-lg mb-4">This digital tool is currently hidden or unavailable.</p>
        <Link href="/store" className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl shadow-lg">
          Back to Digital Store
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="pt-28 pb-20 px-4 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface/90 border border-primary/40 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-2xl space-y-5"
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
                Your access token is generated. You can download <strong>{product.title}</strong> directly using the button below.
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
                <span>Download Tool Now</span>
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-border/60">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-background/80 hover:bg-background border border-border text-secondary font-bold text-sm transition-all"
            >
              <FaArrowRight className="rotate-180" />
              <span>Return to Store</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const featureList = Array.isArray(product.features)
    ? product.features
    : (product.features && typeof product.features === "string")
      ? (product.features as string).split(",").map((f) => f.trim()).filter(Boolean)
      : [];

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full min-h-screen text-left">
      <div className="space-y-8">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/40">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-primary transition-all bg-surface/90 hover:bg-surface-hover px-4 py-2.5 rounded-2xl border border-border/80 shadow-md group"
          >
            <FaChevronLeft className="text-[10px] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Digital Store</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-text-muted bg-surface/60 border border-border/60 px-4 py-2 rounded-2xl backdrop-blur-md">
            <Link href="/store" className="hover:text-secondary transition-colors">Store</Link>
            <span className="text-border">/</span>
            <span className="uppercase text-primary font-bold tracking-wider">{product.category}</span>
            <span className="text-border">/</span>
            <span className="text-secondary font-bold truncate max-w-[180px] sm:max-w-[260px]">{product.title}</span>
          </div>
        </div>

        {/* Main 2-Column Product & Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: Product Media, Cover, Highlights & Details (Span 7) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Cover Image & Media Showcase Banner */}
            <div className="relative group bg-surface/90 border border-border/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-orange-500/10 to-amber-500/20 rounded-3xl blur-xl opacity-40 group-hover:opacity-70 transition-all duration-500 -z-10" />

              <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center overflow-hidden border-b border-border/40">
                {selectedMedia ? (
                  selectedMedia.type === "video" ? (
                    selectedMedia.url.includes("youtube.com") || selectedMedia.url.includes("youtu.be") ? (
                      <iframe
                        src={selectedMedia.url.includes("embed") ? selectedMedia.url : selectedMedia.url.replace("watch?v=", "embed/")}
                        title={selectedMedia.caption || product.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={selectedMedia.url} controls autoPlay loop className="w-full h-full object-cover" />
                    )
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.caption || product.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out"
                    />
                  )
                ) : product.coverImage ? (
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

                {selectedMedia?.caption && (
                  <div className="absolute bottom-3 left-4 right-4 bg-black/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-xl text-xs text-white font-medium truncate z-10 text-center">
                    {selectedMedia.caption}
                  </div>
                )}
              </div>

              {/* Gallery Media Thumbnail Selector Strip */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="p-4 bg-surface/50 border-b border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-text-muted uppercase">
                    <span className="flex items-center gap-1.5 text-primary">
                      <FaLayerGroup />
                      <span>Product Demos & Media Showcase ({product.gallery.length + 1})</span>
                    </span>
                    <span className="text-[10px]">Click asset to view preview</span>
                  </div>

                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {product.coverImage && (
                      <button
                        type="button"
                        onClick={() => setSelectedMedia(null)}
                        className={`w-20 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all relative group/thumb ${selectedMedia === null ? "border-primary ring-2 ring-primary/30 scale-105" : "border-border/60 opacity-70 hover:opacity-100"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.coverImage} alt="Main Cover" className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono font-bold text-white text-center py-0.5 uppercase">
                          Cover
                        </span>
                      </button>
                    )}

                    {product.gallery.map((media, idx) => {
                      const isSelected = selectedMedia?.url === media.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedMedia(media)}
                          className={`w-20 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all relative group/thumb ${isSelected ? "border-primary ring-2 ring-primary/30 scale-105" : "border-border/60 opacity-70 hover:opacity-100"}`}
                        >
                          {media.type === "video" ? (
                            <div className="w-full h-full flex items-center justify-center bg-red-950/60 text-red-400">
                              <FaPlay className="text-xs" />
                            </div>
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={media.url} alt={media.caption || `Media ${idx + 1}`} className="w-full h-full object-cover" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-mono font-bold text-white text-center py-0.5 uppercase truncate px-0.5">
                            {media.type === "video" ? "🎥 Video" : media.type === "gif" ? "🎞️ GIF" : `📸 Photo ${idx + 1}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Title & Header Section */}
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug text-secondary">
                    {product.title}
                  </h1>
                  {product.subtitle && (
                    <p className="text-sm sm:text-base font-medium text-primary/90 mt-2 leading-relaxed">
                      {product.subtitle}
                    </p>
                  )}

                  {product.isExternalAuthor && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                      <FaGlobe className="text-amber-400 shrink-0" />
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

                {/* Specs & Highlights Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-background/80 border border-border/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-inner hover:border-primary/40 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm shrink-0">
                      <FaBolt />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">Delivery</span>
                      <span className="text-xs font-bold text-secondary">Instant Expiring Link</span>
                    </div>
                  </div>

                  <div className="bg-background/80 border border-border/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-inner hover:border-primary/40 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm shrink-0">
                      <FaBox />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">Software</span>
                      <span className="text-xs font-bold text-secondary truncate block">
                        {product.software || "Adobe Illustrator"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-background/80 border border-border/80 p-3.5 rounded-2xl flex items-center gap-3 shadow-inner hover:border-primary/40 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm shrink-0">
                      <FaDesktop />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-mono font-bold uppercase text-text-muted block">System</span>
                      <span className="text-xs font-bold text-secondary truncate block">
                        {product.compatibility || "Windows / Mac"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description Paragraph */}
                <div className="pt-4 border-t border-border/40 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs shrink-0">
                      <FaInfoCircle />
                    </div>
                    <h3 className="text-xs font-black text-secondary uppercase tracking-wider font-mono">
                      Overview & Documentation
                    </h3>
                  </div>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                    {product.description}
                  </p>
                </div>

                {/* Key Features Bullet Grid */}
                {featureList.length > 0 && (
                  <div className="pt-4 border-t border-border/40 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-xs shrink-0">
                          <FaLayerGroup />
                        </div>
                        <h3 className="text-xs font-black text-secondary uppercase tracking-wider font-mono">
                          Key Features & Capabilities
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded-full">
                        {featureList.length} Features
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {featureList.map((feature, idx) => (
                        <div
                          key={idx}
                          className="bg-background/80 border border-border/70 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-secondary font-medium hover:border-primary/40 transition-all shadow-sm"
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

            {/* Checkout Form & Payment Card */}
            <div id="checkout-form-section" className="bg-surface/90 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="border-b border-border/60 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-primary tracking-widest block">
                    {isFreeOrTrial ? "Free Digital Asset" : "Instant License Purchase"}
                  </span>
                  <h2 className="text-xl font-black text-secondary">
                    {isFreeOrTrial ? "Get Free Access" : "Order Summary"}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-secondary tracking-tight">
                      {isFreeOrTrial ? "FREE" : `${finalPrice} EGP`}
                    </span>
                    {!isFreeOrTrial && finalPriceUsd > 0 && (
                      <span className="text-xs font-mono text-text-muted">(${finalPriceUsd})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-medium flex items-center gap-2">
                    <FaTimes className="shrink-0 text-sm" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-text-muted uppercase mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abdallah Ahmed"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary text-secondary text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-text-muted uppercase mb-1 block">Email Address (For Delivery) *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary text-secondary text-xs outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-text-muted uppercase mb-1 block">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="010XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary text-secondary text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {!isFreeOrTrial && (
                  <>
                    <div className="pt-2 border-t border-border/40 space-y-3">
                      <label className="text-[11px] font-mono font-bold text-text-muted uppercase block">Select Payment Method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("instapay")}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                            paymentMethod === "instapay"
                              ? "bg-primary/10 border-primary text-secondary shadow-md"
                              : "bg-background/60 border-border text-text-muted hover:border-border/80"
                          }`}
                        >
                          <FaBolt className="text-primary text-sm" />
                          <span>InstaPay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("wallet")}
                          className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                            paymentMethod === "wallet"
                              ? "bg-primary/10 border-primary text-secondary shadow-md"
                              : "bg-background/60 border-border text-text-muted hover:border-border/80"
                          }`}
                        >
                          <FaMobileAlt className="text-amber-400 text-sm" />
                          <span>Smart Wallet</span>
                        </button>
                      </div>

                      {/* Payment Instructions Details Box */}
                      <div className="p-3.5 bg-background/90 border border-border/80 rounded-2xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-text-muted uppercase font-bold">
                            {paymentMethod === "instapay" ? "InstaPay Address" : "Wallet Number"}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(paymentMethod === "instapay" ? instapayLink : walletNumber)}
                            className="text-primary hover:text-primary-dark font-bold text-[10px] flex items-center gap-1"
                          >
                            <FaCopy />
                            <span>{copied ? "Copied!" : "Copy"}</span>
                          </button>
                        </div>
                        <p className="font-mono font-bold text-secondary text-xs break-all">
                          {paymentMethod === "instapay" ? instapayLink : walletNumber}
                        </p>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono font-bold text-text-muted uppercase mb-1 block">Sender Number / InstaPay Username *</label>
                        <input
                          type="text"
                          required
                          placeholder="010XXXXXXXX or username@instapay"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-background/80 border border-border focus:border-primary text-secondary text-xs outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono font-bold text-text-muted uppercase mb-1 block">Upload Transfer Receipt *</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="w-full text-xs text-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-black hover:file:bg-primary-dark transition-all"
                        />
                        {previewUrl && (
                          <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-primary/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={previewUrl} alt="Receipt Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-dark text-black font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Processing Order...</span>
                  ) : isFreeOrTrial ? (
                    <>
                      <FaDownload />
                      <span>Download Now Free</span>
                    </>
                  ) : (
                    <>
                      <FaShieldAlt />
                      <span>Confirm & Submit Order</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
