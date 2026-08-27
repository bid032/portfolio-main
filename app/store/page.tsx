"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product, CategoryType, PricingType } from "@/lib/store-types";
import {
  FaSearch,
  FaDownload,
  FaShoppingCart,
  FaCheckCircle,
  FaLayerGroup,
  FaTimes,
  FaExternalLinkAlt,
  FaBolt,
  FaShieldAlt,
  FaSyncAlt,
  FaCode,
  FaMagic,
  FaCheck,
  FaStar,
  FaWhatsapp,
  FaArrowRight,
  FaCopy,
  FaTag,
  FaGlobe,
} from "react-icons/fa";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [selectedPricing, setSelectedPricing] = useState<PricingType>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high" | "newest">("featured");
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  // Free download modal state
  const [freeEmail, setFreeEmail] = useState("");
  const [freeName, setFreeName] = useState("");
  const [freeLoading, setFreeLoading] = useState(false);
  const [freeSuccess, setFreeSuccess] = useState(false);
  const [freeError, setFreeError] = useState("");

  const [spotlightId, setSpotlightId] = useState<string>("");
  const [heroBannerText, setHeroBannerText] = useState("");
  const [heroBannerEnabled, setHeroBannerEnabled] = useState(true);
  const [copiedCodeToast, setCopiedCodeToast] = useState<string | null>(null);

  const handleCopyCouponCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeToast(code);
    setTimeout(() => setCopiedCodeToast(null), 3500);
  };

  const renderBannerTextWithClickableCode = (text: string) => {
    const codeMatch = text.match(/\bcode\s+([A-Za-z0-9_-]+)/i);
    if (!codeMatch) {
      return <span>{text}</span>;
    }

    const fullMatchStr = codeMatch[0];
    const codeVal = codeMatch[1];
    const codeWord = fullMatchStr.split(/\s+/)[0] || "Code";
    const parts = text.split(fullMatchStr);

    return (
      <span>
        {parts[0]}
        {codeWord}{" "}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyCouponCode(codeVal);
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 font-mono font-black text-xs cursor-pointer transition-all shadow-md group/btn"
          title="Click to copy coupon code"
        >
          {/* <FaTag className="text-[10px] text-amber-400 group-hover/btn:scale-110 transition-transform" /> */}
          <span>{codeVal}</span>
          <FaCopy className="text-[10px] text-amber-300 opacity-80" />
        </button>
        {parts[1]}
      </span>
    );
  };

  useEffect(() => {
    // Instant initial render from client cache
    try {
      const cachedProds = sessionStorage.getItem("store_products_cache");
      if (cachedProds) {
        const parsed = JSON.parse(cachedProds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
      const cachedSets = sessionStorage.getItem("store_settings_cache");
      if (cachedSets) {
        const parsed = JSON.parse(cachedSets);
        if (parsed.spotlightProductId) setSpotlightId(parsed.spotlightProductId);
        if (parsed.heroBannerText) setHeroBannerText(parsed.heroBannerText);
        if (parsed.heroBannerEnabled !== undefined) setHeroBannerEnabled(parsed.heroBannerEnabled);
      }
    } catch (e) {}

    fetch("/api/store/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          try {
            sessionStorage.setItem("store_products_cache", JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => { });

    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.spotlightProductId) {
          setSpotlightId(data.spotlightProductId);
        }
        if (data.heroBannerText) {
          setHeroBannerText(data.heroBannerText);
        }
        if (data.heroBannerEnabled !== undefined) {
          setHeroBannerEnabled(data.heroBannerEnabled);
        }
        try {
          sessionStorage.setItem("store_settings_cache", JSON.stringify(data));
        } catch (e) {}
      })
      .catch(() => { });
  }, []);

  const filteredProducts = products.filter((p) => {
    if (p.isHidden) return false;

    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.compatibility && p.compatibility.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    const matchesPricing =
      selectedPricing === "all" || p.pricingType === selectedPricing;

    return matchesSearch && matchesCategory && matchesPricing;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.priceEgp - b.priceEgp;
    if (sortBy === "price-high") return b.priceEgp - a.priceEgp;
    if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();

    if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    }
    return (b.badge === "Popular" ? 1 : 0) - (a.badge === "Popular" ? 1 : 0);
  });

  const spotlightProduct =
    products.find((p) => p.id === spotlightId || p.slug === spotlightId) ||
    products.find((p) => p.badge === "Popular" || p.badge === "Featured") ||
    products[0];

  const handleFreeDownloadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalProduct || !freeEmail) return;

    setFreeLoading(true);
    setFreeError("");

    try {
      const res = await fetch("/api/store/free-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: activeModalProduct.id,
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
        setFreeError(data.error || "An error occurred while sending the link.");
      }
    } catch (err) {
      setFreeError("Could not connect to server. Please try again later.");
    } finally {
      setFreeLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    "Hi Abdallah! I would like to inquire about the tools and files for the digital store."
  );

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-left relative overflow-x-hidden">
      {/* Background Creative Ambient Glow (Seamless Radial Gradients) */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(245,127,0,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-[radial-gradient(circle_at_center,rgba(245,127,0,0.07)_0%,transparent_65%)]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]" />
      </div>

      {/* Dynamic Store Hero Announcement Banner */}
      {heroBannerEnabled && heroBannerText && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            const codeMatch = heroBannerText.match(/\bcode\s+([A-Za-z0-9_-]+)/i);
            if (codeMatch && codeMatch[1]) {
              handleCopyCouponCode(codeMatch[1]);
            }
          }}
          className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-primary/10 to-amber-500/20 border border-amber-500/40 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto cursor-pointer group hover:border-amber-500/70 transition-all"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-base shrink-0 group-hover:scale-110 transition-transform">
              <FaBolt />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-bold text-secondary leading-snug">
                {renderBannerTextWithClickableCode(heroBannerText)}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              const el = document.getElementById("store-products-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <span>Explore Tools</span>
            <FaArrowRight className="text-xs" />
          </button>
        </motion.div>
      )}

      {/* Store Hero Banner Section */}
      <div className="text-center mb-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-[0_0_25px_rgba(245,127,0,0.2)]"
        >
          <FaMagic className="text-xs" />
          <span>Production-Grade Digital Tools Hub</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-6xl md:text-7xl font-extrabold text-secondary tracking-tight mb-5"
        >
          Digital Tools,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">
            Plugins & Scripts
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-text-secondary text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium"
        >
          A hand-crafted suite of high-performance tools, design automation scripts, and workflow plugins built to maximize creative efficiency.
        </motion.p>

        {/* Feature Highlights Grid (Bento Value Strip - Responsive 1 col on mobile, 2 on tablet, 4 on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 max-w-5xl mx-auto mt-10 text-left"
        >
          <div className="p-4 rounded-2xl bg-surface/70 border border-border/80 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-all group flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
              <FaBolt className="text-base" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-secondary mb-0.5">Instant Delivery</h4>
              <p className="text-[11px] text-text-muted leading-tight">Instant access link & download token</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-border/80 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-all group flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
              <FaShieldAlt className="text-base" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-secondary mb-0.5">100% Tested Quality</h4>
              <p className="text-[11px] text-text-muted leading-tight">Clean, production-ready assets</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-border/80 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-all group flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
              <FaSyncAlt className="text-base" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-secondary mb-0.5">Lifetime Updates</h4>
              <p className="text-[11px] text-text-muted leading-tight">Free future patches & feature releases</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface/70 border border-border/80 backdrop-blur-xl shadow-lg hover:border-primary/40 transition-all group flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition-transform">
              <FaCode className="text-base" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-secondary mb-0.5">Seamless Integration</h4>
              <p className="text-[11px] text-text-muted leading-tight">Works with Adobe, Web, and Scripts</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spotlight Tool Banner Section */}
      {spotlightProduct && (
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-surface/95 via-surface/80 to-surface/95 border border-primary/40 backdrop-blur-2xl shadow-[0_10px_40px_rgba(245,127,0,0.15)] relative overflow-hidden text-left"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="space-y-3 max-w-2xl w-full">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                  <FaStar className="text-[9px]" />
                  <span>Spotlight Tool of the Month</span>
                </span>
                {spotlightProduct.version && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/30">
                    {spotlightProduct.version}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-secondary">
                {spotlightProduct.title}
              </h2>

              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-2 font-medium">
                {spotlightProduct.description}
              </p>

              {spotlightProduct.features && spotlightProduct.features.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {spotlightProduct.features.slice(0, 3).map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-xl bg-background/80 border border-border/70 text-text-secondary font-medium"
                    >
                      <FaCheckCircle className="text-primary text-xs shrink-0" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col items-center gap-3 shrink-0 w-full lg:w-auto">
              <Link
                href={`/store/${spotlightProduct.slug || spotlightProduct.id}`}
                className="w-full sm:w-auto lg:w-48 px-6 py-3.5 rounded-2xl bg-primary text-black font-black text-xs sm:text-sm hover:bg-primary-dark shadow-[0_0_25px_rgba(245,127,0,0.4)] transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Get This Tool</span>
                <FaArrowRight className="text-xs" />
              </Link>

              <button
                onClick={() => setActiveModalProduct(spotlightProduct)}
                className="w-full sm:w-auto lg:w-48 px-6 py-3 rounded-2xl bg-surface border border-border/80 text-secondary text-xs font-bold hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <FaExternalLinkAlt className="text-[10px] text-primary" />
                <span>Quick Details</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter & Search Bar Section */}
      <div id="store-products-grid" className="mb-12 space-y-4 scroll-mt-28">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface/90 border border-border/80 p-4 rounded-3xl backdrop-blur-2xl shadow-xl">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
            <input
              type="text"
              placeholder="Search tools or scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/90 border border-border/80 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-secondary placeholder-text-muted focus:outline-none focus:border-primary transition-all shadow-inner font-medium"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none w-full md:w-auto justify-start md:justify-center">
            {[
              { id: "all", label: "All Items" },
              { id: "plugin", label: "Plugins" },
              { id: "tool", label: "Tools & Apps" },
              { id: "script", label: "Scripts & Code" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as CategoryType)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap border ${selectedCategory === tab.id
                  ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(245,127,0,0.4)] scale-105"
                  : "border-border/60 text-text-secondary hover:text-secondary hover:border-border bg-background/50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Paid / Free Pricing Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-background/90 p-1.5 rounded-2xl border border-border/80">
              {[
                { id: "all", label: "All Prices" },
                { id: "paid", label: "Paid" },
                { id: "free", label: "Free" },
              ].map((priceTab) => (
                <button
                  key={priceTab.id}
                  onClick={() => setSelectedPricing(priceTab.id as PricingType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedPricing === priceTab.id
                    ? "bg-surface border border-border text-primary font-bold shadow-md"
                    : "text-text-muted hover:text-secondary"
                    }`}
                >
                  {priceTab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Cards Grid - Portfolio Style Clean Cards */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-24 bg-surface/40 border border-border/60 rounded-3xl backdrop-blur-xl">
          <FaLayerGroup className="mx-auto text-4xl text-text-muted mb-4 opacity-50" />
          <p className="text-text-muted text-base font-bold mb-2">No digital tools found matching your search.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedPricing("all");
              setSortBy("featured");
            }}
            className="text-primary font-bold text-sm hover:underline"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {sortedProducts.map((product) => {
            const isPaid = product.pricingType === "paid";
            const coverImg = product.coverImage || "/Photos/Tools/illustrator.png";
            const productHref = `/store/${product.slug || product.id}`;
            const discountPercent =
              isPaid && product.originalPriceEgp && product.originalPriceEgp > product.priceEgp
                ? Math.round(((product.originalPriceEgp - product.priceEgp) / product.originalPriceEgp) * 100)
                : 0;

            return (
              <motion.div
                key={product.id}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full"
              >
                <Link
                  href={productHref}
                  className="group relative bg-surface/90 border border-border/80 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_15px_40px_rgba(245,127,0,0.25)] hover:border-primary/60 transition-all duration-500 backdrop-blur-2xl flex flex-col justify-between h-full block cursor-pointer"
                >
                  <div>
                    {/* Cover Image Showcase Area */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900 border-b border-border/40">
                      <img
                        src={coverImg}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Soft Dark Overlay so badges on images pop cleanly */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider backdrop-blur-md border shadow-lg ${isPaid
                            ? "bg-black/75 border-amber-500/50 text-amber-300"
                            : "bg-black/75 border-emerald-500/50 text-emerald-400"
                            }`}
                        >
                          <span>
                            {isPaid ? (
                              <>
                                {product.originalPriceEgp && product.originalPriceEgp > product.priceEgp && (
                                  <span className="line-through opacity-60 mr-1.5 font-mono">{product.originalPriceEgp} EGP</span>
                                )}
                                <span>{product.priceEgp} EGP</span>
                              </>
                            ) : (
                              "Free Download"
                            )}
                          </span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {discountPercent > 0 && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-emerald-500 text-black shadow-lg uppercase">
                              -{discountPercent}% OFF
                            </span>
                          )}

                          {product.version && (
                            <span className="text-[10px] font-mono font-bold bg-black/80 text-white border border-white/20 px-2.5 py-1 rounded-xl backdrop-blur-md shadow-md">
                              {product.version}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Body Content Info (Title, Category, Description) */}
                    <div className="p-6 space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0" />
                          <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-widest">
                            {product.category}
                          </span>
                        </div>
                        {product.isExternalAuthor && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                            <FaGlobe className="text-[9px] text-amber-500" />
                            <span>By {product.authorName || "External"}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-secondary group-hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                      </h3>

                      <p className="text-text-muted text-xs sm:text-sm leading-relaxed line-clamp-2 font-medium">
                        {product.description}
                      </p>

                      <div className="space-y-2 pt-3 border-t border-border/40 text-xs">
                        {product.compatibility && product.compatibility.trim().length > 0 && (
                          <div className="flex items-center gap-2 text-[11px] font-mono text-text-secondary">
                            <span className="text-text-muted">Compatibility:</span>
                            <strong className="text-secondary font-semibold">{product.compatibility}</strong>
                          </div>
                        )}

                        {product.features && product.features.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {product.features.slice(0, 3).map((feat, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-background border border-border/80 text-secondary font-semibold"
                              >
                                <FaCheckCircle className="text-primary text-[9px] shrink-0" />
                                <span>{feat}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 pb-6 pt-3 flex items-center justify-between gap-3 border-t border-border/30 mt-2">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-text-secondary group-hover:text-secondary transition-all flex items-center gap-1.5">
                      <span>View Details</span>
                      <FaExternalLinkAlt className="text-[9px] text-primary" />
                    </span>

                    {isPaid ? (
                      <span className="px-5 py-2.5 rounded-2xl text-xs font-black bg-primary text-black group-hover:bg-primary-dark shadow-[0_0_20px_rgba(245,127,0,0.4)] transition-all flex items-center gap-2">
                        <span>Buy Now</span>
                      </span>
                    ) : (
                      <span className="px-5 py-2.5 rounded-2xl text-xs font-black bg-emerald-500 text-black group-hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2">
                        <span>Free Access</span>
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bottom Creative Bento Banner: Why Choose Our Tools */}
      <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-surface/80 border border-border/80 backdrop-blur-2xl relative overflow-hidden text-left shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono font-bold uppercase tracking-widest">
            <span>Guaranteed Quality</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-secondary tracking-tight">
            Crafted for <span className="text-primary">Designers, Editors & Developers</span>
          </h2>

          <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-medium">
            Every tool in our store is created to solve real production bottlenecks. From automated script actions to custom UI components, every download includes documentation and technical support.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 text-xs font-bold text-secondary">
            <div className="flex items-center gap-2">
              <FaCheck className="text-primary" />
              <span>Instant Download Tokens</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="text-primary" />
              <span>Direct WhatsApp Support</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheck className="text-primary" />
              <span>Clean Codebase Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Direct WhatsApp Assistance Floating Card */}
      <div className="mt-16 text-center">
        <a
          href={`https://api.whatsapp.com/send/?phone=%2B201028463485&text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all shadow-lg group"
        >
          <FaWhatsapp className="text-xl text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>Need Custom Scripting or Instant Order Help? Chat on WhatsApp</span>
        </a>
      </div>



      {/* Product Details & Download Modal */}
      <AnimatePresence>
        {activeModalProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveModalProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-left"
            >
              <button
                onClick={() => setActiveModalProduct(null)}
                className="absolute top-4 right-4 text-text-muted hover:text-secondary p-2 rounded-full border border-border/60 bg-background/50"
              >
                <FaTimes />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-widest mb-2">
                <span>{activeModalProduct.category}</span>
                {activeModalProduct.version && (
                  <>
                    <span>•</span>
                    <span>{activeModalProduct.version}</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl font-black text-secondary mb-2">{activeModalProduct.title}</h2>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed mb-6">
                {activeModalProduct.description}
              </p>

              {activeModalProduct.features && activeModalProduct.features.length > 0 && (
                <div className="bg-background/80 border border-border/80 rounded-2xl p-4 mb-6 space-y-2">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Key Features & Highlights:</h4>
                  {activeModalProduct.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-text-secondary">
                      <FaCheckCircle className="text-primary text-xs shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Free vs Paid Form Action */}
              {activeModalProduct.pricingType === "paid" ? (
                <div className="flex items-center justify-between pt-4 border-t border-border/60">
                  <div>
                    <span className="text-xs text-text-muted uppercase font-mono block">Total Investment</span>
                    <span className="text-2xl font-black text-primary font-mono">
                      {activeModalProduct.priceEgp} EGP <span className="text-xs text-text-muted font-normal">(${activeModalProduct.priceUsd})</span>
                    </span>
                  </div>

                  <Link
                    href={`/store/checkout?product=${activeModalProduct.id}`}
                    className="px-6 py-3 rounded-2xl bg-primary text-black font-bold text-sm hover:bg-primary-dark transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(245,127,0,0.4)]"
                  >
                    <FaShoppingCart />
                    <span>Proceed to Checkout</span>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-border/60">
                  {freeSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center text-emerald-400 text-sm">
                      <FaCheckCircle className="mx-auto text-2xl mb-2" />
                      <p className="font-bold">Download Started Successfully!</p>
                      <p className="text-xs opacity-80 mt-1">
                        A backup copy of the download link has also been sent to your email.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleFreeDownloadSubmit} className="space-y-3">
                      <h4 className="text-xs font-bold text-secondary">Enter your email to start instant download:</h4>
                      <input
                        type="email"
                        required
                        placeholder="yourname@example.com"
                        value={freeEmail}
                        onChange={(e) => setFreeEmail(e.target.value)}
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-sm text-secondary placeholder-text-muted focus:border-primary outline-none"
                      />
                      {freeError && <p className="text-red-400 text-xs">{freeError}</p>}
                      <button
                        type="submit"
                        disabled={freeLoading}
                        className="w-full py-3 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                      >
                        <FaDownload />
                        <span>{freeLoading ? "Preparing Download..." : "Download Now"}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification for Coupon Copy */}
      <AnimatePresence>
        {copiedCodeToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-amber-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2.5 font-mono border border-amber-300"
          >
            <FaCheckCircle className="text-lg text-black shrink-0" />
            <div>
              <div className="font-black text-xs">COUPON COPIED TO CLIPBOARD!</div>
              <div className="text-[11px] font-normal opacity-90">Code: <span className="font-bold underline">{copiedCodeToast}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
