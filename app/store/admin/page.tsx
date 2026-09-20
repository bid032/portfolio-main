"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Product, Order, Coupon, ProductMedia, License, Plan, LicensePayment, Device } from "@/lib/store-types";
import {
  FaLock,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaImage,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCog,
  FaLayerGroup,
  FaShoppingBag,
  FaTimes,
  FaTag,
  FaToggleOn,
  FaToggleOff,
  FaSpinner,
  FaBox,
  FaSearch,
  FaCopy,
  FaWhatsapp,
  FaHistory,
  FaChartLine,
  FaCheck,
  FaBan,
  FaExternalLinkAlt,
  FaEnvelope,
  FaUsers,
  FaDownload,
  FaFileExport,
  FaFileExcel,
  FaFilter,
  FaFileCode,
  FaAddressCard,
  FaKey,
  FaLaptop,
  FaShieldAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaFileAlt,
  FaPaperPlane,
  FaPercent,
  FaUserCheck,
  FaBullhorn,
  FaStar,
  FaCrown,
  FaVideo,
  FaPlay,
  FaEye,
  FaEyeSlash,
  FaArrowUp,
  FaArrowDown,
  FaSort,
  FaCoins,
} from "react-icons/fa";

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: "order" | "product" | "coupon" | "settings" | "auth";
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [remainingHours, setRemainingHours] = useState<number | null>(null);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);

  const [activeTab, setActiveTab] = useState<
    | "orders"
    | "products"
    | "coupons"
    | "customers"
    | "audit"
    | "settings"
    | "contact_leads"
    | "analytics"
    | "licenses"
    | "plans"
    | "payments"
  >("analytics");

  const [ordersFilterMode, setOrdersFilterMode] = useState<"all" | "pending" | "approved" | "free">("all");
  const [productsSubTab, setProductsSubTab] = useState<"products" | "plans">("products");
  const [settingsSubTab, setSettingsSubTab] = useState<"config" | "audit">("config");

  // License Platform State
  const [licenses, setLicenses] = useState<License[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [licensePayments, setLicensePayments] = useState<LicensePayment[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [licenseDevices, setLicenseDevices] = useState<any[]>([]);
  const [licenseSearch, setLicenseSearch] = useState("");
  const [licenseStatusFilter, setLicenseStatusFilter] = useState<string>("all");
  const [licenseProductFilter, setLicenseProductFilter] = useState<string>("all");

  const [nowTime, setNowTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRemainingTime = (expiresAtStr?: string | null, currentTime: Date = new Date()) => {
    if (!expiresAtStr) return { text: "No expiry set", isExpired: false, urgent: false };
    const expiresAt = new Date(expiresAtStr).getTime();
    const diffMs = expiresAt - currentTime.getTime();

    if (diffMs <= 0) {
      return { text: "Expired", isExpired: true, urgent: true };
    }

    const totalSecs = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (days > 0) {
      return {
        text: `${days}d ${hours}h ${minutes}m left`,
        isExpired: false,
        urgent: days < 1,
      };
    }

    if (hours > 0) {
      return {
        text: `${hours}h ${minutes}m ${seconds}s left`,
        isExpired: false,
        urgent: true,
      };
    }

    if (minutes > 0) {
      return {
        text: `${minutes}m ${seconds}s left`,
        isExpired: false,
        urgent: true,
      };
    }

    return {
      text: `${seconds}s left`,
      isExpired: false,
      urgent: true,
    };
  };

  // Manual License Modal
  const [showManualLicenseModal, setShowManualLicenseModal] = useState(false);
  const [manualUserEmail, setManualUserEmail] = useState("");
  const [manualProductId, setManualProductId] = useState("");
  const [manualPlanId, setManualPlanId] = useState("");
  const [manualCustomValue, setManualCustomValue] = useState<number>(30);
  const [manualCustomUnit, setManualCustomUnit] = useState<"minutes" | "hours" | "days">("days");
  const [manualCustomDays, setManualCustomDays] = useState<number>(30);
  const [manualMaxDevices, setManualMaxDevices] = useState<number>(2);
  const [issuedRawKeyModal, setIssuedRawKeyModal] = useState<{ rawKey: string; email: string; expiresAt: string } | null>(null);
  const [isKeyCopied, setIsKeyCopied] = useState(false);

  // License Key & Device Custom Modals (No native browser alerts/prompts)
  const [unmaskedKeys, setUnmaskedKeys] = useState<Record<string, boolean>>({});
  const [editMaxDevicesModal, setEditMaxDevicesModal] = useState<{ isOpen: boolean; licenseId: string; userEmail: string; currentMax: number } | null>(null);
  const [newMaxDevicesInput, setNewMaxDevicesInput] = useState<number>(2);
  const [deviceInspectorModal, setDeviceInspectorModal] = useState<{ isOpen: boolean; license: License } | null>(null);

  // Subscription Plan Creation & Edit Modal State
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [editPlanModal, setEditPlanModal] = useState<Plan | null>(null);
  const [newPlanProductId, setNewPlanProductId] = useState("");
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDurationValue, setNewPlanDurationValue] = useState<number>(30);
  const [newPlanDurationUnit, setNewPlanDurationUnit] = useState<"minutes" | "hours" | "days">("days");
  const [newPlanDurationDays, setNewPlanDurationDays] = useState<number>(30);
  const [newPlanPriceEgp, setNewPlanPriceEgp] = useState<number>(300);
  const [newPlanPriceUsd, setNewPlanPriceUsd] = useState<number>(10);
  const [newPlanMaxDevices, setNewPlanMaxDevices] = useState<number>(2);
  const [newPlanIsTrial, setNewPlanIsTrial] = useState(false);
  const [planProductFilter, setPlanProductFilter] = useState<string>("all");

  // Customer Leads Marketing Tab Advanced State
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<"all" | "paid" | "free">("all");
  const [customerProductFilter, setCustomerProductFilter] = useState<string>("all");
  const [customerDateRange, setCustomerDateRange] = useState<"all" | "30days" | "7days" | "today">("all");
  const [customerExportMode, setCustomerExportMode] = useState<"unique_profiles" | "all_transactions">("unique_profiles");
  const [showMarketingCampaignModal, setShowMarketingCampaignModal] = useState(false);
  const [campaignTemplate, setCampaignTemplate] = useState<"launch" | "discount" | "feedback">("launch");
  const [campaignCustomMsg, setCampaignCustomMsg] = useState("");

  // Search & Filter State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [orderPricingFilter, setOrderPricingFilter] = useState<"all" | "paid" | "free">("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState<"all" | "plugin" | "tool" | "script">("all");

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [approvalSuccess, setApprovalSuccess] = useState<string | null>(null);
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [deletingAllOrders, setDeletingAllOrders] = useState(false);

  // Custom Website Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  } | null>(null);

  const askConfirmation = ({
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger",
    onConfirm,
  }: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm: () => {
        setConfirmModal(null);
        onConfirm();
      },
    });
  };

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log_init",
      action: "Admin Dashboard Loaded",
      details: "Session initialized successfully",
      timestamp: new Date().toISOString(),
      type: "auth",
    },
  ]);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponTypeInput, setCouponTypeInput] = useState<"percentage" | "fixed">("percentage");
  const [couponValueInput, setCouponValueInput] = useState<number>(20);
  const [couponMinOrderInput, setCouponMinOrderInput] = useState<number>(100);
  const [couponMaxUsesInput, setCouponMaxUsesInput] = useState<number>(50);
  const [couponTargetProductInput, setCouponTargetProductInput] = useState<string>("all");

  const normalizeCategory = (cat?: string): "plugin" | "tool" | "script" => {
    if (!cat) return "plugin";
    const c = cat.toLowerCase().trim();
    if (c.includes("tool") || c.includes("app")) return "tool";
    if (c.includes("script") || c.includes("code")) return "script";
    return "plugin";
  };

  const [activeSpotlightId, setActiveSpotlightId] = useState<string>("");
  const [heroBannerText, setHeroBannerText] = useState("Special Offer: Get 20% OFF on all Illustrator plugins with code WELCOME20!");
  const [heroBannerEnabled, setHeroBannerEnabled] = useState(true);

  // Analytics Selected Month State (0-11)
  const [analyticsMonth, setAnalyticsMonth] = useState<number>(new Date().getMonth());

  // Quick Price Edit & Bulk Order Approval State
  const [editingInlinePriceId, setEditingInlinePriceId] = useState<string | null>(null);
  const [inlinePriceValue, setInlinePriceValue] = useState<number>(0);
  const [approvingAllOrders, setApprovingAllOrders] = useState(false);

  // CRM Custom WhatsApp Modal State
  const [whatsappModalCustomer, setWhatsappModalCustomer] = useState<{
    name: string;
    phone: string;
    email: string;
    totalSpent: number;
    items: string[];
    tag: "VIP Customer" | "Repeat Customer" | "Paid Customer" | "Free Lead";
  } | null>(null);
  const [whatsappTemplate, setWhatsappTemplate] = useState<"offer" | "update" | "support" | "custom">("offer");
  const [whatsappCustomText, setWhatsappCustomText] = useState("");

  const [prodTitle, setProdTitle] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodSub, setProdSub] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCat, setProdCat] = useState<"plugin" | "tool" | "script">("plugin");
  const [prodPricing, setProdPricing] = useState<"free" | "paid">("paid");
  const [prodPriceEgp, setProdPriceEgp] = useState(450);
  const [prodOriginalPriceEgp, setProdOriginalPriceEgp] = useState<number | "">(550);
  const [prodPriceUsd, setProdPriceUsd] = useState(15);
  const [usdExchangeRate, setUsdExchangeRate] = useState<number>(50);
  const [prodIsExternalAuthor, setProdIsExternalAuthor] = useState<boolean>(false);
  const [prodAuthorName, setProdAuthorName] = useState<string>("");
  const [prodAuthorLink, setProdAuthorLink] = useState<string>("");
  const [prodSortOrder, setProdSortOrder] = useState<number>(0);
  const [prodIsHidden, setProdIsHidden] = useState<boolean>(false);
  const [prodBadge, setProdBadge] = useState<"Popular" | "New" | "Featured" | "Sale" | "Free">("Popular");
  const [prodSoftware, setProdSoftware] = useState("Adobe Illustrator");
  const [prodComp, setProdComp] = useState("Windows / Mac");
  const [prodVer, setProdVer] = useState("v1.0.0");
  const [prodFileUrl, setProdFileUrl] = useState("/assets/downloads/sample-tool.zip");
  const [prodCoverImage, setProdCoverImage] = useState("/Photos/Tools/illustrator.png");
  const [prodGallery, setProdGallery] = useState<ProductMedia[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newGalleryType, setNewGalleryType] = useState<"image" | "video" | "gif">("image");
  const [newGalleryCaption, setNewGalleryCaption] = useState("");
  const [prodFeatures, setProdFeatures] = useState("Feature 1, Feature 2, Feature 3");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Edit License Duration Modal State
  const [editDurationModal, setEditDurationModal] = useState<{
    isOpen: boolean;
    license: any;
  }>({ isOpen: false, license: null });
  const [editDurValue, setEditDurValue] = useState<number>(30);
  const [editDurUnit, setEditDurUnit] = useState<string>("days");
  const [editDurSetFromNow, setEditDurSetFromNow] = useState<boolean>(true);
  const [editDurExactDate, setEditDurExactDate] = useState<string>("");
  const [updatingDuration, setUpdatingDuration] = useState<boolean>(false);

  const openDurationModal = (lic: any) => {
    setEditDurValue(lic.durationValue || lic.durationDays || 30);
    setEditDurUnit(lic.durationUnit || "days");
    setEditDurSetFromNow(true);
    if (lic.expiresAt) {
      const d = new Date(lic.expiresAt);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setEditDurExactDate(localIso);
    } else {
      setEditDurExactDate("");
    }
    setEditDurationModal({ isOpen: true, license: lic });
  };

  // Toast Notification State
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const addAuditLog = (action: string, details: string, type: AuditLog["type"] = "settings") => {
    setAuditLogs((prev) => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        action,
        details,
        timestamp: new Date().toISOString(),
        type,
      },
      ...prev,
    ]);
  };

  const openWhatsAppChat = (phone: string, customerName: string, productTitle: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      showToast("No valid phone number provided for this customer.", "error");
      return;
    }
    if (cleanPhone.startsWith("01")) {
      cleanPhone = `20${cleanPhone.substring(1)}`;
    }
    const message = encodeURIComponent(
      `Hello ${customerName},\n\nThis is Abdallah Ahmed regarding your order for "${productTitle}" on Abdallah Store.\n\nPlease let us know if you need any assistance with your software license or installation.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const copyToClipboard = (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          showToast(`${label} copied to clipboard!`, "success");
        }).catch(() => {
          fallbackCopyTextToClipboard(text, label);
        });
      } else {
        fallbackCopyTextToClipboard(text, label);
      }
    } catch (e) {
      fallbackCopyTextToClipboard(text, label);
    }
  };

  const fallbackCopyTextToClipboard = (text: string, label: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        showToast(`${label} copied to clipboard!`, "success");
      } else {
        showToast("Failed to copy to clipboard", "error");
      }
    } catch (err) {
      showToast("Failed to copy to clipboard", "error");
    }
  };

  // Advanced Customer Leads Data Helpers
  const getFilteredOrders = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    dateRange: "all" | "30days" | "7days" | "today" = "all"
  ) => {
    const now = new Date().getTime();
    return orders.filter((o) => {
      const isFree = o.pricingType === "free" || (o.productPrice || 0) === 0;
      const matchesType = filterType === "all" ? true : filterType === "paid" ? !isFree : isFree;
      const matchesProd = targetProductId === "all" ? true : o.productId === targetProductId;

      let matchesDate = true;
      if (dateRange !== "all" && o.createdAt) {
        const orderTime = new Date(o.createdAt).getTime();
        const diffDays = (now - orderTime) / (1000 * 3600 * 24);
        if (dateRange === "today") matchesDate = diffDays <= 1;
        else if (dateRange === "7days") matchesDate = diffDays <= 7;
        else if (dateRange === "30days") matchesDate = diffDays <= 30;
      }

      return matchesType && matchesProd && matchesDate;
    });
  };

  const getUniqueCustomerProfiles = (filteredOrdersList: Order[]) => {
    const map = new Map<string, {
      customerEmail: string;
      customerName: string;
      customerPhone: string;
      totalOrders: number;
      paidOrdersCount: number;
      totalSpentEgp: number;
      purchasedProducts: Set<string>;
      freeProducts: Set<string>;
      firstDate: string;
      lastDate: string;
    }>();

    filteredOrdersList.forEach((o) => {
      const key = o.customerEmail?.toLowerCase().trim() || o.customerPhone?.trim() || o.id;
      const isFree = o.pricingType === "free" || (o.productPrice || 0) === 0;
      const price = o.productPrice || 0;

      if (!map.has(key)) {
        map.set(key, {
          customerEmail: o.customerEmail || "",
          customerName: o.customerName || "Customer",
          customerPhone: o.customerPhone || "-",
          totalOrders: 1,
          paidOrdersCount: isFree ? 0 : 1,
          totalSpentEgp: isFree ? 0 : price,
          purchasedProducts: isFree ? new Set() : new Set([o.productTitle]),
          freeProducts: isFree ? new Set([o.productTitle]) : new Set(),
          firstDate: o.createdAt,
          lastDate: o.createdAt,
        });
      } else {
        const existing = map.get(key)!;
        existing.totalOrders += 1;
        if (!isFree) {
          existing.paidOrdersCount += 1;
          existing.totalSpentEgp += price;
          existing.purchasedProducts.add(o.productTitle);
        } else {
          existing.freeProducts.add(o.productTitle);
        }
        if (o.customerName && existing.customerName === "Customer") {
          existing.customerName = o.customerName;
        }
        if (o.customerPhone && o.customerPhone !== "-" && existing.customerPhone === "-") {
          existing.customerPhone = o.customerPhone;
        }
        if (new Date(o.createdAt) < new Date(existing.firstDate)) {
          existing.firstDate = o.createdAt;
        }
        if (new Date(o.createdAt) > new Date(existing.lastDate)) {
          existing.lastDate = o.createdAt;
        }
      }
    });

    return Array.from(map.values()).map((c) => {
      let segment = "Free Lead";
      if (c.paidOrdersCount > 3) {
        segment = "VIP Customer";
      } else if (c.totalSpentEgp > 0) {
        segment = "Paid Customer";
      }
      return { ...c, segment };
    });
  };

  const exportCustomersToExcel = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    mode: "unique_profiles" | "all_transactions" = customerExportMode,
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);

    if (filtered.length === 0) {
      showToast("No customer records match the selected export filter.", "error");
      return;
    }

    let tableHeader = "";
    let tableRows = "";

    if (mode === "unique_profiles") {
      const profiles = getUniqueCustomerProfiles(filtered);
      tableHeader = `
        <tr style="background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left;">
          <th style="padding: 10px; border: 1px solid #475569;">Customer Name</th>
          <th style="padding: 10px; border: 1px solid #475569;">Email Address</th>
          <th style="padding: 10px; border: 1px solid #475569;">Phone Number</th>
          <th style="padding: 10px; border: 1px solid #475569;">Customer Segment</th>
          <th style="padding: 10px; border: 1px solid #475569;">Total Orders</th>
          <th style="padding: 10px; border: 1px solid #475569;">Total Revenue Spent (EGP)</th>
          <th style="padding: 10px; border: 1px solid #475569;">Paid Products Purchased</th>
          <th style="padding: 10px; border: 1px solid #475569;">Free Tools Claimed</th>
          <th style="padding: 10px; border: 1px solid #475569;">First Active Date</th>
          <th style="padding: 10px; border: 1px solid #475569;">Last Active Date</th>
        </tr>
      `;

      tableRows = profiles
        .map((p, idx) => {
          const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
          return `
          <tr style="background-color: ${bg};">
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${p.customerName || ""}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${p.customerEmail || ""}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; mso-number-format:'\\@';">${p.customerPhone || "-"}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${p.segment}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${p.totalOrders}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #059669;">${p.totalSpentEgp} EGP</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${Array.from(p.purchasedProducts).join(", ") || "-"}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${Array.from(p.freeProducts).join(", ") || "-"}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${new Date(p.firstDate).toLocaleDateString("en-US")}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${new Date(p.lastDate).toLocaleDateString("en-US")}</td>
          </tr>
        `;
        })
        .join("");
    } else {
      tableHeader = `
        <tr style="background-color: #1e293b; color: #ffffff; font-weight: bold; text-align: left;">
          <th style="padding: 10px; border: 1px solid #475569;">Order ID</th>
          <th style="padding: 10px; border: 1px solid #475569;">Customer Name</th>
          <th style="padding: 10px; border: 1px solid #475569;">Email Address</th>
          <th style="padding: 10px; border: 1px solid #475569;">Phone Number</th>
          <th style="padding: 10px; border: 1px solid #475569;">Access Type</th>
          <th style="padding: 10px; border: 1px solid #475569;">Product Title</th>
          <th style="padding: 10px; border: 1px solid #475569;">Price (EGP)</th>
          <th style="padding: 10px; border: 1px solid #475569;">Date & Time</th>
          <th style="padding: 10px; border: 1px solid #475569;">Status</th>
        </tr>
      `;

      tableRows = filtered
        .map((o, idx) => {
          const isFree = o.pricingType === "free" || (o.productPrice || 0) === 0;
          const bg = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
          return `
          <tr style="background-color: ${bg};">
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-weight: bold;">${o.id}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${o.customerName || ""}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${o.customerEmail || ""}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; mso-number-format:'\\@';">${o.customerPhone || "-"}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${isFree ? "Free Access" : "Paid Order"}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${o.productTitle || ""}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #059669;">${o.productPrice || 0} EGP</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${new Date(o.createdAt || "").toLocaleString("en-US")}</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${o.status}</td>
          </tr>
        `;
        })
        .join("");
    }

    const excelTemplate = `
      <html xmlns:o="urn:schemas-microsoft-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Customer Data</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
      </head>
      <body>
        <table border="1" style="border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px;">
          <thead>
            ${tableHeader}
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([excelTemplate], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `abdallah_store_customers_${mode}_${filterType}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filtered.length} customer records to formatted Excel Workbook!`, "success");
    addAuditLog("Exported Customer Leads Excel", `Exported ${filtered.length} customer records (${mode}) to Excel (.xls)`, "order");
  };

  const exportCustomersToCSV = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    mode: "unique_profiles" | "all_transactions" = customerExportMode,
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);

    if (filtered.length === 0) {
      showToast("No customer records match the selected export filter.", "error");
      return;
    }

    let csvContent = "";

    if (mode === "unique_profiles") {
      const profiles = getUniqueCustomerProfiles(filtered);
      const headers = [
        "Customer Name",
        "Email",
        "Phone",
        "Customer Segment",
        "Total Orders",
        "Total Revenue Spent (EGP)",
        "Paid Products Purchased",
        "Free Tools Claimed",
        "First Active Date",
        "Last Active Date"
      ];
      const rows = profiles.map((p) => [
        `"${(p.customerName || "").replace(/"/g, '""')}"`,
        `"${(p.customerEmail || "").replace(/"/g, '""')}"`,
        `"${(p.customerPhone || "-").replace(/"/g, '""')}"`,
        `"${p.segment}"`,
        `"${p.totalOrders}"`,
        `"${p.totalSpentEgp}"`,
        `"${Array.from(p.purchasedProducts).join("; ").replace(/"/g, '""')}"`,
        `"${Array.from(p.freeProducts).join("; ").replace(/"/g, '""')}"`,
        `"${new Date(p.firstDate).toLocaleDateString("en-US")}"`,
        `"${new Date(p.lastDate).toLocaleDateString("en-US")}"`
      ]);
      csvContent = "\uFEFFsep=,\n" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    } else {
      const headers = ["Order ID", "Customer Name", "Email", "Phone", "Access Type", "Product Title", "Price (EGP)", "Date", "Status"];
      const rows = filtered.map((o) => [
        `"${o.id}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${(o.customerEmail || "").replace(/"/g, '""')}"`,
        `"${(o.customerPhone || "-").replace(/"/g, '""')}"`,
        `"${o.pricingType === "free" || (o.productPrice || 0) === 0 ? "Free Access" : "Paid Order"}"`,
        `"${(o.productTitle || "").replace(/"/g, '""')}"`,
        `"${o.productPrice || 0}"`,
        `"${new Date(o.createdAt || "").toLocaleString("en-US")}"`,
        `"${o.status}"`
      ]);
      csvContent = "\uFEFFsep=,\n" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `abdallah_store_customers_${mode}_${filterType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filtered.length} customer records to CSV!`, "success");
    addAuditLog("Exported Customer Leads CSV", `Exported ${filtered.length} customer records (${mode}) to CSV`, "order");
  };

  const exportCustomersToJSON = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);
    if (filtered.length === 0) {
      showToast("No customer records found for JSON export.", "error");
      return;
    }

    const profiles = getUniqueCustomerProfiles(filtered);
    const dataStr = JSON.stringify({ exportedAt: new Date().toISOString(), totalProfiles: profiles.length, profiles }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `abdallah_store_customers_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${profiles.length} customer profiles to JSON!`, "success");
    addAuditLog("Exported Customers JSON", `Exported ${profiles.length} customer profiles to JSON`, "order");
  };

  const exportCustomersToVCF = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);
    const profiles = getUniqueCustomerProfiles(filtered).filter((p) => p.customerPhone && p.customerPhone !== "-");

    if (profiles.length === 0) {
      showToast("No customer phone numbers available for vCard export.", "error");
      return;
    }

    let vcfContent = "";
    profiles.forEach((p) => {
      let cleanPhone = p.customerPhone.replace(/[^0-9+]/g, "").trim();
      if (cleanPhone.startsWith("01")) cleanPhone = `+20${cleanPhone.substring(1)}`;
      else if (!cleanPhone.startsWith("+")) cleanPhone = `+${cleanPhone}`;

      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${p.customerName} (Abdallah Store)\nN:;${p.customerName};;;\nTEL;TYPE=CELL:${cleanPhone}\nEMAIL:${p.customerEmail}\nNOTE:Segment: ${p.segment} | Total Spent: ${p.totalSpentEgp} EGP\nEND:VCARD\n`;
    });

    const blob = new Blob([vcfContent], { type: "text/vcard;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `abdallah_store_contacts_${new Date().toISOString().slice(0, 10)}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${profiles.length} phone contacts to vCard (.vcf) file!`, "success");
    addAuditLog("Exported Contacts vCard", `Exported ${profiles.length} customer phone contacts to .vcf`, "order");
  };

  const exportCustomersToTXT = (
    type: "emails" | "phones",
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);
    let list: string[] = [];

    if (type === "emails") {
      list = Array.from(new Set(filtered.map((o) => o.customerEmail?.trim()).filter(Boolean)));
    } else {
      list = Array.from(
        new Set(
          filtered
            .map((o) => o.customerPhone?.replace(/[^0-9+]/g, "").trim())
            .filter((p) => p && p !== "-")
        )
      );
    }

    if (list.length === 0) {
      showToast(`No ${type} found for text export.`, "error");
      return;
    }

    const txtContent = list.join("\n");
    const blob = new Blob([txtContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `abdallah_store_${type}_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${list.length} ${type} to TXT list!`, "success");
  };

  const copyCustomerEmails = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);

    const emails = Array.from(new Set(filtered.map((o) => o.customerEmail?.trim()).filter(Boolean)));
    if (emails.length === 0) {
      showToast("No customer emails found for this filter.", "error");
      return;
    }

    const emailsText = emails.join(", ");
    navigator.clipboard.writeText(emailsText);
    showToast(`Copied ${emails.length} unique customer emails to clipboard!`, "success");
    addAuditLog("Copied Marketing Emails", `Copied ${emails.length} customer emails for email marketing`, "order");
  };

  const copyCustomerPhones = (
    filterType: "all" | "paid" | "free" = "all",
    targetProductId = "all",
    dateRange: "all" | "30days" | "7days" | "today" = customerDateRange
  ) => {
    const filtered = getFilteredOrders(filterType, targetProductId, dateRange);

    const phones = Array.from(
      new Set(
        filtered
          .map((o) => o.customerPhone?.replace(/[^0-9+]/g, "").trim())
          .filter((p) => p && p !== "-")
      )
    );

    if (phones.length === 0) {
      showToast("No valid phone numbers found for this filter.", "error");
      return;
    }

    const phonesText = phones.join("\n");
    navigator.clipboard.writeText(phonesText);
    showToast(`Copied ${phones.length} unique phone numbers to clipboard!`, "success");
    addAuditLog("Copied WhatsApp Leads", `Copied ${phones.length} phone numbers for WhatsApp marketing`, "order");
  };

  const slugifyTitle = (text: string) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[\s\-_]+/g, "-")
      .replace(/[^\p{L}\p{N}\-_]+/gu, "")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setProdTitle(val);
    const slug = slugifyTitle(val);
    setProdSlug(slug);
  };

  const handleFileUpload = async (file: File, type: "covers" | "downloads" | "gallery", callback?: (url: string) => void) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    if (type === "covers") setUploadingCover(true);
    if (type === "downloads") setUploadingFile(true);
    if (type === "gallery") setUploadingGallery(true);

    try {
      const res = await fetch("/api/store/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (type === "covers") {
          setProdCoverImage(data.url);
          showToast("Cover image uploaded successfully!", "success");
        }
        if (type === "downloads") {
          setProdFileUrl(data.url);
          showToast("Tool asset file uploaded successfully!", "success");
        }
        if (type === "gallery") {
          showToast(`Media file "${data.fileName}" uploaded for gallery!`, "success");
        }
        if (callback) callback(data.url);
      } else {
        showToast(data.error || "File upload failed.", "error");
      }
    } catch (err) {
      showToast("Failed to upload file to server.", "error");
    } finally {
      setUploadingCover(false);
      setUploadingFile(false);
      setUploadingGallery(false);
    }
  };

  // Settings State
  const [instapayLink, setInstapayLink] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsError, setSettingsError] = useState("");

  // Check stored 24h admin session on component mount
  useEffect(() => {
    const storedPass = localStorage.getItem("admin_auth_pass");
    const storedExpires = localStorage.getItem("admin_auth_expires");

    if (storedPass && storedExpires) {
      const expiresAt = Number(storedExpires);
      const now = Date.now();

      if (now < expiresAt) {
        // Valid 24h session
        setPassword(storedPass);
        setSessionExpiresAt(expiresAt);
        const hoursLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
        setRemainingHours(hoursLeft);
        verifyAndLogin(storedPass, true);
        return;
      } else {
        // Session expired (24 hours passed)
        localStorage.removeItem("admin_auth_pass");
        localStorage.removeItem("admin_auth_expires");
      }
    }
    setIsVerifyingSession(false);
  }, []);

  const save24hSession = (pass: string) => {
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 Hours in ms
    localStorage.setItem("admin_auth_pass", pass);
    localStorage.setItem("admin_auth_expires", expiresAt.toString());
    setSessionExpiresAt(expiresAt);
    setRemainingHours(24);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth_pass");
    localStorage.removeItem("admin_auth_expires");
    setIsAuthenticated(false);
    setPassword("");
    setSessionExpiresAt(null);
    setRemainingHours(null);
    showToast("Logged out from Admin Panel", "info");
  };

  const verifyAndLogin = async (passToVerify: string, isAutoLogin = false) => {
    setAuthError("");

    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: passToVerify }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setPassword(passToVerify);
        setOrders(data.orders || []);
        loadProducts();
        loadCoupons();
        loadSettings();
        loadLicensePlatformData();
        if (!isAutoLogin) {
          save24hSession(passToVerify);
          showToast("Logged into Admin Panel (24-Hour Session Active)", "success");
        }
      } else {
        if (isAutoLogin) {
          localStorage.removeItem("admin_auth_pass");
          localStorage.removeItem("admin_auth_expires");
        } else {
          setAuthError("Invalid Admin PIN password.");
        }
      }
    } catch (err) {
      if (!isAutoLogin) {
        setAuthError("Could not connect to server.");
      }
    } finally {
      setIsVerifyingSession(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    verifyAndLogin(password, false);
  };

  const loadOrders = async () => {
    try {
      const res = await fetch("/api/store/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPassword: password }),
      });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) { }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/store/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (err) { }
  };

  const loadCoupons = async () => {
    try {
      const res = await fetch("/api/store/coupons");
      const data = await res.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch (err) { }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/store/settings");
      const data = await res.json();
      if (data.instapayLink) setInstapayLink(data.instapayLink);
      if (data.walletNumber) setWalletNumber(data.walletNumber);
      if (data.spotlightProductId) setActiveSpotlightId(data.spotlightProductId);
      if (data.heroBannerText) setHeroBannerText(data.heroBannerText);
      if (data.heroBannerEnabled !== undefined) setHeroBannerEnabled(data.heroBannerEnabled);
      if (data.usdExchangeRate) setUsdExchangeRate(Number(data.usdExchangeRate));
      if (data.metaPixelId !== undefined) setMetaPixelId(data.metaPixelId);
    } catch (err) { }
  };

  const loadLicensePlatformData = async () => {
    try {
      const res = await fetch("/api/store/licenses");
      const data = await res.json();
      if (data.success) {
        setLicenses(data.licenses || []);
        setPlans(data.plans || []);
        setLicensePayments(data.payments || []);
        setDevices(data.devices || []);
        setLicenseDevices(data.licenseDevices || []);
      }
    } catch (err) { }
  };

  // Real-time Live Auto Sync (تحديث لحظي لكل البيانات بدون ريفرش)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      loadOrders();
      loadLicensePlatformData();
      loadProducts();
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, password]);

  const handleSetSpotlight = async (productId: string, productTitle: string) => {
    try {
      const res = await fetch("/api/store/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          spotlightProductId: productId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSpotlightId(productId);
        showToast(`"Spotlight Tool of the Month" updated to: ${productTitle}`, "success");
        addAuditLog("Set Spotlight Product", `Selected "${productTitle}" as the Spotlight Tool of the Month`, "product");
      } else {
        showToast(data.error || "Failed to update spotlight product.", "error");
      }
    } catch (err) {
      showToast("Could not connect to server.", "error");
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    setApprovingOrderId(orderId);
    setApprovalSuccess(null);

    try {
      const res = await fetch("/api/store/approve-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, adminPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        const msg = data.message || "Order approved & download link sent!";
        setApprovalSuccess(msg);
        showToast(msg, "success");
        addAuditLog("Order Approved", `Approved order #${orderId} and dispatched 1-hr secure download token`, "order");
        loadOrders();
      } else {
        showToast(data.error || "An error occurred during approval.", "error");
      }
    } catch (err) {
      showToast("Could not connect to server.", "error");
    } finally {
      setApprovingOrderId(null);
    }
  };

  const handleApproveAllPendingOrders = async () => {
    const pending = orders.filter((o) => o.status === "pending");
    if (pending.length === 0) {
      showToast("No pending orders to approve.", "info");
      return;
    }

    askConfirmation({
      title: "Approve All Pending Orders",
      message: `Are you sure you want to approve ALL ${pending.length} pending orders simultaneously? Download links will be generated.`,
      confirmText: `Approve All (${pending.length})`,
      variant: "info",
      onConfirm: async () => {
        setApprovingAllOrders(true);
        try {
          let approvedCount = 0;
          for (const ord of pending) {
            const res = await fetch("/api/store/approve-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: ord.id, adminPassword: password }),
            });
            if (res.ok) approvedCount++;
          }
          await loadOrders();
          showToast(`Successfully approved ${approvedCount} pending orders!`, "success");
          addAuditLog("Bulk Order Approval", `Approved ${approvedCount} pending orders simultaneously`, "order");
        } catch (err) {
          showToast("Error processing bulk approval.", "error");
        } finally {
          setApprovingAllOrders(false);
        }
      },
    });
  };

  const handleQuickPriceSave = async (productId: string, currentProd: Product) => {
    try {
      const updatedData = {
        ...currentProd,
        priceEgp: inlinePriceValue,
      };
      const res = await fetch("/api/store/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          product: updatedData,
        }),
      });
      if (res.ok) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, priceEgp: inlinePriceValue } : p)));
        setEditingInlinePriceId(null);
        showToast(`Updated price for "${currentProd.title}" to ${inlinePriceValue} EGP!`, "success");
        addAuditLog("Quick Price Edit", `Updated "${currentProd.title}" price to ${inlinePriceValue} EGP`, "product");
      } else {
        showToast("Failed to update product price.", "error");
      }
    } catch (e) {
      showToast("Server connection error.", "error");
    }
  };

  const sendCustomWhatsAppMessage = () => {
    if (!whatsappModalCustomer) return;
    let cleanPhone = whatsappModalCustomer.phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      showToast("Invalid phone number.", "error");
      return;
    }
    if (cleanPhone.startsWith("01")) cleanPhone = `20${cleanPhone.substring(1)}`;

    const storeUrl = typeof window !== "undefined" ? `${window.location.origin}/store` : "https://bid032.com/store";

    let msgText = "";
    if (whatsappTemplate === "offer") {
      msgText = `Hello ${whatsappModalCustomer.name},\n\nWe are offering a 20% discount on software tools and scripts at Abdallah Store.\n\nCoupon Code: WELCOME20\nStore Catalog:\n${storeUrl}`;
    } else if (whatsappTemplate === "update") {
      msgText = `Hello ${whatsappModalCustomer.name},\n\nNew updates and performance enhancements have been released for software tools on Abdallah Store.\n\nView Updates:\n${storeUrl}`;
    } else if (whatsappTemplate === "support") {
      msgText = `Hello ${whatsappModalCustomer.name},\n\nThis is Abdallah Store Support following up on your digital tools and licenses. Please reply if you require technical support or activation help.`;
    } else {
      msgText = whatsappCustomText || `Hello ${whatsappModalCustomer.name},`;
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msgText)}`, "_blank");
    setWhatsappModalCustomer(null);
    showToast(`WhatsApp message dispatched to ${whatsappModalCustomer.name}!`, "success");
    addAuditLog("WhatsApp CRM Outreach", `Sent custom WhatsApp message to ${whatsappModalCustomer.name} (${cleanPhone})`, "order");
  };

  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  const handleDeleteOrder = (orderId: string, customerName: string) => {
    askConfirmation({
      title: "Delete Customer Order",
      message: `Are you sure you want to delete order for "${customerName}" (#${orderId})? This action cannot be undone.`,
      confirmText: "Delete Order",
      variant: "danger",
      onConfirm: async () => {
        setDeletingOrderId(orderId);
        try {
          const res = await fetch("/api/store/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adminPassword: password,
              action: "delete",
              orderId,
            }),
          });

          if (res.ok) {
            showToast("Order deleted successfully!", "success");
            addAuditLog("Order Deleted", `Deleted order #${orderId} for customer ${customerName}`, "order");
            loadOrders();
          } else {
            const data = await res.json();
            showToast(data.error || "Failed to delete order.", "error");
          }
        } catch (err) {
          showToast("Failed to connect to server.", "error");
        } finally {
          setDeletingOrderId(null);
        }
      },
    });
  };

  const handleDeleteAllOrders = () => {
    if (orders.length === 0) return;
    askConfirmation({
      title: "Delete All Orders Queue",
      message: `Are you sure you want to permanently delete ALL ${orders.length} orders from the system? This action cannot be undone.`,
      confirmText: "Yes, Delete All Orders",
      variant: "danger",
      onConfirm: async () => {
        setDeletingAllOrders(true);
        try {
          const res = await fetch("/api/store/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adminPassword: password,
              action: "deleteAll",
            }),
          });

          if (res.ok) {
            showToast("All orders deleted successfully!", "success");
            addAuditLog("Cleared Orders Queue", "Deleted all orders from the store database", "order");
            loadOrders();
          } else {
            const data = await res.json();
            showToast(data.error || "Failed to delete all orders.", "error");
          }
        } catch (err) {
          showToast("Failed to connect to server.", "error");
        } finally {
          setDeletingAllOrders(false);
        }
      },
    });
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setSavingCoupon(true);
    try {
      const res = await fetch("/api/store/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          action: editingCoupon ? "update" : "add",
          couponId: editingCoupon?.id,
          couponData: {
            code: couponCodeInput,
            discountType: couponTypeInput,
            discountValue: Number(couponValueInput),
            minOrderAmount: Number(couponMinOrderInput),
            maxUses: Number(couponMaxUsesInput),
            applicableProductId: couponTargetProductInput,
            isActive: editingCoupon ? editingCoupon.isActive : true,
          },
        }),
      });

      if (res.ok) {
        showToast(editingCoupon ? "Coupon updated successfully in Supabase!" : "Coupon created successfully in Supabase!", "success");
        setShowAddCouponModal(false);
        setEditingCoupon(null);
        setCouponCodeInput("");
        loadCoupons();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to save coupon.", "error");
      }
    } catch (err) {
      showToast("Failed to save coupon code.", "error");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string) => {
    try {
      const res = await fetch("/api/store/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          action: "toggle",
          couponId: id,
        }),
      });

      if (res.ok) {
        showToast("Coupon active status toggled!", "info");
        loadCoupons();
      }
    } catch (err) { }
  };

  const handleDeleteCoupon = (id: string, code: string) => {
    askConfirmation({
      title: "Delete Discount Coupon",
      message: `Are you sure you want to delete coupon code "${code}"?`,
      confirmText: "Delete Coupon",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/store/coupons", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adminPassword: password,
              action: "delete",
              couponId: id,
            }),
          });

          if (res.ok) {
            showToast("Coupon deleted successfully!", "success");
            addAuditLog("Coupon Deleted", `Deleted coupon code ${code}`, "coupon");
            loadCoupons();
          }
        } catch (err) { }
      },
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess("");
    setSettingsError("");
    setSavingSettings(true);

    try {
      const res = await fetch("/api/store/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          instapayLink,
          walletNumber,
          newAdminPassword: newAdminPassword || undefined,
          heroBannerText,
          heroBannerEnabled,
          spotlightProductId: activeSpotlightId,
          usdExchangeRate,
          metaPixelId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSettingsSuccess("Store settings updated successfully!");
        showToast("Store settings saved & synced to Supabase!", "success");
        if (newAdminPassword) setPassword(newAdminPassword);
        setNewAdminPassword("");
      } else {
        setSettingsError(data.error || "An error occurred while updating settings.");
        showToast(data.error || "Failed to update settings.", "error");
      }
    } catch (err) {
      setSettingsError("Could not connect to server.");
      showToast("Could not connect to server.", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddGalleryItem = (url?: string) => {
    const finalUrl = url || newGalleryUrl.trim();
    if (!finalUrl) {
      showToast("Please enter or upload a valid media URL for the gallery.", "error");
      return;
    }
    const newItem: ProductMedia = {
      type: newGalleryType,
      url: finalUrl,
      caption: newGalleryCaption.trim() || undefined,
    };
    setProdGallery((prev) => [...prev, newItem]);
    setNewGalleryUrl("");
    setNewGalleryCaption("");
    showToast("Media item added to product gallery!", "success");
  };

  const handleRemoveGalleryItem = (index: number) => {
    setProdGallery((prev) => prev.filter((_, i) => i !== index));
    showToast("Gallery media item removed.", "info");
  };

  const handleToggleProductVisibility = async (product: Product) => {
    const newIsHidden = !product.isHidden;
    const updatedPayload = { ...product, isHidden: newIsHidden };
    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          action: "update",
          productId: product.id,
          productData: updatedPayload,
        }),
      });

      if (res.ok) {
        showToast(
          newIsHidden ? `"${product.title}" is now hidden from the store!` : `"${product.title}" is now visible in the store!`,
          "info"
        );
        addAuditLog(
          newIsHidden ? "Hide Product" : "Publish Product",
          `${newIsHidden ? "Hidden" : "Published"} "${product.title}"`,
          "product"
        );
        loadProducts();
      } else {
        showToast("Failed to update visibility.", "error");
      }
    } catch (err) {
      showToast("Error updating visibility.", "error");
    }
  };

  const handleUpdateProductSortOrder = async (product: Product, delta: number) => {
    const newOrder = Math.max(0, (product.sortOrder || 0) + delta);
    const updatedPayload = { ...product, sortOrder: newOrder };
    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          action: "update",
          productId: product.id,
          productData: updatedPayload,
        }),
      });

      if (res.ok) {
        showToast(`Updated display order for "${product.title}" to #${newOrder}`, "success");
        loadProducts();
      }
    } catch (err) { }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);

    const isFree = prodPricing === "free";
    const parsedOriginalPrice = !isFree && prodOriginalPriceEgp !== "" && prodOriginalPriceEgp !== undefined && prodOriginalPriceEgp !== null
      ? Number(prodOriginalPriceEgp)
      : undefined;

    const generatedSlug = slugifyTitle(prodTitle) || prodSlug || "digital-tool";

    const productPayload = {
      title: prodTitle,
      slug: generatedSlug,
      subtitle: prodSub,
      description: prodDesc,
      category: prodCat,
      pricingType: prodPricing,
      priceEgp: isFree ? 0 : Number(prodPriceEgp),
      originalPriceEgp: parsedOriginalPrice,
      priceUsd: isFree ? 0 : Number(prodPriceUsd),
      badge: prodBadge,
      software: prodSoftware,
      compatibility: prodComp,
      version: prodVer,
      fileUrl: prodFileUrl,
      coverImage: prodCoverImage || "/Photos/Tools/illustrator.png",
      gallery: prodGallery,
      features: prodFeatures.split(",").map((f) => f.trim()).filter(Boolean),
      isExternalAuthor: prodIsExternalAuthor,
      authorName: prodIsExternalAuthor ? prodAuthorName : undefined,
      authorLink: prodIsExternalAuthor ? prodAuthorLink : undefined,
      sortOrder: Number(prodSortOrder || 0),
      isHidden: Boolean(prodIsHidden),
    };

    try {
      const res = await fetch("/api/store/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword: password,
          action: editingProduct ? "update" : "add",
          productId: editingProduct?.id,
          productData: productPayload,
        }),
      });

      if (res.ok) {
        showToast(
          editingProduct ? "Product updated and synced with Supabase successfully!" : "New product created and saved to Supabase!",
          "success"
        );
        addAuditLog(
          editingProduct ? "Product Updated" : "Product Created",
          `${editingProduct ? "Updated specifications" : "Created new tool"} for "${prodTitle}" (Category: ${prodCat})`,
          "product"
        );
        setShowAddProductModal(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to save product.", "error");
      }
    } catch (err) {
      showToast("Failed to save product.", "error");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = (id: string, title: string) => {
    askConfirmation({
      title: "Delete Digital Product",
      message: `Are you sure you want to delete product "${title}"? This will remove it from the store catalog.`,
      confirmText: "Delete Product",
      variant: "danger",
      onConfirm: async () => {
        setDeletingProductId(id);
        try {
          const res = await fetch("/api/store/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adminPassword: password,
              action: "delete",
              productId: id,
            }),
          });

          if (res.ok) {
            showToast("Product deleted successfully!", "success");
            addAuditLog("Product Deleted", `Deleted product ${title}`, "product");
            loadProducts();
          } else {
            showToast("Failed to delete product.", "error");
          }
        } catch (err) {
          showToast("Failed to delete product.", "error");
        } finally {
          setDeletingProductId(null);
        }
      },
    });
  };

  if (isVerifyingSession) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-md mx-auto w-full min-h-[70vh] flex items-center justify-center">
        <div className="bg-surface/90 border border-border/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-4">
          <FaSpinner className="animate-spin text-primary text-3xl mx-auto" />
          <p className="text-secondary font-bold text-sm">Verifying 24-hour admin session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-20 px-4 max-w-md mx-auto w-full min-h-[75vh] flex items-center justify-center text-left">
        <div className="bg-gradient-to-b from-surface/95 via-surface/90 to-background/95 border border-border/80 rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(245,127,0,0.15)] backdrop-blur-2xl relative overflow-hidden w-full space-y-6">
          {/* Ambient Security Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-primary/10 border border-primary/40 rounded-2xl flex items-center justify-center text-primary text-2xl mx-auto shadow-inner relative group">
              <FaLock className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-surface rounded-full" />
            </div>

            <div>
              <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                Secure Admin Access
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-secondary tracking-tight mt-2">Store Command Center</h1>
              <p className="text-text-muted text-xs mt-1 leading-relaxed">
                Enter Admin PIN password. Your session will remain authenticated for <strong>24 hours</strong>.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 flex items-center justify-between">
                <span>Admin Master PIN</span>
                <span className="text-[10px] text-text-muted font-mono">Protected</span>
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/90 border border-border/80 rounded-2xl px-4 py-3.5 text-base text-secondary focus:border-primary outline-none text-center font-mono tracking-widest transition-all shadow-inner"
              />
            </div>

            {authError && (
              <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 p-3 rounded-xl border border-red-500/30">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary text-black font-black text-sm hover:bg-primary-dark shadow-[0_0_25px_rgba(245,127,0,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Unlock Dashboard (24h Session)
            </button>
          </form>

          <div className="pt-4 border-t border-border/40 text-center text-[10px] text-text-muted font-mono">
            <span>🛡️ End-to-End Encrypted Session</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto w-full min-h-screen text-left relative">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-24 right-4 z-[150] p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-bold max-w-md ${toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
              : toast.type === "error"
                ? "bg-red-950/90 border-red-500/40 text-red-300"
                : "bg-zinc-900/95 border-amber-500/40 text-amber-300"
              }`}
          >
            {toast.type === "success" && <FaCheckCircle className="text-base text-emerald-400 shrink-0" />}
            {toast.type === "error" && <FaExclamationTriangle className="text-base text-red-400 shrink-0" />}
            {toast.type === "info" && <FaClock className="text-base text-amber-400 shrink-0" />}
            <span className="leading-relaxed">{toast.text}</span>
            <button onClick={() => setToast(null)} className="ml-auto text-text-muted hover:text-white shrink-0">
              <FaTimes />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Dashboard Shell Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ========================================================= */}
        {/* LEFT SIDEBAR NAVIGATION PANEL                             */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 self-start z-30 lg:h-[calc(100vh-3rem)]">
          {/* Brand & Studio Card */}
          <div className="bg-surface/90 border border-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group lg:h-full flex flex-col justify-between">
            {/* Minimal Modern SaaS Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase text-text-muted tracking-wider">
                  Admin Workspace
                </span>
              </div>

              {/* Lock button on small screens */}
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all"
                title="Lock Admin Panel"
              >
                <FaLock />
              </button>
            </div>

            {/* Quick Mobile Tab Strip (Visible on mobile/tablet screens < lg) */}
            <div className="lg:hidden mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "analytics"
                    ? "bg-amber-500 text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaChartLine className="text-xs" />
                  <span>Sales</span>
                </button>

                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "orders"
                    ? "bg-primary text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaShoppingBag className="text-xs" />
                  <span>Orders</span>
                  {orders.filter((o) => o.status === "pending").length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-black text-amber-400 font-mono">
                      {orders.filter((o) => o.status === "pending").length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("customers")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "customers"
                    ? "bg-emerald-500 text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaUsers className="text-xs" />
                  <span>CRM Leads</span>
                </button>

                <button
                  onClick={() => setActiveTab("products")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "products"
                    ? "bg-primary text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaLayerGroup className="text-xs" />
                  <span>Products</span>
                </button>

                <button
                  onClick={() => setActiveTab("licenses")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "licenses"
                    ? "bg-amber-400 text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaKey className="text-xs" />
                  <span>Licenses</span>
                </button>

                <button
                  onClick={() => setActiveTab("plans")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "plans"
                    ? "bg-blue-500 text-white font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaShieldAlt className="text-xs" />
                  <span>Plans</span>
                </button>

                <button
                  onClick={() => setActiveTab("payments")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "payments"
                    ? "bg-emerald-500 text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaCreditCard className="text-xs" />
                  <span>Payments</span>
                </button>

                <button
                  onClick={() => setActiveTab("coupons")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "coupons"
                    ? "bg-purple-500 text-white font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaTag className="text-xs" />
                  <span>Coupons</span>
                </button>

                <button
                  onClick={() => setActiveTab("audit")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "audit"
                    ? "bg-cyan-500 text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaHistory className="text-xs" />
                  <span>Audit</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${activeTab === "settings"
                    ? "bg-primary text-black font-black shadow-md"
                    : "bg-background/80 text-text-secondary border border-border/60"
                    }`}
                >
                  <FaCog className="text-xs" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation Menu List (Desktop > lg) */}
            <nav className="mt-6 space-y-1.5 hidden lg:block">
              {/* 1. Sales & Analytics */}
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "analytics"
                  ? "bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaChartLine className={`text-base ${activeTab === "analytics" ? "text-black" : "text-amber-400"}`} />
                  <span>Sales & Analytics</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "analytics" ? "bg-black/30 text-amber-200" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}>
                  Live
                </span>
              </button>

              {/* 2. Orders & Approvals (Merged Orders Queue + Payment Approval) */}
              <button
                onClick={() => {
                  setActiveTab("orders");
                }}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "orders" || activeTab === "payments"
                  ? "bg-primary text-black font-black shadow-lg shadow-primary/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaShoppingBag className={`text-base ${activeTab === "orders" || activeTab === "payments" ? "text-black" : "text-amber-400"}`} />
                  <span>Orders & Approvals</span>
                </div>
                {orders.filter((o) => o.status === "pending").length > 0 ? (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${activeTab === "orders" || activeTab === "payments" ? "bg-black text-amber-400" : "bg-amber-500 text-black animate-pulse"
                    }`}>
                    {orders.filter((o) => o.status === "pending").length} Pending
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "orders" || activeTab === "payments" ? "bg-black/30 text-black" : "bg-surface text-text-muted"
                    }`}>
                    {orders.length}
                  </span>
                )}
              </button>

              {/* 3. Customer Leads CRM */}
              <button
                onClick={() => setActiveTab("customers")}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "customers"
                  ? "bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaUsers className={`text-base ${activeTab === "customers" ? "text-black" : "text-emerald-400"}`} />
                  <span>Customer Leads</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "customers" ? "bg-black/30 text-emerald-200" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                  CRM
                </span>
              </button>

              {/* 4. Products & Plans (Merged Catalog + Subscription Plans) */}
              <button
                onClick={() => {
                  setActiveTab("products");
                }}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "products" || activeTab === "plans"
                  ? "bg-blue-500 text-white font-black shadow-lg shadow-blue-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaLayerGroup className={`text-base ${activeTab === "products" || activeTab === "plans" ? "text-white" : "text-blue-400"}`} />
                  <span>Products & Plans</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "products" || activeTab === "plans" ? "bg-black/30 text-blue-200" : "bg-blue-500/10 text-blue-400"
                  }`}>
                  {products.length}
                </span>
              </button>

              {/* 5. Licenses & Keys */}
              <button
                onClick={() => setActiveTab("licenses")}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "licenses"
                  ? "bg-amber-400 text-black font-black shadow-lg shadow-amber-400/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaKey className={`text-base ${activeTab === "licenses" ? "text-black" : "text-amber-400"}`} />
                  <span>Licenses & Keys</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "licenses" ? "bg-black/30 text-amber-200" : "bg-amber-400/10 text-amber-400 border border-amber-400/30"
                  }`}>
                  {licenses.length}
                </span>
              </button>

              {/* 6. Coupons & Offers */}
              <button
                onClick={() => setActiveTab("coupons")}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "coupons"
                  ? "bg-purple-500 text-white font-black shadow-lg shadow-purple-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaTag className={`text-base ${activeTab === "coupons" ? "text-white" : "text-purple-400"}`} />
                  <span>Coupons & Offers</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "coupons" ? "bg-black/30 text-purple-200" : "bg-purple-500/10 text-purple-400"
                  }`}>
                  {coupons.length}
                </span>
              </button>

              {/* 7. Store Settings & Audit */}
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between group ${activeTab === "settings" || activeTab === "audit"
                  ? "bg-cyan-500 text-black font-black shadow-lg shadow-cyan-500/20 scale-[1.02]"
                  : "text-text-secondary hover:text-secondary hover:bg-surface-hover/80"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FaCog className={`text-base ${activeTab === "settings" || activeTab === "audit" ? "text-black" : "text-cyan-400"}`} />
                  <span>Store Settings</span>
                </div>
              </button></nav>

            {/* Bottom Sidebar Status & Lock (Desktop) */}
            <div className="mt-auto pt-6 border-t border-border/60 space-y-3 hidden lg:block">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaClock className="text-xs shrink-0" />
                  <span className="text-[11px]">24h Session Active</span>
                </div>
                {remainingHours && <span className="text-[10px] font-mono opacity-80">~{remainingHours}h</span>}
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <FaLock className="text-xs" />
                <span>Lock Panel</span>
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* RIGHT MAIN WORKSPACE CONTENT                              */}
        {/* ========================================================= */}
        <main className="flex-1 min-w-0 w-full space-y-6">

          {/* Dynamic Action Header Bar */}
          <div className="bg-surface/90 border border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/30">
                  {activeTab === "analytics" && "Revenue Analytics"}
                  {(activeTab === "orders" || activeTab === "payments") && "Orders Queue & Approvals"}
                  {activeTab === "customers" && "Customer CRM"}
                  {(activeTab === "products" || activeTab === "plans") && "Products & Subscription Plans"}
                  {activeTab === "licenses" && "License Engine & Keys"}
                  {activeTab === "coupons" && "Promotions & Offers"}
                  {(activeTab === "settings" || activeTab === "audit") && "Store Config & Audit Stream"}
                </span>
                <span className="text-xs text-text-muted font-mono">• Studio Store</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-secondary tracking-tight">
                {activeTab === "analytics" && "Sales & Revenue Analytics"}
                {(activeTab === "orders" || activeTab === "payments") && "Customer Orders & Payment Approvals"}
                {activeTab === "customers" && "Customer Leads Directory"}
                {(activeTab === "products" || activeTab === "plans") && "Products Catalog & Subscription Plans"}
                {activeTab === "licenses" && "License Engine & Keys Management"}
                {activeTab === "coupons" && "Discount Coupons & Promotions"}
                {(activeTab === "settings" || activeTab === "audit") && "Store Settings & System Audit Logs"}
              </h1>
            </div>

            {/* Quick Actions (Tab-Specific) */}
            <div className="flex items-center gap-3 shrink-0">
              {activeTab === "licenses" && (
                <button
                  onClick={() => {
                    setManualUserEmail("");
                    const paidProds = products.filter((p) => p.pricingType === "paid" || p.priceEgp > 0);
                    if (paidProds.length > 0) setManualProductId(paidProds[0].id);
                    else if (products.length > 0) setManualProductId(products[0].id);
                    setShowManualLicenseModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-amber-400 text-black font-black text-xs hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaKey className="text-xs" />
                  <span>Issue License</span>
                </button>
              )}


              {activeTab === "customers" && (
                <button
                  onClick={() => setShowMarketingCampaignModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaBullhorn className="text-xs" />
                  <span>Campaign Hub</span>
                </button>
              )}

              {activeTab === "coupons" && (
                <button
                  onClick={() => {
                    setEditingCoupon(null);
                    setCouponCodeInput("");
                    setCouponTargetProductInput("all");
                    setCouponTypeInput("percentage");
                    setCouponValueInput(20);
                    setCouponMaxUsesInput(100);
                    setShowAddCouponModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-purple-500 text-white font-black text-xs hover:bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaPlus className="text-xs" />
                  <span>Create Coupon</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Tab Content Workspace Box */}
          <div className="bg-surface/90 border border-border/80 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">

            {approvalSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-bold flex items-center justify-between">
                <span>{approvalSuccess}</span>
                <button onClick={() => setApprovalSuccess(null)} className="text-emerald-400">
                  <FaTimes />
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 1: ORDERS MANAGEMENT                                  */}
            {/* ========================================================= */}
            {(activeTab === "orders" || activeTab === "payments") && (
              <div className="space-y-6">

                {/* Orders Live Stats Strip */}
                {(() => {
                  const pendingOrders = orders.filter((o) => o.status === "pending");
                  const approvedOrders = orders.filter((o) => o.status === "approved");
                  const totalRevenue = approvedOrders.reduce((sum, o) => sum + (o.productPrice || 0), 0);

                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Total Orders</span>
                          <div className="text-xl font-black text-secondary font-mono mt-0.5">{orders.length}</div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                          <FaShoppingBag />
                        </div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Pending Review</span>
                          <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{pendingOrders.length}</div>
                        </div>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${pendingOrders.length > 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse"
                          : "bg-surface border border-border text-text-muted"
                          }`}>
                          <FaClock />
                        </div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Verified & Sent</span>
                          <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{approvedOrders.length}</div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
                          <FaCheckCircle />
                        </div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-text-muted uppercase font-bold">Revenue Collected</span>
                          <div className="text-xl font-black text-primary font-mono mt-0.5">{totalRevenue.toLocaleString()} EGP</div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                          <FaChartLine />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Action Toolbar & Filters */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface/60 border border-border/70 p-4 rounded-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    {orders.length > 0 && (
                      <div className="flex items-center gap-2">
                        {orders.some((o) => o.status === "pending") && (
                          <button
                            onClick={handleApproveAllPendingOrders}
                            disabled={approvingAllOrders}
                            className="px-3.5 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
                          >
                            {approvingAllOrders ? (
                              <FaSpinner className="animate-spin text-xs" />
                            ) : (
                              <FaCheckCircle className="text-xs" />
                            )}
                            <span>Approve All Pending ({orders.filter((o) => o.status === "pending").length})</span>
                          </button>
                        )}

                        <button
                          onClick={() => exportCustomersToCSV(orderPricingFilter === "all" ? "all" : orderPricingFilter)}
                          className="px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-xs font-bold text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1.5 cursor-pointer"
                          title="Export Customer CSV File"
                        >
                          <FaFileExport className="text-xs" />
                          <span>Export CSV</span>
                        </button>

                        <button
                          onClick={handleDeleteAllOrders}
                          disabled={deletingAllOrders}
                          className="px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          title="Clear All Orders Queue"
                        >
                          <FaTrash className="text-xs" />
                          <span>{deletingAllOrders ? "Clearing..." : "Clear Queue"}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Search & Status Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                      <input
                        type="text"
                        placeholder="Search customer, email, phone..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="bg-background border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs text-secondary outline-none focus:border-primary w-full sm:w-60"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1 bg-background border border-border/80 p-1 rounded-xl">
                      <button
                        onClick={() => setOrderStatusFilter("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${orderStatusFilter === "all" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"
                          }`}
                      >
                        All ({orders.length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("pending")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${orderStatusFilter === "pending" ? "bg-amber-500 text-black" : "text-text-muted hover:text-secondary"
                          }`}
                      >
                        Pending ({orders.filter((o) => o.status === "pending").length})
                      </button>
                      <button
                        onClick={() => setOrderStatusFilter("approved")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${orderStatusFilter === "approved" ? "bg-emerald-500 text-black" : "text-text-muted hover:text-secondary"
                          }`}
                      >
                        Approved ({orders.filter((o) => o.status === "approved").length})
                      </button>
                    </div>

                    {/* Pricing Filter: All, Paid, Free */}
                    <div className="flex items-center gap-1 bg-background border border-border/80 p-1 rounded-xl">
                      <button
                        onClick={() => setOrderPricingFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${orderPricingFilter === "all" ? "bg-primary/20 text-primary border border-primary/40" : "text-text-muted hover:text-secondary"
                          }`}
                      >
                        All Types
                      </button>
                      <button
                        onClick={() => setOrderPricingFilter("paid")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${orderPricingFilter === "paid" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-text-muted hover:text-secondary"
                          }`}
                      >
                        Paid ({orders.filter((o) => o.pricingType === "paid" || (o.productPrice || 0) > 0).length})
                      </button>
                      <button
                        onClick={() => setOrderPricingFilter("free")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${orderPricingFilter === "free" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-text-muted hover:text-secondary"
                          }`}
                      >
                        Free ({orders.filter((o) => o.pricingType === "free" || (o.productPrice || 0) === 0).length})
                      </button>
                    </div>
                  </div>
                </div>

                {(() => {
                  const filteredOrders = orders.filter((o) => {
                    const matchesStatus =
                      orderStatusFilter === "all"
                        ? true
                        : orderStatusFilter === "pending"
                          ? o.status === "pending"
                          : o.status === "approved";

                    const isFreeOrder = o.pricingType === "free" || (o.productPrice || 0) === 0;
                    const matchesPricing =
                      orderPricingFilter === "all"
                        ? true
                        : orderPricingFilter === "free"
                          ? isFreeOrder
                          : !isFreeOrder;

                    const search = orderSearch.toLowerCase().trim();
                    const matchesSearch =
                      !search ||
                      o.customerName?.toLowerCase().includes(search) ||
                      o.customerEmail?.toLowerCase().includes(search) ||
                      o.customerPhone?.toLowerCase().includes(search) ||
                      o.productTitle?.toLowerCase().includes(search) ||
                      o.id?.toLowerCase().includes(search);

                    return matchesStatus && matchesPricing && matchesSearch;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="text-center py-16 bg-surface/50 border border-border/60 rounded-3xl text-text-muted text-xs font-mono">
                        No orders match your active filter criteria.
                      </div>
                    );
                  }

                  return (
                    <div className="bg-surface/90 border border-border/80 rounded-3xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-background/60 border-b border-border/60 text-[11px] font-mono text-text-muted uppercase tracking-wider">
                              <th className="py-3.5 px-4 font-bold">Order ID & Date</th>
                              <th className="py-3.5 px-4 font-bold">Customer Details</th>
                              <th className="py-3.5 px-4 font-bold">Product Purchased</th>
                              <th className="py-3.5 px-4 font-bold">Payment & Receipt</th>
                              <th className="py-3.5 px-4 font-bold">Status</th>
                              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 text-xs">
                            {filteredOrders.map((order) => {
                              const isFree = order.pricingType === "free" || (order.productPrice || 0) === 0;
                              const initial = (order.customerName || "C").charAt(0).toUpperCase();

                              return (
                                <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                                  {/* Order ID & Date */}
                                  <td className="py-3.5 px-4 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-secondary">#{order.id.slice(0, 8)}</span>
                                      <button
                                        onClick={() => copyToClipboard(order.id, "Order ID")}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-muted hover:text-primary"
                                        title="Copy full Order ID"
                                      >
                                        <FaCopy />
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-text-muted mt-0.5">
                                      {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </div>
                                  </td>

                                  {/* Customer Profile Card */}
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 text-primary font-bold font-mono text-xs flex items-center justify-center shrink-0">
                                        {initial}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold text-secondary truncate">{order.customerName}</div>
                                        <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5">
                                          <span className="truncate">{order.customerEmail}</span>
                                          <button
                                            onClick={() => copyToClipboard(order.customerEmail, "Customer Email")}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-muted hover:text-primary shrink-0"
                                            title="Copy email"
                                          >
                                            <FaEnvelope />
                                          </button>
                                        </div>
                                        {order.customerPhone && order.customerPhone !== "-" && (
                                          <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                            <span>{order.customerPhone}</span>
                                            <button
                                              onClick={() => openWhatsAppChat(order.customerPhone, order.customerName, order.productTitle)}
                                              className="hover:scale-110 transition-transform"
                                              title="WhatsApp Direct Chat"
                                            >
                                              <FaWhatsapp className="text-xs" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* Product Item & Selected Plan */}
                                  <td className="py-3.5 px-4">
                                    <div className="font-bold text-secondary flex items-center gap-1.5 flex-wrap">
                                      <span>{order.productTitle}</span>
                                      {order.planName && (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 font-mono">
                                          📦 {order.planName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="font-mono text-xs mt-1 space-y-0.5">
                                      {isFree ? (
                                        <span className="text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded text-[10px] font-bold">Free Download</span>
                                      ) : (
                                        <div className="flex flex-col gap-0.5">
                                          <div className="flex items-center gap-2">
                                            {order.discountAmount && order.discountAmount > 0 ? (
                                              <>
                                                <span className="text-text-muted line-through text-[10px]">
                                                  Plan: {(order.productPrice || 0) + (order.discountAmount || 0)} EGP
                                                </span>
                                                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                                  🏷️ {order.couponCode || "Discount"}: -{order.discountAmount} EGP
                                                </span>
                                              </>
                                            ) : (
                                              <span className="text-text-muted text-[10px]">
                                                Plan Price: {order.productPrice} EGP
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-primary font-black text-xs flex items-center gap-1">
                                            <span>Paid: {order.finalPrice !== undefined ? order.finalPrice : order.productPrice} EGP</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Payment Method & Receipt Lightbox */}
                                  <td className="py-3.5 px-4 font-mono text-[11px]">
                                    <div className="flex items-center gap-2">
                                      {isFree ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                                          Free Access (No Payment)
                                        </span>
                                      ) : (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.paymentMethod?.toLowerCase().includes("vodafone")
                                          ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                          : "bg-purple-500/10 text-purple-300 border border-purple-500/30"
                                          }`}>
                                          {order.paymentMethod || "InstaPay"}
                                        </span>
                                      )}

                                      {!isFree && order.screenshotUrl && (
                                        <button
                                          onClick={() => setLightboxImage({ url: order.screenshotUrl!, title: `Payment Proof - ${order.customerName}` })}
                                          className="p-1 rounded-lg bg-background border border-primary/40 hover:border-primary transition-all shrink-0 group/img relative"
                                          title="View Payment Proof Image"
                                        >
                                          <img
                                            src={order.screenshotUrl}
                                            alt="Proof"
                                            className="w-6 h-6 object-cover rounded"
                                          />
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  {/* Status */}
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${order.status === "approved"
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                        }`}
                                    >
                                      {order.status}
                                    </span>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-2">
                                      {order.status === "pending" && !isFree && (
                                        <button
                                          onClick={() => handleApproveOrder(order.id)}
                                          disabled={approvingOrderId === order.id}
                                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1 shadow-md disabled:opacity-50 cursor-pointer"
                                        >
                                          {approvingOrderId === order.id ? (
                                            <FaSpinner className="animate-spin text-xs" />
                                          ) : (
                                            <FaCheck className="text-xs" />
                                          )}
                                          <span>Approve & Dispatch</span>
                                        </button>
                                      )}

                                      {order.customerPhone && order.customerPhone !== "-" && (
                                        <button
                                          onClick={async () => {
                                            let cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");
                                            if (cleanPhone.startsWith("01")) cleanPhone = `20${cleanPhone.substring(1)}`;

                                            const siteOrigin = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin) : (process.env.NEXT_PUBLIC_SITE_URL || "https://bid032.com");
                                            let fileDownloadUrl = "";
                                            let generatedLicKey = order.licenseKey || "";

                                            if (order.status === "pending") {
                                              // Auto-approve order if pending to generate token & license
                                              try {
                                                const res = await fetch("/api/store/approve-order", {
                                                  method: "POST",
                                                  headers: { "Content-Type": "application/json" },
                                                  body: JSON.stringify({ orderId: order.id, adminPassword: password }),
                                                });
                                                const data = await res.json();
                                                if (data.downloadLink) {
                                                  fileDownloadUrl = data.downloadLink;
                                                }
                                                if (data.rawLicenseKey) {
                                                  generatedLicKey = data.rawLicenseKey;
                                                }
                                                loadOrders();
                                                loadLicensePlatformData();
                                              } catch (e) { }
                                            }

                                            if (!fileDownloadUrl) {
                                              if (order.downloadToken) {
                                                fileDownloadUrl = `${siteOrigin}/api/store/download?token=${order.downloadToken}`;
                                              } else {
                                                fileDownloadUrl = `${siteOrigin}/api/store/download?orderId=${order.id}`;
                                              }
                                            }

                                            if (!generatedLicKey) {
                                              const matchLic = licenses.find(
                                                (l) => l.userEmail === order.customerEmail && l.productId === order.productId
                                              );
                                              if (matchLic) generatedLicKey = matchLic.rawLicenseKey || `Key-Ending-${matchLic.licenseKeyLast4}`;
                                            }

                                            const planText = order.planName || "Standard Plan";
                                            const licSection = generatedLicKey ? `\n- License Key: ${generatedLicKey}` : "";

                                            const msgText =
                                              `Hello ${order.customerName},\n\n` +
                                              `Your order #${order.id.slice(0, 8)} for "${order.productTitle}" has been verified and approved.\n\n` +
                                              `Order Details:\n` +
                                              `- Product: ${order.productTitle}\n` +
                                              `- License Plan: ${planText}\n` +
                                              `- Order ID: #${order.id.slice(0, 8)}${licSection}\n\n` +
                                              `Direct Download Link:\n${fileDownloadUrl}\n\n` +
                                              `Order Verification Page:\n${siteOrigin}/store/order-success/${order.id}\n\n` +
                                              `Thank you for choosing Abdallah Store. Please contact support if you need further assistance.`;

                                            const msg = encodeURIComponent(msgText);
                                            window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
                                          }}
                                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-1 cursor-pointer"
                                          title="Send instant WhatsApp download link"
                                        >
                                          <FaWhatsapp className="text-xs shrink-0" />
                                          <span>WhatsApp Link</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={() => handleDeleteOrder(order.id, order.customerName)}
                                        disabled={deletingOrderId === order.id}
                                        className="p-2 rounded-xl bg-surface border border-border text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs disabled:opacity-50 cursor-pointer"
                                        title="Delete order"
                                      >
                                        <FaTrash />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: CUSTOMER LEADS & MARKETING DIRECTORY               */}
            {/* ========================================================= */}
            {activeTab === "customers" && (
              <div className="space-y-6">
                {/* Export & Outreach Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/60 border border-border/70 rounded-2xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase bg-primary/20 text-primary border border-primary/30">
                      CRM Contacts
                    </span>
                    <span className="text-xs text-text-muted font-mono">• {getFilteredOrders(customerTypeFilter, customerProductFilter, customerDateRange).length} Records</span>
                  </div>

                  {/* Export Toolbar Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Campaign Message Generator */}
                    <button
                      onClick={() => setShowMarketingCampaignModal(true)}
                      className="px-4 py-2 rounded-2xl bg-amber-500 text-black text-xs font-black hover:bg-amber-400 transition-all flex items-center gap-2 shadow-lg"
                    >
                      <FaBullhorn className="text-sm" />
                      <span>Campaign Hub</span>
                    </button>

                    {/* Quick Copy Group */}
                    <div className="flex items-center gap-1 bg-background/80 border border-border/80 p-1 rounded-2xl">
                      <button
                        onClick={() => copyCustomerEmails(customerTypeFilter, customerProductFilter, customerDateRange)}
                        className="px-3 py-1.5 rounded-xl text-primary hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Copy comma-separated customer emails"
                      >
                        <FaEnvelope className="text-xs" />
                        <span>Emails</span>
                      </button>
                      <button
                        onClick={() => copyCustomerPhones(customerTypeFilter, customerProductFilter, customerDateRange)}
                        className="px-3 py-1.5 rounded-xl text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Copy customer phone numbers"
                      >
                        <FaWhatsapp className="text-xs" />
                        <span>Phones</span>
                      </button>
                    </div>

                    {/* Export Suite Group */}
                    <div className="flex items-center gap-1 bg-background/80 border border-border/80 p-1 rounded-2xl">
                      <button
                        onClick={() => exportCustomersToExcel(customerTypeFilter, customerProductFilter, customerExportMode, customerDateRange)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1 shadow-sm"
                        title="Export Excel (.xls)"
                      >
                        <FaFileExcel className="text-xs" />
                        <span>Excel</span>
                      </button>

                      <button
                        onClick={() => exportCustomersToCSV(customerTypeFilter, customerProductFilter, customerExportMode, customerDateRange)}
                        className="px-3 py-1.5 rounded-xl text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all flex items-center gap-1"
                        title="Export CSV File"
                      >
                        <FaFileExport className="text-xs" />
                        <span>CSV</span>
                      </button>

                      <button
                        onClick={() => exportCustomersToVCF(customerTypeFilter, customerProductFilter, customerDateRange)}
                        className="px-3 py-1.5 rounded-xl text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition-all flex items-center gap-1"
                        title="Export vCard (.vcf)"
                      >
                        <FaAddressCard className="text-xs" />
                        <span>vCard</span>
                      </button>

                      <button
                        onClick={() => exportCustomersToJSON(customerTypeFilter, customerProductFilter, customerDateRange)}
                        className="px-3 py-1.5 rounded-xl text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-all flex items-center gap-1"
                        title="Export JSON"
                      >
                        <FaFileCode className="text-xs" />
                        <span>JSON</span>
                      </button>

                      <button
                        onClick={() => setCustomerExportMode(customerExportMode === "unique_profiles" ? "all_transactions" : "unique_profiles")}
                        className="px-2 py-1.5 rounded-xl text-[10px] font-mono text-text-secondary hover:text-white transition-colors"
                        title="Toggle Profiles Mode vs All Orders Mode"
                      >
                        {customerExportMode === "unique_profiles" ? "Profiles" : "Orders"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bento Analytics Summary Cards */}
                {(() => {
                  const filteredOrders = getFilteredOrders(customerTypeFilter, customerProductFilter, customerDateRange);
                  const profiles = getUniqueCustomerProfiles(filteredOrders);
                  const paidProfiles = profiles.filter((p) => p.totalSpentEgp > 0);
                  const freeProfiles = profiles.filter((p) => p.totalSpentEgp === 0);
                  const totalRevenue = profiles.reduce((acc, curr) => acc + curr.totalSpentEgp, 0);
                  const conversionRate = profiles.length > 0 ? ((paidProfiles.length / profiles.length) * 100).toFixed(1) : "0";
                  const arpu = paidProfiles.length > 0 ? Math.round(totalRevenue / paidProfiles.length) : 0;
                  const vipCount = profiles.filter((p) => p.segment === "VIP Customer").length;

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-md">
                        <div className="text-[10px] font-mono text-text-muted uppercase">Total Unique Leads</div>
                        <div className="text-2xl font-black text-secondary mt-1">{profiles.length}</div>
                        <div className="text-[10px] text-text-muted mt-1">{freeProfiles.length} Free • {paidProfiles.length} Paid</div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-md">
                        <div className="text-[10px] font-mono text-text-muted uppercase">Paid Conversion Rate</div>
                        <div className="text-2xl font-black text-emerald-400 mt-1">{conversionRate}%</div>
                        <div className="text-[10px] text-text-muted mt-1">{paidProfiles.length} of {profiles.length} leads converted</div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-md">
                        <div className="text-[10px] font-mono text-text-muted uppercase">Total Revenue (EGP)</div>
                        <div className="text-2xl font-black text-primary mt-1">{totalRevenue.toLocaleString()} EGP</div>
                        <div className="text-[10px] text-text-muted mt-1">From active filters</div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-md">
                        <div className="text-[10px] font-mono text-text-muted uppercase">Avg Spent / Customer</div>
                        <div className="text-2xl font-black text-cyan-400 mt-1">{arpu} EGP</div>
                        <div className="text-[10px] text-text-muted mt-1">Average per paid buyer</div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 shadow-md col-span-2 md:col-span-1">
                        <div className="text-[10px] font-mono text-text-muted uppercase">VIP Customers</div>
                        <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
                          <span>{vipCount}</span>
                          <FaCrown className="text-xs" />
                        </div>
                        <div className="text-[10px] text-text-muted mt-1">&gt; 3 paid purchases only</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-surface/60 border border-border/60 p-4 rounded-2xl">
                  {/* Left: Search & Filter Pills */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Live Search */}
                    <div className="relative">
                      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                      <input
                        type="text"
                        placeholder="Search customer name, email, phone..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="bg-background border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs text-secondary outline-none focus:border-primary w-64"
                      />
                    </div>

                    {/* Access Type Pills */}
                    <div className="flex items-center gap-1 bg-background border border-border/80 p-1 rounded-xl">
                      <button
                        onClick={() => setCustomerTypeFilter("all")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${customerTypeFilter === "all" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"}`}
                      >
                        All Types
                      </button>
                      <button
                        onClick={() => setCustomerTypeFilter("paid")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${customerTypeFilter === "paid" ? "bg-amber-500 text-black" : "text-text-muted hover:text-secondary"}`}
                      >
                        Paid Customers
                      </button>
                      <button
                        onClick={() => setCustomerTypeFilter("free")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${customerTypeFilter === "free" ? "bg-cyan-500 text-black" : "text-text-muted hover:text-secondary"}`}
                      >
                        Free Tool Downloads
                      </button>
                    </div>

                    {/* Date Range Selector */}
                    <div className="flex items-center gap-1 bg-background border border-border/80 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setCustomerDateRange("all")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${customerDateRange === "all" ? "bg-surface text-secondary border border-border" : "text-text-muted hover:text-secondary"}`}
                      >
                        All Time
                      </button>
                      <button
                        onClick={() => setCustomerDateRange("30days")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${customerDateRange === "30days" ? "bg-surface text-secondary border border-border" : "text-text-muted hover:text-secondary"}`}
                      >
                        Last 30 Days
                      </button>
                      <button
                        onClick={() => setCustomerDateRange("7days")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${customerDateRange === "7days" ? "bg-surface text-secondary border border-border" : "text-text-muted hover:text-secondary"}`}
                      >
                        Last 7 Days
                      </button>
                      <button
                        onClick={() => setCustomerDateRange("today")}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${customerDateRange === "today" ? "bg-surface text-secondary border border-border" : "text-text-muted hover:text-secondary"}`}
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  {/* Right: Product Scope & Display Mode Toggle */}
                  <div className="flex items-center gap-3">
                    <select
                      value={customerProductFilter}
                      onChange={(e) => setCustomerProductFilter(e.target.value)}
                      className="bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none focus:border-primary"
                    >
                      <option value="all">All Products & Tools Scope</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.pricingType === "free" ? "Free" : `${p.priceEgp} EGP`})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 bg-background border border-border/80 p-1 rounded-xl text-xs">
                      <button
                        onClick={() => setCustomerExportMode("unique_profiles")}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors ${customerExportMode === "unique_profiles" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"}`}
                      >
                        Unique Profiles View
                      </button>
                      <button
                        onClick={() => setCustomerExportMode("all_transactions")}
                        className={`px-3 py-1 rounded-lg font-bold transition-colors ${customerExportMode === "all_transactions" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"}`}
                      >
                        All Orders View
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customer Leads Directory Table */}
                {(() => {
                  const rawFiltered = getFilteredOrders(customerTypeFilter, customerProductFilter, customerDateRange);

                  // Apply search term filter
                  const search = customerSearch.toLowerCase().trim();
                  const searchFiltered = rawFiltered.filter((o) => {
                    if (!search) return true;
                    return (
                      o.customerName?.toLowerCase().includes(search) ||
                      o.customerEmail?.toLowerCase().includes(search) ||
                      o.customerPhone?.toLowerCase().includes(search) ||
                      o.productTitle?.toLowerCase().includes(search)
                    );
                  });

                  if (searchFiltered.length === 0) {
                    return (
                      <div className="text-center py-16 bg-surface/50 border border-border/60 rounded-3xl text-text-muted text-xs font-mono">
                        No customer records match your filter & search parameters.
                      </div>
                    );
                  }

                  if (customerExportMode === "unique_profiles") {
                    const profiles = getUniqueCustomerProfiles(searchFiltered);
                    return (
                      <div className="bg-surface/90 border border-border/80 rounded-3xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-background/60 border-b border-border/60 text-[11px] font-mono text-text-muted uppercase tracking-wider">
                                <th className="py-3.5 px-4 font-bold">Customer Lead</th>
                                <th className="py-3.5 px-4 font-bold">Segment Tag</th>
                                <th className="py-3.5 px-4 font-bold">Total Orders</th>
                                <th className="py-3.5 px-4 font-bold">Revenue Spent</th>
                                <th className="py-3.5 px-4 font-bold">Items Claimed / Bought</th>
                                <th className="py-3.5 px-4 font-bold">Last Activity</th>
                                <th className="py-3.5 px-4 font-bold text-right">Quick Contact</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40 text-xs">
                              {profiles.map((profile, idx) => {
                                const initial = (profile.customerName || "C").charAt(0).toUpperCase();
                                const isVip = profile.segment === "VIP Customer";
                                const isPaid = profile.totalSpentEgp > 0;

                                return (
                                  <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                                    {/* Customer Lead Profile */}
                                    <td className="py-3.5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold font-mono text-xs shrink-0 ${isVip
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                          : isPaid
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                            : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                                          }`}>
                                          {initial}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="font-bold text-secondary flex items-center gap-1.5 truncate">
                                            <span>{profile.customerName}</span>
                                            {isVip && <FaCrown className="text-amber-400 text-xs shrink-0" title="VIP Customer" />}
                                          </div>
                                          <div className="text-[11px] text-text-muted font-mono flex items-center gap-1.5">
                                            <span className="truncate">{profile.customerEmail}</span>
                                            <button
                                              onClick={() => copyToClipboard(profile.customerEmail, "Customer Email")}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-muted hover:text-primary shrink-0"
                                              title="Copy email"
                                            >
                                              <FaEnvelope />
                                            </button>
                                          </div>
                                          {profile.customerPhone && profile.customerPhone !== "-" && (
                                            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                                              <span>{profile.customerPhone}</span>
                                              <button
                                                onClick={() => copyToClipboard(profile.customerPhone, "Customer Phone")}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-text-muted hover:text-emerald-400 shrink-0"
                                                title="Copy phone"
                                              >
                                                <FaCopy />
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Segment Tag */}
                                    <td className="py-3.5 px-4">
                                      <span
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase inline-flex items-center gap-1 ${isVip
                                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                          : isPaid
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                                          }`}
                                      >
                                        {isVip && <FaCrown className="text-[10px]" />}
                                        <span>{profile.segment}</span>
                                      </span>
                                    </td>

                                    {/* Total Orders */}
                                    <td className="py-3.5 px-4 font-mono font-bold text-secondary">
                                      {profile.totalOrders} {profile.totalOrders === 1 ? "Order" : "Orders"}
                                    </td>

                                    {/* Total Revenue Spent */}
                                    <td className="py-3.5 px-4 font-mono font-bold">
                                      {profile.totalSpentEgp > 0 ? (
                                        <span className="text-primary">{profile.totalSpentEgp.toLocaleString()} EGP</span>
                                      ) : (
                                        <span className="text-cyan-400 text-[10px]">Free Access Only</span>
                                      )}
                                    </td>

                                    {/* Purchased / Claimed Items */}
                                    <td className="py-3.5 px-4">
                                      <div className="max-w-xs space-y-1">
                                        {Array.from(profile.purchasedProducts).map((prod, i) => (
                                          <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20 mr-1 mb-1 font-mono">
                                            {prod}
                                          </span>
                                        ))}
                                        {Array.from(profile.freeProducts).map((prod, i) => (
                                          <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mr-1 mb-1 font-mono">
                                            {prod} (Free)
                                          </span>
                                        ))}
                                      </div>
                                    </td>

                                    {/* Last Activity Date */}
                                    <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">
                                      {new Date(profile.lastDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </td>

                                    {/* Quick Contact & Outreach Actions */}
                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                      <div className="flex items-center justify-end gap-2">
                                        {profile.customerPhone && profile.customerPhone !== "-" && (
                                          <>
                                            <button
                                              onClick={() => openWhatsAppChat(profile.customerPhone, profile.customerName, Array.from(profile.purchasedProducts)[0] || Array.from(profile.freeProducts)[0] || "Store Tool")}
                                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                                              title="Direct WhatsApp Chat"
                                            >
                                              <FaWhatsapp className="text-xs" />
                                              <span>WhatsApp</span>
                                            </button>

                                            <button
                                              onClick={() =>
                                                setWhatsappModalCustomer({
                                                  name: profile.customerName,
                                                  phone: profile.customerPhone,
                                                  email: profile.customerEmail,
                                                  totalSpent: profile.totalSpentEgp,
                                                  items: [
                                                    ...Array.from(profile.purchasedProducts),
                                                    ...Array.from(profile.freeProducts),
                                                  ],
                                                  tag:
                                                    profile.segment === "VIP Customer"
                                                      ? "VIP Customer"
                                                      : profile.totalOrders > 1
                                                        ? "Repeat Customer"
                                                        : profile.totalSpentEgp > 0
                                                          ? "Paid Customer"
                                                          : "Free Lead",
                                                })
                                              }
                                              className="p-1.5 rounded-xl bg-surface border border-border text-amber-400 hover:bg-amber-500 hover:text-black transition-all text-xs cursor-pointer"
                                              title="Send Custom Campaign Message"
                                            >
                                              <FaBullhorn className="text-xs" />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }

                  // All Transactions View
                  return (
                    <div className="bg-surface/90 border border-border/80 rounded-3xl overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-background/60 border-b border-border/60 text-[11px] font-mono text-text-muted uppercase tracking-wider">
                              <th className="py-3.5 px-4 font-bold">Order ID</th>
                              <th className="py-3.5 px-4 font-bold">Customer Name</th>
                              <th className="py-3.5 px-4 font-bold">Contact Email / Phone</th>
                              <th className="py-3.5 px-4 font-bold">Product Item</th>
                              <th className="py-3.5 px-4 font-bold">Pricing & Type</th>
                              <th className="py-3.5 px-4 font-bold">Date & Time</th>
                              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/40 text-xs">
                            {searchFiltered.map((order) => {
                              const isFree = order.pricingType === "free" || (order.productPrice || 0) === 0;
                              return (
                                <tr key={order.id} className="hover:bg-primary/5 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-bold text-secondary">#{order.id}</td>
                                  <td className="py-3.5 px-4 font-bold text-secondary">{order.customerName}</td>
                                  <td className="py-3.5 px-4 font-mono">
                                    <div className="text-secondary">{order.customerEmail}</div>
                                    <div className="text-[10px] text-text-muted">{order.customerPhone || "-"}</div>
                                  </td>
                                  <td className="py-3.5 px-4 font-medium text-secondary">{order.productTitle}</td>
                                  <td className="py-3.5 px-4 font-mono">
                                    {isFree ? (
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">Free Claim</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold border border-primary/30">{order.productPrice} EGP</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 font-mono text-[11px] text-text-muted">
                                    {new Date(order.createdAt).toLocaleString("en-US")}
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    {order.customerPhone && order.customerPhone !== "-" && (
                                      <button
                                        onClick={() => openWhatsAppChat(order.customerPhone, order.customerName, order.productTitle)}
                                        className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-black transition-all inline-flex items-center gap-1"
                                      >
                                        <FaWhatsapp />
                                        <span>Chat</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2 & 9: PRODUCTS & SUBSCRIPTION PLANS HUB              */}
            {/* ========================================================= */}
            {(activeTab === "products" || activeTab === "plans") && (
              <div className="space-y-6">
                {/* Prominently Centered Sub-Tab Selector Navigation Switcher */}
                <div className="flex items-center justify-center pb-4 border-b border-border/60">
                  <div className="flex items-center gap-1.5 bg-background/90 border border-amber-500/30 p-1.5 rounded-2xl shadow-xl shadow-amber-500/5 mx-auto">
                    <button
                      onClick={() => {
                        setActiveTab("products");
                        setProductsSubTab("products");
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeTab === "products" && productsSubTab === "products"
                          ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105"
                          : "text-text-muted hover:text-secondary hover:bg-surface/60"
                        }`}
                    >
                      <FaLayerGroup className="text-xs" />
                      <span>Products Catalog ({products.length})</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("plans");
                        setProductsSubTab("plans");
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${activeTab === "plans" || productsSubTab === "plans"
                          ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20 scale-105"
                          : "text-text-muted hover:text-secondary hover:bg-surface/60"
                        }`}
                    >
                      <FaKey className="text-xs" />
                      <span>Subscription Plans ({plans.length})</span>
                    </button>
                  </div>
                </div>

                {(activeTab === "products" && productsSubTab === "products") && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        {/* Product Search */}
                        <div className="relative">
                          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                          <input
                            type="text"
                            placeholder="Search products..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="bg-surface border border-border/80 rounded-xl pl-9 pr-4 py-2 text-xs text-secondary outline-none focus:border-primary w-56"
                          />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1 bg-surface border border-border/80 p-1 rounded-xl">
                          <button
                            onClick={() => setProductCategoryFilter("all")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${productCategoryFilter === "all" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"
                              }`}
                          >
                            All
                          </button>
                          <button
                            onClick={() => setProductCategoryFilter("plugin")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${productCategoryFilter === "plugin" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"
                              }`}
                          >
                            Plugins
                          </button>
                          <button
                            onClick={() => setProductCategoryFilter("tool")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${productCategoryFilter === "tool" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"
                              }`}
                          >
                            Tools
                          </button>
                          <button
                            onClick={() => setProductCategoryFilter("script")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${productCategoryFilter === "script" ? "bg-primary text-black" : "text-text-muted hover:text-secondary"
                              }`}
                          >
                            Scripts
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setProdTitle("");
                            setProdSlug("");
                            setProdSub("");
                            setProdDesc("");
                            setProdCat("plugin");
                            setProdPricing("paid");
                            setProdPriceEgp(450);
                            setProdOriginalPriceEgp(550);
                            setProdPriceUsd(15);
                            setProdIsExternalAuthor(false);
                            setProdAuthorName("");
                            setProdAuthorLink("");
                            setProdSortOrder(0);
                            setProdIsHidden(false);
                            setProdBadge("Popular");
                            setProdSoftware("Adobe Illustrator");
                            setProdComp("Windows / Mac");
                            setProdVer("v1.0.0");
                            setProdFileUrl("");
                            setProdCoverImage("");
                            setProdGallery([]);
                            setProdFeatures("Feature 1, Feature 2, Feature 3");
                            setShowAddProductModal(true);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-lg"
                        >
                          <FaPlus />
                          <span>Add New Product</span>
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const filteredProducts = products.filter((p) => {
                        const matchesCat = productCategoryFilter === "all" || normalizeCategory(p.category) === productCategoryFilter;
                        const search = productSearch.toLowerCase().trim();
                        const matchesSearch =
                          !search ||
                          p.title?.toLowerCase().includes(search) ||
                          p.description?.toLowerCase().includes(search) ||
                          p.slug?.toLowerCase().includes(search);

                        return matchesCat && matchesSearch;
                      });

                      if (filteredProducts.length === 0) {
                        return (
                          <div className="text-center py-16 bg-surface/50 border border-border/60 rounded-3xl text-text-muted text-xs font-mono">
                            No products match your active search or filter.
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredProducts.map((prod) => {
                            const isSpotlight = activeSpotlightId === prod.id || activeSpotlightId === prod.slug;
                            return (
                              <div key={prod.id} className={`bg-surface/90 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all ${isSpotlight ? "border-amber-500/60 ring-1 ring-amber-500/30" : "border-border/80"}`}>
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-mono uppercase font-bold text-primary">{prod.category}</span>
                                      {isSpotlight && (
                                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                          <FaStar className="text-[8px]" /> Spotlight
                                        </span>
                                      )}

                                      {/* Visibility Toggle Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleProductVisibility(prod)}
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 transition-all ${prod.isHidden
                                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                                          }`}
                                        title={prod.isHidden ? "Product is HIDDEN from store. Click to publish!" : "Product is VISIBLE in store. Click to hide!"}
                                      >
                                        {prod.isHidden ? <FaEyeSlash className="text-[9px]" /> : <FaEye className="text-[9px]" />}
                                        <span>{prod.isHidden ? "Hidden" : "Visible"}</span>
                                      </button>

                                      {/* Quick Sort Order Controls */}
                                      <div className="inline-flex items-center gap-1 bg-surface border border-border/80 px-1.5 py-0.5 rounded-lg text-[9px] font-mono font-bold text-text-muted">
                                        <span>Pos: #{prod.sortOrder || 0}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateProductSortOrder(prod, -1)}
                                          className="hover:text-primary transition-colors px-0.5"
                                          title="Move Up in Store Order"
                                        >
                                          <FaArrowUp className="text-[8px]" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateProductSortOrder(prod, 1)}
                                          className="hover:text-primary transition-colors px-0.5"
                                          title="Move Down in Store Order"
                                        >
                                          <FaArrowDown className="text-[8px]" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      {editingInlinePriceId === prod.id ? (
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            value={inlinePriceValue}
                                            onChange={(e) => setInlinePriceValue(Number(e.target.value))}
                                            className="w-20 bg-background border border-primary rounded-lg px-2 py-1 text-xs text-secondary font-mono outline-none"
                                          />
                                          <button
                                            onClick={() => handleQuickPriceSave(prod.id, prod)}
                                            className="p-1.5 rounded-lg bg-emerald-500 text-black text-xs hover:bg-emerald-400"
                                          >
                                            <FaCheck />
                                          </button>
                                          <button
                                            onClick={() => setEditingInlinePriceId(null)}
                                            className="p-1.5 rounded-lg bg-surface border border-border text-xs text-text-muted hover:text-white"
                                          >
                                            <FaTimes />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-primary">
                                          <span>{prod.pricingType === "paid" ? `${prod.priceEgp} EGP` : "Free"}</span>
                                          <button
                                            onClick={() => {
                                              setEditingInlinePriceId(prod.id);
                                              setInlinePriceValue(prod.priceEgp || 0);
                                            }}
                                            className="text-[10px] text-text-muted hover:text-primary transition-colors p-1"
                                            title="Quick Edit Price"
                                          >
                                            <FaEdit />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <h3 className="font-bold text-secondary text-base mb-1">{prod.title}</h3>
                                  <p className="text-text-muted text-xs line-clamp-2 mb-4">{prod.description}</p>
                                </div>

                                <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                                  <button
                                    onClick={() => handleSetSpotlight(prod.id, prod.title)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${isSpotlight
                                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                      : "bg-surface hover:bg-surface-hover text-text-muted hover:text-amber-400 border border-border/60"
                                      }`}
                                    title="Set as Spotlight Tool of the Month on Store Header"
                                  >
                                    <FaStar className={isSpotlight ? "text-amber-400" : ""} />
                                    <span>{isSpotlight ? "Spotlight" : "Set Spotlight"}</span>
                                  </button>

                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handleDeleteProduct(prod.id, prod.title)}
                                      disabled={deletingProductId === prod.id}
                                      className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 disabled:opacity-50"
                                    >
                                      {deletingProductId === prod.id ? (
                                        <>
                                          <FaSpinner className="animate-spin text-xs" />
                                          <span>Deleting...</span>
                                        </>
                                      ) : (
                                        <>
                                          <FaTrash />
                                          <span>Delete</span>
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setEditingProduct(prod);
                                        setProdTitle(prod.title || "");
                                        setProdSlug(slugifyTitle(prod.title || "") || prod.slug || "");
                                        setProdSub(prod.subtitle || "");
                                        setProdDesc(prod.description || "");
                                        setProdCat(normalizeCategory(prod.category));
                                        setProdPricing(prod.pricingType || "paid");
                                        setProdPriceEgp(prod.priceEgp || 0);
                                        setProdOriginalPriceEgp(prod.originalPriceEgp !== undefined && prod.originalPriceEgp !== null ? prod.originalPriceEgp : "");
                                        setProdPriceUsd(prod.priceUsd || 0);
                                        setProdIsExternalAuthor(Boolean(prod.isExternalAuthor));
                                        setProdAuthorName(prod.authorName || "");
                                        setProdAuthorLink(prod.authorLink || "");
                                        setProdSortOrder(prod.sortOrder || 0);
                                        setProdIsHidden(Boolean(prod.isHidden));
                                        setProdBadge(prod.badge || "Popular");
                                        setProdSoftware(prod.software || "");
                                        setProdComp(prod.compatibility || "");
                                        setProdVer(prod.version || "");
                                        setProdFileUrl(prod.fileUrl || "");
                                        setProdCoverImage(prod.coverImage || "");
                                        setProdGallery(prod.gallery || []);
                                        setProdFeatures(
                                          Array.isArray(prod.features)
                                            ? prod.features.join(", ")
                                            : typeof prod.features === "string"
                                              ? prod.features
                                              : ""
                                        );
                                        setShowAddProductModal(true);
                                      }}
                                      className="text-xs text-primary font-bold flex items-center gap-1"
                                    >
                                      <FaEdit />
                                      <span>Edit</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {(activeTab === "plans" || productsSubTab === "plans") && (
                  <div className="space-y-6">
                    {/* Plans Management Top Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-surface/60 p-4 rounded-2xl border border-border/80">
                      <div>
                        <h3 className="font-bold text-secondary text-base">Product Subscription Plans</h3>
                        <p className="text-xs text-text-muted mt-0.5">Control pricing, trial durations, and device limits per paid product.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={planProductFilter}
                          onChange={(e) => setPlanProductFilter(e.target.value)}
                          className="bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none focus:border-amber-400"
                        >
                          <option value="all">All Paid Products</option>
                          {products
                            .filter((p) => p.pricingType === "paid" && p.priceEgp > 0)
                            .map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title}
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => {
                            const paidProds = products.filter((p) => p.pricingType === "paid" && p.priceEgp > 0);
                            if (paidProds.length > 0) {
                              setNewPlanProductId(paidProds[0].id);
                            }
                            setShowAddPlanModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-400/20"
                        >
                          <span>+ Add Subscription Plan</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {plans
                        .filter((plan) => {
                          const prod = products.find((p) => p.id === plan.productId);
                          const isPaidProduct = prod ? (prod.pricingType === "paid" && prod.priceEgp > 0) : true;
                          const matchesProduct = planProductFilter === "all" || plan.productId === planProductFilter;
                          return isPaidProduct && matchesProduct;
                        })
                        .map((plan, planIdx) => {
                          const prod = products.find((p) => p.id === plan.productId);

                          return (
                            <div key={plan.id || `plan_${planIdx}_${plan.name || planIdx}`} className="bg-surface/80 border border-border/80 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                              <div className="flex items-center justify-between">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${plan.trial ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-primary/20 text-primary border border-primary/30"
                                    }`}
                                >
                                  {plan.trial ? "Free Trial" : "Paid Plan"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-mono text-text-muted">{plan.durationDays} Days</span>
                                  <button
                                    onClick={() => setEditPlanModal(plan)}
                                    className="text-amber-400/80 hover:text-amber-400 text-xs transition-colors p-1"
                                    title="Edit Plan Specifications"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => {
                                      askConfirmation({
                                        title: "Delete Subscription Plan",
                                        message: `Are you sure you want to delete plan "${plan.name}"?`,
                                        confirmText: "Delete Plan",
                                        variant: "danger",
                                        onConfirm: async () => {
                                          const res = await fetch("/api/store/licenses", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              adminPassword: password,
                                              action: "delete_plan",
                                              planId: plan.id,
                                            }),
                                          });
                                          if (res.ok) {
                                            showToast("Plan deleted!", "info");
                                            loadLicensePlatformData();
                                          }
                                        },
                                      });
                                    }}
                                    className="text-red-400/60 hover:text-red-400 text-xs transition-colors p-1"
                                    title="Delete Plan"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-bold text-secondary text-base">{plan.name}</h3>
                                <p className="text-xs text-text-muted mt-0.5">{prod ? prod.title : plan.productId}</p>
                              </div>

                              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                                <div>
                                  <span className="text-xl font-black text-secondary">{plan.priceEgp} EGP</span>
                                  <span className="text-xs text-text-muted font-mono ml-2">(${plan.priceUsd})</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-amber-400">{plan.maxDevices} Device(s) Max</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB: SALES ANALYTICAL DASHBOARD                           */}
            {/* ========================================================= */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                      Live Overview
                    </span>
                    <span className="text-xs text-text-muted font-mono">• Real-time performance metrics</span>
                  </div>

                  <div className="flex items-center gap-2 bg-background border border-border/80 p-1 rounded-xl text-xs font-mono">
                    <span className="text-[10px] uppercase text-text-muted px-2 font-bold">Scope:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-primary text-black font-bold">All Time</span>
                  </div>
                </div>

                {/* Top High-Impact KPI Metrics Summary Strip */}
                {(() => {
                  const approvedOrders = orders.filter((o) => o.status === "approved");
                  const totalRevenueEgp = approvedOrders.reduce((sum, o) => sum + (o.productPrice || 0), 0);
                  const totalRevenueUsd = usdExchangeRate > 0 ? (totalRevenueEgp / usdExchangeRate).toFixed(1) : "0";
                  const paidOrdersCount = approvedOrders.filter((o) => (o.productPrice || 0) > 0 || o.pricingType === "paid").length;
                  const freeOrdersCount = orders.filter((o) => (o.productPrice || 0) === 0 || o.pricingType === "free").length;
                  const aovEgp = paidOrdersCount > 0 ? Math.round(totalRevenueEgp / paidOrdersCount) : 0;
                  const activeLicenses = licenses.filter((l) => l.status === "active").length;
                  const totalLeads = paidOrdersCount + freeOrdersCount;
                  const conversionRate = totalLeads > 0 ? Math.round((paidOrdersCount / totalLeads) * 100) : 0;

                  return (
                    <div className="space-y-6">
                      {/* Top Glowing Glass Bento KPI Metrics Strip */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="bg-gradient-to-br from-amber-500/10 via-surface/90 to-surface border border-amber-500/40 rounded-2xl p-4 space-y-1.5 shadow-xl relative overflow-hidden group hover:border-amber-400 transition-all">
                          <div className="flex items-center justify-between text-amber-400">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Gross Store Revenue</span>
                            <FaCoins className="text-amber-400 text-sm animate-pulse" />
                          </div>
                          <p className="text-2xl font-black text-amber-300 font-mono tracking-tight">{totalRevenueEgp.toLocaleString()} <span className="text-xs text-amber-400 font-bold">EGP</span></p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                            <span>≈ ${totalRevenueUsd} USD</span>
                            <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">+100% Verified</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-500/10 via-surface/90 to-surface border border-emerald-500/40 rounded-2xl p-4 space-y-1.5 shadow-xl group hover:border-emerald-400 transition-all">
                          <div className="flex items-center justify-between text-emerald-400">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Paid Sales (AOV)</span>
                            <FaShoppingBag className="text-emerald-400 text-sm" />
                          </div>
                          <p className="text-2xl font-black text-emerald-300 font-mono tracking-tight">{paidOrdersCount} <span className="text-xs text-emerald-400 font-bold">Orders</span></p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                            <span>Avg Order: <strong className="text-emerald-300">{aovEgp} EGP</strong></span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-cyan-500/10 via-surface/90 to-surface border border-cyan-500/40 rounded-2xl p-4 space-y-1.5 shadow-xl group hover:border-cyan-400 transition-all">
                          <div className="flex items-center justify-between text-cyan-400">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Free Lead Claims</span>
                            <FaDownload className="text-cyan-400 text-sm" />
                          </div>
                          <p className="text-2xl font-black text-cyan-300 font-mono tracking-tight">{freeOrdersCount} <span className="text-xs text-cyan-400 font-bold">Leads</span></p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                            <span>Free Tools Conversion</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500/10 via-surface/90 to-surface border border-purple-500/40 rounded-2xl p-4 space-y-1.5 shadow-xl group hover:border-purple-400 transition-all">
                          <div className="flex items-center justify-between text-purple-400">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Active License Keys</span>
                            <FaKey className="text-purple-400 text-sm" />
                          </div>
                          <p className="text-2xl font-black text-purple-300 font-mono tracking-tight">{activeLicenses} <span className="text-xs text-purple-400 font-bold">Keys</span></p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                            <span>{plans.length} Active Plans</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500/10 via-surface/90 to-surface border border-blue-500/40 rounded-2xl p-4 space-y-1.5 shadow-xl col-span-2 lg:col-span-1 group hover:border-blue-400 transition-all">
                          <div className="flex items-center justify-between text-blue-400">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-wider">Funnel Conversion</span>
                            <FaChartLine className="text-blue-400 text-sm" />
                          </div>
                          <p className="text-2xl font-black text-blue-300 font-mono tracking-tight">{conversionRate}%</p>
                          <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                            <span>Paid vs Free Audience</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Daily Revenue & Order Volume Chart Section */}
                      <div className="bg-surface/95 border border-border/80 rounded-3xl p-6 shadow-2xl space-y-6">
                        {(() => {
                          const fullMonths = [
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                          ];
                          const selectedMonthName = fullMonths[analyticsMonth];
                          const currentYear = new Date().getFullYear();
                          const daysInMonth = new Date(currentYear, analyticsMonth + 1, 0).getDate();
                          const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                          const dailyStats = daysArray.map((dayNum) => {
                            const dayOrders = orders.filter((o) => {
                              if (!o.createdAt) return false;
                              const d = new Date(o.createdAt);
                              return d.getMonth() === analyticsMonth && d.getDate() === dayNum;
                            });

                            const approvedDayOrders = dayOrders.filter((o) => o.status === "approved");
                            const paidCount = approvedDayOrders.filter((o) => (o.productPrice || 0) > 0 || o.pricingType === "paid").length;
                            const freeCount = dayOrders.filter((o) => (o.productPrice || 0) === 0 || o.pricingType === "free").length;
                            const revenue = approvedDayOrders.reduce((sum, o) => sum + (o.productPrice || 0), 0);

                            return { dayNum, revenue, paidCount, freeCount, totalOrders: dayOrders.length };
                          });

                          const totalMonthRevenue = dailyStats.reduce((sum, s) => sum + s.revenue, 0);
                          const totalMonthPaid = dailyStats.reduce((sum, s) => sum + s.paidCount, 0);
                          const totalMonthFree = dailyStats.reduce((sum, s) => sum + s.freeCount, 0);
                          const maxDailyRevenue = Math.max(...dailyStats.map((s) => s.revenue), 500);
                          const activeDaysWithSales = dailyStats.filter((s) => s.revenue > 0 || s.paidCount > 0).length;

                          return (
                            <div className="space-y-6">
                              {/* Chart Header Toolbar */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                    <h3 className="text-base font-black text-secondary">
                                      Daily Revenue & Order Volume Breakdown
                                    </h3>
                                  </div>
                                  <p className="text-[11px] text-text-muted font-mono mt-0.5">
                                    {selectedMonthName} {currentYear} • Daily tracking of gross revenue (EGP), paid sales, and free leads
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="flex items-center gap-2 bg-background border border-primary/50 px-3 py-1.5 rounded-2xl shadow-md">
                                    <FaCalendarAlt className="text-primary text-xs" />
                                    <span className="text-[10px] font-mono font-bold text-text-muted uppercase">Month:</span>
                                    <select
                                      value={analyticsMonth}
                                      onChange={(e) => setAnalyticsMonth(Number(e.target.value))}
                                      className="bg-transparent text-secondary font-mono font-bold text-xs focus:outline-none cursor-pointer"
                                    >
                                      {fullMonths.map((m, idx) => (
                                        <option key={m} value={idx} className="bg-zinc-900 text-white font-mono">
                                          {m} {idx === new Date().getMonth() ? "(Current)" : ""}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-2 bg-primary/10 border border-primary/40 px-3 py-1.5 rounded-2xl text-xs font-mono font-black text-primary shadow-lg">
                                    <span>Month Total:</span>
                                    <span>{totalMonthRevenue.toLocaleString()} EGP</span>
                                  </div>
                                </div>
                              </div>

                              {/* Daily Bar Chart */}
                              <div className="pt-4 pb-2">
                                <div className="h-56 flex items-end justify-between gap-1 sm:gap-1.5 px-1 border-b border-border/60 pb-2 overflow-x-auto">
                                  {dailyStats.map((stat) => {
                                    const heightPct = stat.revenue > 0 ? Math.max(18, Math.round((stat.revenue / maxDailyRevenue) * 100)) : 8;

                                    return (
                                      <div key={stat.dayNum} className="flex-1 min-w-[20px] flex flex-col items-center gap-1.5 group relative">
                                        {/* Rich Hover Card Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-2 absolute -top-28 bg-zinc-950 border border-primary/50 p-3 rounded-2xl shadow-2xl pointer-events-none whitespace-nowrap z-40 space-y-1 font-mono text-[10px]">
                                          <div className="font-black text-amber-400 text-xs border-b border-border/50 pb-1 flex items-center justify-between gap-4">
                                            <span>{selectedMonthName} {stat.dayNum}, {currentYear}</span>
                                            <span className="text-[9px] bg-primary/20 px-1.5 py-0.5 rounded text-primary">Day {stat.dayNum}</span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4 text-primary font-bold pt-1">
                                            <span>Daily Revenue:</span>
                                            <span>{stat.revenue.toLocaleString()} EGP</span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                                            <span>Paid Orders:</span>
                                            <span>{stat.paidCount} Units</span>
                                          </div>
                                          <div className="flex items-center justify-between gap-4 text-cyan-400">
                                            <span>Free Tool Leads:</span>
                                            <span>{stat.freeCount} Leads</span>
                                          </div>
                                        </div>

                                        {/* Dynamic Bar */}
                                        <div className="w-full bg-background/90 rounded-t-xl overflow-hidden h-full flex items-end p-0.5 border border-border/40 group-hover:border-primary transition-colors">
                                          <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPct}%` }}
                                            transition={{ duration: 0.5, delay: (stat.dayNum % 10) * 0.02 }}
                                            className={`w-full rounded-t-md transition-all ${stat.revenue > 0
                                                ? "bg-gradient-to-t from-amber-600 via-primary to-amber-300 shadow-md shadow-amber-500/20"
                                                : stat.freeCount > 0
                                                  ? "bg-gradient-to-t from-cyan-900 to-cyan-500/60"
                                                  : "bg-surface/50"
                                              }`}
                                          />
                                        </div>

                                        <span className="text-[10px] font-mono font-bold text-text-muted group-hover:text-primary transition-colors">
                                          {stat.dayNum}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Month Executive Summary Pill Bar */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                <div className="bg-background/80 border border-border/60 p-3 rounded-2xl flex items-center justify-between">
                                  <span className="text-[11px] font-mono text-text-muted font-bold">Month Paid Orders:</span>
                                  <span className="text-sm font-black font-mono text-emerald-400">{totalMonthPaid} Paid Orders</span>
                                </div>
                                <div className="bg-background/80 border border-border/60 p-3 rounded-2xl flex items-center justify-between">
                                  <span className="text-[11px] font-mono text-text-muted font-bold">Month Free Leads:</span>
                                  <span className="text-sm font-black font-mono text-cyan-400">{totalMonthFree} Free Claims</span>
                                </div>
                                <div className="bg-background/80 border border-border/60 p-3 rounded-2xl flex items-center justify-between">
                                  <span className="text-[11px] font-mono text-text-muted font-bold">Active Sales Days:</span>
                                  <span className="text-sm font-black font-mono text-amber-400">{activeDaysWithSales} / {daysInMonth} Days</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* 2-Column Deep Dive Analysis Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Product Leaderboard */}
                        <div className="bg-surface/90 border border-border/80 rounded-3xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                                <FaCrown className="text-amber-400 text-xs" />
                                Top Revenue Generating Products
                              </h3>
                              <p className="text-[10px] font-mono text-text-muted">Ranked by overall gross sales volume</p>
                            </div>
                            <span className="text-[10px] font-mono bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-xl font-bold">
                              Catalog Leaderboard
                            </span>
                          </div>

                          <div className="space-y-4 pt-1">
                            {products.slice(0, 4).map((p, idx) => {
                              const prodOrders = orders.filter((o) => o.productId === p.id && o.status === "approved");
                              const prodRevenue = prodOrders.reduce((sum, o) => sum + (o.productPrice || 0), 0);
                              const totalRev = orders.filter((o) => o.status === "approved").reduce((sum, o) => sum + (o.productPrice || 0), 1);
                              const pct = Math.min(100, Math.max(12, Math.round((prodRevenue / totalRev) * 100)));

                              return (
                                <div key={p.id} className="space-y-2 bg-background/60 p-3 rounded-2xl border border-border/40 hover:border-primary/40 transition-colors">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-secondary flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] flex items-center justify-center font-mono font-black">
                                        #{idx + 1}
                                      </span>
                                      {p.title}
                                    </span>
                                    <span className="font-mono font-black text-amber-400">{prodRevenue.toLocaleString()} EGP</span>
                                  </div>
                                  <div className="w-full bg-surface border border-border/60 h-2.5 rounded-full overflow-hidden p-0.5">
                                    <div className="bg-gradient-to-r from-amber-600 via-primary to-amber-300 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Customer Acquisition & CRM Conversion Funnel */}
                        <div className="bg-surface/90 border border-border/80 rounded-3xl p-6 shadow-xl space-y-4">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3">
                            <div>
                              <h3 className="text-sm font-black text-secondary flex items-center gap-2">
                                <FaUsers className="text-emerald-400 text-xs" />
                                Customer Conversion & CRM Funnel
                              </h3>
                              <p className="text-[10px] font-mono text-text-muted">Monitored pipeline from free download leads to paid software licenses</p>
                            </div>
                            <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-xl font-bold">
                              Conversion Intelligence
                            </span>
                          </div>

                          {(() => {
                            const uniqueEmails = Array.from(new Set(orders.map((o) => o.customerEmail?.toLowerCase().trim()).filter(Boolean)));
                            const paidEmails = new Set(orders.filter((o) => o.pricingType === "paid" || (o.productPrice || 0) > 0).map((o) => o.customerEmail?.toLowerCase().trim()));
                            const freeOnlyEmails = uniqueEmails.filter((e) => !paidEmails.has(e));
                            const convRate = uniqueEmails.length > 0 ? Math.round((paidEmails.size / uniqueEmails.length) * 100) : 0;

                            return (
                              <div className="space-y-4 pt-1">
                                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
                                  <div>
                                    <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Overall Customer Lead Conversion</div>
                                    <div className="text-3xl font-black font-mono text-emerald-300 mt-0.5">{convRate}%</div>
                                  </div>
                                  <div className="text-right font-mono">
                                    <div className="text-xs font-bold text-emerald-400">{paidEmails.size} Paid Buyers</div>
                                    <div className="text-[10px] text-text-muted">out of {uniqueEmails.length} Total Clients</div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center">
                                  <div className="bg-background/80 border border-border/60 p-3 rounded-2xl space-y-1">
                                    <div className="text-[10px] font-mono text-text-muted uppercase">Paid Segment</div>
                                    <div className="text-base font-black font-mono text-amber-400">{paidEmails.size}</div>
                                  </div>
                                  <div className="bg-background/80 border border-border/60 p-3 rounded-2xl space-y-1">
                                    <div className="text-[10px] font-mono text-text-muted uppercase">Free Leads</div>
                                    <div className="text-base font-black font-mono text-cyan-400">{freeOnlyEmails.length}</div>
                                  </div>
                                  <div className="bg-background/80 border border-border/60 p-3 rounded-2xl space-y-1">
                                    <div className="text-[10px] font-mono text-text-muted uppercase">Total Database</div>
                                    <div className="text-base font-black font-mono text-purple-400">{uniqueEmails.length}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: DISCOUNT COUPONS SYSTEM                           */}
            {/* ========================================================= */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-secondary">Discount Coupon Management</h2>
                    <p className="text-xs text-text-muted mt-0.5">Manage active promotional vouchers, store-wide discounts, and product coupons.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-surface/90 border border-border/80 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary font-mono font-black text-sm rounded-lg uppercase">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleToggleCoupon(coupon.id)}
                          className={`text-lg transition-colors ${coupon.isActive ? "text-emerald-400" : "text-text-muted"}`}
                          title={coupon.isActive ? "Active (Click to disable)" : "Inactive (Click to enable)"}
                        >
                          {coupon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>

                      <div className="space-y-1.5 text-xs text-text-secondary">
                        <p>Type: <strong className="text-secondary uppercase">{coupon.discountType}</strong></p>
                        <p>Discount: <strong className="text-primary font-mono text-sm font-black">{coupon.discountValue}{coupon.discountType === "percentage" ? "%" : " EGP"} OFF</strong></p>
                        <p>Scope: <strong className="text-secondary font-mono">{!coupon.applicableProductId || coupon.applicableProductId === "all" ? " All Products (Store-Wide)" : ` ${products.find((p) => p.id === coupon.applicableProductId)?.title || coupon.applicableProductId}`}</strong></p>
                        {coupon.minOrderAmount ? <p>Min Order: <strong className="text-secondary font-mono">{coupon.minOrderAmount} EGP</strong></p> : null}
                        <p>Used Count: <strong className="text-secondary font-mono">{coupon.usedCount} {coupon.maxUses ? `/ ${coupon.maxUses}` : ""} times</strong></p>
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                        <button
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setCouponCodeInput(coupon.code);
                            setCouponTypeInput(coupon.discountType);
                            setCouponValueInput(coupon.discountValue);
                            setCouponMinOrderInput(coupon.minOrderAmount || 0);
                            setCouponMaxUsesInput(coupon.maxUses || 0);
                            setCouponTargetProductInput(coupon.applicableProductId || "all");
                            setShowAddCouponModal(true);
                          }}
                          className="text-primary hover:underline font-bold flex items-center gap-1"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: SETTINGS MANAGEMENT                                */}
            {/* ========================================================= */}
            {(activeTab === "settings" || activeTab === "audit") && (
              <div className="max-w-xl mx-auto bg-surface/90 border border-border/80 rounded-3xl p-8 shadow-xl backdrop-blur-xl">
                <h2 className="text-xl font-bold text-secondary mb-6 pb-3 border-b border-border/60">
                  Payment Accounts & Admin Credentials
                </h2>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">InstaPay Transfer URL</label>
                    <input
                      type="text"
                      required
                      value={instapayLink}
                      onChange={(e) => setInstapayLink(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-sm text-secondary focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Mobile Wallet Number (Vodafone Cash / Orange)</label>
                    <input
                      type="text"
                      required
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-sm text-secondary focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">Official Bank USD Exchange Rate (EGP per 1 USD) *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={usdExchangeRate}
                      onChange={(e) => setUsdExchangeRate(Number(e.target.value))}
                      className="w-full bg-background border border-amber-500/40 rounded-xl px-4 py-3 text-sm text-secondary focus:border-amber-400 outline-none font-mono font-bold"
                    />
                    <p className="text-[10px] text-text-muted mt-1 font-mono">Auto-converts prices between USD and EGP in modals and checkout.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Change Admin PIN Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="New password..."
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-sm text-secondary focus:border-primary outline-none font-mono"
                    />
                  </div>

                  {/* Store Hero Banner Control Section */}
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
                        <span>Store Announcement Banner</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setHeroBannerEnabled(!heroBannerEnabled)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono transition-all ${heroBannerEnabled
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-surface text-text-muted border border-border"
                          }`}
                      >
                        {heroBannerEnabled ? <FaToggleOn className="text-base text-emerald-400" /> : <FaToggleOff className="text-base" />}
                        <span>{heroBannerEnabled ? "Active (Visible)" : "Disabled"}</span>
                      </button>
                    </div>

                    {/* Smart Coupon-Linked Banner Generator */}
                    <div className="bg-background/60 border border-border/80 p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center gap-1.5">
                          {/* <FaTag className="text-xs" /> */}
                          <span>Pick Active Coupon to Auto-Fill Banner</span>
                        </label>
                        <span className="text-[10px] text-text-muted font-mono">Live Coupons Sync</span>
                      </div>

                      <select
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (!selectedId) return;
                          const c = coupons.find((item) => item.id === selectedId);
                          if (c) {
                            const discountStr = c.discountType === "percentage" ? `${c.discountValue}% OFF` : `${c.discountValue} EGP OFF`;
                            let scopeStr = "all digital tools & plugins";
                            if (c.applicableProductId && c.applicableProductId !== "all") {
                              const targetProd = products.find((p) => p.id === c.applicableProductId);
                              if (targetProd) {
                                scopeStr = targetProd.title;
                              }
                            }
                            const generated = `Special Offer: Get ${discountStr} on ${scopeStr} with code ${c.code}!`;
                            setHeroBannerText(generated);
                            showToast(`Banner text generated for coupon ${c.code}!`, "success");
                          }
                        }}
                        className="w-full bg-surface border border-primary/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-secondary focus:border-primary outline-none cursor-pointer"
                      >
                        <option value="">-- Select a Coupon from Database to Auto-Generate Text --</option>
                        {coupons.map((c) => {
                          const discountStr = c.discountType === "percentage" ? `${c.discountValue}% OFF` : `${c.discountValue} EGP OFF`;
                          let scopeStr = "All Products";
                          if (c.applicableProductId && c.applicableProductId !== "all") {
                            const targetProd = products.find((p) => p.id === c.applicableProductId);
                            if (targetProd) scopeStr = targetProd.title;
                          }
                          return (
                            <option key={c.id} value={c.id} className="bg-zinc-900 text-white font-mono">
                              Code: {c.code} ({discountStr} - {scopeStr})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">Hero Announcement Banner Text (Customizable)</label>
                      <input
                        type="text"
                        value={heroBannerText}
                        onChange={(e) => setHeroBannerText(e.target.value)}
                        placeholder="Announcement message..."
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-xs text-secondary focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Meta Pixel (Facebook Pixel) Integration Section */}
                  <div className="pt-4 border-t border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-secondary flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">🎯</span>
                        <span>Meta Pixel (Facebook Pixel) Integration</span>
                      </label>
                      {metaPixelId ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active Tracking
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-zinc-800 text-text-muted border border-border">
                          Not Configured
                        </span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary mb-1">
                        Meta Pixel ID (Dataset ID)
                      </label>
                      <input
                        type="text"
                        value={metaPixelId}
                        onChange={(e) => setMetaPixelId(e.target.value)}
                        placeholder="e.g. 123456789012345"
                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-xs text-secondary focus:border-blue-500 outline-none font-mono"
                      />
                      <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed">
                        Enter your Meta Pixel ID here. It automatically initializes site-wide across all portfolio and store pages, tracking PageViews, Product Views, Checkout & Purchase conversions instantly.
                      </p>
                    </div>
                  </div>

                  {/* Spotlight Product Selector Section */}
                  {/* <div className="pt-4 border-t border-border/60 space-y-2">
              <label className="block text-xs font-bold text-secondary">Spotlight Tool of the Month</label>
              <select
                value={activeSpotlightId}
                onChange={(e) => setActiveSpotlightId(e.target.value)}
                className="w-full bg-background border border-border/80 rounded-xl px-4 py-3 text-xs text-secondary focus:border-primary outline-none font-mono"
              >
                <option value="">-- No Spotlight Tool Selected --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    ⭐ {p.title} ({p.category})
                  </option>
                ))}
              </select>
            </div> */}

                  {settingsSuccess && <p className="text-emerald-400 text-xs font-bold text-center">{settingsSuccess}</p>}
                  {settingsError && <p className="text-red-400 text-xs font-bold text-center">{settingsError}</p>}

                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full py-3.5 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary-dark shadow-lg transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingSettings ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Saving Settings...</span>
                      </>
                    ) : (
                      <span>Save Settings</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: AUDIT LOGS ACTIVITY STREAM                         */}
            {/* ========================================================= */}
            {activeTab === "audit" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-secondary">System Audit Activity Stream</h2>
                    <p className="text-xs text-text-muted mt-1">Real-time log of administrative actions, order approvals, product updates & store configuration changes.</p>
                  </div>
                  <button
                    onClick={() => {
                      setAuditLogs([]);
                      showToast("Audit logs cleared for current session.", "info");
                    }}
                    className="px-3.5 py-1.5 rounded-xl border border-border/80 text-xs font-bold text-text-muted hover:text-red-400 transition-colors"
                  >
                    Clear Stream
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.length === 0 ? (
                    <div className="text-center py-16 bg-surface/50 border border-border/60 rounded-3xl text-text-muted text-xs font-mono">
                      No activity logs recorded yet.
                    </div>
                  ) : (
                    auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-surface/80 border border-border/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono uppercase ${log.type === "order"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : log.type === "product"
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : log.type === "coupon"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                              }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-secondary font-medium">{log.details}</span>
                        </div>

                        <span className="text-[11px] font-mono text-text-muted shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 8: LICENSES & KEYS MANAGEMENT                        */}
            {/* ========================================================= */}
            {activeTab === "licenses" && (
              <div className="space-y-6">
                {/* Stats Summary Strip */}
                {(() => {
                  const activeCount = licenses.filter((l) => l.status === "active").length;
                  const trialCount = licenses.filter((l) => l.planId.includes("trial")).length;
                  const expiredCount = licenses.filter((l) => l.status === "expired").length;

                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-text-muted">Total Licenses</p>
                          <p className="text-xl font-black text-secondary mt-1">{licenses.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                          <FaKey className="text-lg" />
                        </div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-text-muted">Active Keys</p>
                          <p className="text-xl font-black text-emerald-400 mt-1">{activeCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <FaCheckCircle className="text-lg" />
                        </div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-text-muted">Free Trials Issued</p>
                          <p className="text-xl font-black text-blue-400 mt-1">{trialCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                          <FaClock className="text-lg" />
                        </div>
                      </div>

                      <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-mono font-bold text-text-muted">Expired / Suspended</p>
                          <p className="text-xl font-black text-red-400 mt-1">{expiredCount}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                          <FaBan className="text-lg" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Filter & Search Bar */}
                <div className="bg-surface/80 border border-border/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                    <input
                      type="text"
                      placeholder="Search email, last4..."
                      value={licenseSearch}
                      onChange={(e) => setLicenseSearch(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl pl-9 pr-3 py-2 text-xs text-secondary outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={licenseStatusFilter}
                      onChange={(e) => setLicenseStatusFilter(e.target.value)}
                      className="bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none focus:border-amber-400"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="suspended">Suspended</option>
                      <option value="revoked">Revoked</option>
                    </select>

                    <select
                      value={licenseProductFilter}
                      onChange={(e) => setLicenseProductFilter(e.target.value)}
                      className="bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none focus:border-amber-400"
                    >
                      <option value="all">All Paid Products</option>
                      {products
                        .filter((p) => p.pricingType === "paid" || p.priceEgp > 0)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() => {
                        setManualUserEmail("");
                        const paidProds = products.filter((p) => p.pricingType === "paid" || p.priceEgp > 0);
                        if (paidProds.length > 0) setManualProductId(paidProds[0].id);
                        setShowManualLicenseModal(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-amber-400/20"
                    >
                      <FaPlus className="text-xs" />
                      <span>Issue Key</span>
                    </button>
                  </div>
                </div>

                {/* Licenses Table */}
                {(() => {
                  const filtered = licenses.filter((lic) => {
                    const search = licenseSearch.toLowerCase().trim();
                    const matchesSearch =
                      !search ||
                      lic.userEmail.toLowerCase().includes(search) ||
                      lic.licenseKeyLast4.toLowerCase().includes(search) ||
                      lic.id.toLowerCase().includes(search);

                    const matchesStatus = licenseStatusFilter === "all" || lic.status === licenseStatusFilter;
                    const matchesProduct = licenseProductFilter === "all" || lic.productId === licenseProductFilter;

                    return matchesSearch && matchesStatus && matchesProduct;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 bg-surface/50 border border-border/60 rounded-3xl space-y-3">
                        <FaKey className="text-3xl text-amber-400/50 mx-auto" />
                        <p className="text-secondary font-bold text-sm">No licenses found matching criteria.</p>
                        <button
                          onClick={() => {
                            setManualUserEmail("");
                            const paidProds = products.filter((p) => p.pricingType === "paid" || p.priceEgp > 0);
                            if (paidProds.length > 0) setManualProductId(paidProds[0].id);
                            setShowManualLicenseModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
                        >
                          Issue First License
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-border/80 rounded-2xl bg-surface/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-background/80 border-b border-border/80 text-text-muted font-mono uppercase text-[10px]">
                          <tr>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Customer Email</th>
                            <th className="p-3.5">Product & Plan</th>
                            <th className="p-3.5">License Engine Key</th>
                            <th className="p-3.5">Bound Devices</th>
                            <th className="p-3.5">Expires At</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {filtered.map((lic, licIdx) => {
                            const prod = products.find((p) => p.id === lic.productId);
                            const planObj = plans.find((p) => p.id === lic.planId);
                            const planNameDisplay = planObj
                              ? planObj.name
                              : lic.planId === "direct"
                                ? "Lifetime Direct"
                                : lic.planId?.startsWith("plan_") || lic.planId?.toLowerCase().includes("trial")
                                  ? "3-Day Free Trial"
                                  : lic.planId || "Standard License";
                            const isExpired = lic.expiresAt ? new Date(lic.expiresAt).getTime() < new Date().getTime() : false;
                            const activeBindings = licenseDevices.filter((b) => b.licenseId === lic.id && b.status === "active");
                            const activeDeviceCount = activeBindings.length;
                            const isUnmasked = unmaskedKeys[lic.id];
                            const displayKey = isUnmasked
                              ? lic.rawLicenseKey || `RAW-${lic.licenseKeyHash?.slice(0, 16).toUpperCase() || "KEY"}`
                              : `••••-••••-••••-${lic.licenseKeyLast4 || "0000"}`;

                            const isPending = lic.status === "pending" || !lic.activatedAt;

                            return (
                              <tr key={lic.id || `lic_${licIdx}_${lic.licenseKeyLast4 || licIdx}`} className="hover:bg-surface-hover/50 transition-colors">
                                <td className="p-3.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${isPending
                                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                      : lic.status === "active" && !isExpired
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : lic.status === "suspended"
                                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                                      }`}
                                  >
                                    {isPending ? "pending activation" : isExpired && lic.status === "active" ? "expired" : lic.status}
                                  </span>
                                </td>
                                <td className="p-3.5 font-medium text-secondary">{lic.userEmail}</td>
                                <td className="p-3.5 font-mono text-[11px]">
                                  <div className="font-bold text-secondary">{prod ? prod.title : lic.productId}</div>
                                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                                    {planNameDisplay}
                                  </span>
                                </td>
                                <td className="p-3.5 font-mono text-xs">
                                  <div className="flex items-center gap-2 bg-background/80 px-2.5 py-1 rounded-xl border border-border/60 w-fit">
                                    <span className={`font-bold ${isUnmasked ? "text-emerald-400" : "text-amber-300"}`}>{displayKey}</span>
                                    <button
                                      onClick={() => setUnmaskedKeys((prev) => ({ ...prev, [lic.id]: !prev[lic.id] }))}
                                      className="text-text-muted hover:text-white transition-colors text-[11px]"
                                      title={isUnmasked ? "Mask Key" : "Reveal Unmasked Key"}
                                    >
                                      {isUnmasked ? "🙈" : "👁️"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const keyToCopy = lic.rawLicenseKey || displayKey;
                                        copyToClipboard(keyToCopy, "License Key");
                                      }}
                                      className="text-text-muted hover:text-amber-400 transition-colors text-[11px]"
                                      title="Copy Key"
                                    >

                                    </button>
                                  </div>
                                </td>
                                <td className="p-3.5 font-mono">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setDeviceInspectorModal({ isOpen: true, license: lic })}
                                      className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                                      title="Click to view detailed device activity & hardware info"
                                    >
                                      <span>{activeDeviceCount} / {lic.maxDevices} Device(s)</span>
                                      <span className="text-[10px]">🔍</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setNewMaxDevicesInput(lic.maxDevices);
                                        setEditMaxDevicesModal({ isOpen: true, licenseId: lic.id, userEmail: lic.userEmail, currentMax: lic.maxDevices });
                                      }}
                                      className="p-1 rounded-lg text-text-muted hover:text-amber-400 transition-colors text-[11px]"
                                      title="Edit Device Limit"
                                    >
                                      ✏️
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3.5 font-mono text-[11px]">
                                  {isPending || !lic.expiresAt ? (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-cyan-400/90 font-medium">
                                        Starts on 1st Activation ({lic.durationValue || lic.durationDays || 30} {lic.durationUnit || "days"})
                                      </span>
                                      <button
                                        onClick={() => openDurationModal(lic)}
                                        className="p-1 rounded-lg text-text-muted hover:text-cyan-300 transition-colors text-xs"
                                        title="Edit License Duration"
                                      >
                                        ✏️
                                      </button>
                                    </div>
                                  ) : (() => {
                                    const rem = formatRemainingTime(lic.expiresAt, nowTime);
                                    return (
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                          <div className={`font-bold flex items-center gap-1.5 ${rem.isExpired ? "text-red-400" : rem.urgent ? "text-amber-400 font-black animate-pulse" : "text-emerald-400"}`}>
                                            <span>{rem.isExpired ? "🚨" : "⏱️"}</span>
                                            <span>{rem.text}</span>
                                          </div>
                                          <button
                                            onClick={() => openDurationModal(lic)}
                                            className="p-1 rounded-lg text-text-muted hover:text-amber-300 transition-colors text-xs"
                                            title="Edit Expiration & Duration"
                                          >
                                            ✏️
                                          </button>
                                        </div>
                                        <div className="text-[10px] text-text-muted">
                                          Ends: {new Date(lic.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(lic.expiresAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="p-3.5 text-right space-x-1.5 shrink-0">
                                  <button
                                    onClick={() => openDurationModal(lic)}
                                    className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold"
                                    title="Edit Custom Duration (Days/Hours/Minutes)"
                                  >
                                    ⏱️ Edit Time
                                  </button>

                                  <button
                                    onClick={async () => {
                                      const res = await fetch("/api/store/licenses", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          adminPassword: password,
                                          action: "extend_license",
                                          licenseId: lic.id,
                                          additionalDays: 30,
                                        }),
                                      });
                                      if (res.ok) {
                                        showToast(`Extended license for ${lic.userEmail} by 30 days!`, "success");
                                        loadLicensePlatformData();
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold"
                                    title="Extend +30 Days"
                                  >
                                    +30D
                                  </button>

                                  <button
                                    onClick={() => {
                                      askConfirmation({
                                        title: "Reset Device Bindings",
                                        message: `Are you sure you want to unbind all active devices for key (${lic.userEmail})?`,
                                        confirmText: "Reset Bindings",
                                        variant: "warning",
                                        onConfirm: async () => {
                                          const res = await fetch("/api/store/licenses", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              adminPassword: password,
                                              action: "reset_devices",
                                              licenseId: lic.id,
                                            }),
                                          });
                                          if (res.ok) {
                                            showToast(`Reset bound devices for ${lic.userEmail}!`, "info");
                                            loadLicensePlatformData();
                                          }
                                        },
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-[10px] font-bold"
                                    title="Reset Device Bindings"
                                  >
                                    Reset Devs
                                  </button>

                                  <button
                                    onClick={async () => {
                                      const actionType = lic.status === "active" ? "revoke_license" : "reactivate_license";
                                      const res = await fetch("/api/store/licenses", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          adminPassword: password,
                                          action: actionType,
                                          licenseId: lic.id,
                                        }),
                                      });
                                      if (res.ok) {
                                        showToast(`Updated status for ${lic.userEmail}!`, "success");
                                        loadLicensePlatformData();
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${lic.status === "active"
                                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
                                      : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20"
                                      }`}
                                  >
                                    {lic.status === "active" ? "Revoke" : "Reactivate"}
                                  </button>

                                  <button
                                    onClick={() => {
                                      askConfirmation({
                                        title: "Delete License Key",
                                        message: `Are you sure you want to PERMANENTLY DELETE the key for ${lic.userEmail}? This cannot be undone.`,
                                        confirmText: "Delete Permanently",
                                        variant: "danger",
                                        onConfirm: async () => {
                                          const res = await fetch("/api/store/licenses", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                              adminPassword: password,
                                              action: "delete_license",
                                              licenseId: lic.id,
                                            }),
                                          });
                                          if (res.ok) {
                                            showToast(`Deleted license key for ${lic.userEmail}!`, "info");
                                            loadLicensePlatformData();
                                          }
                                        },
                                      });
                                    }}
                                    className="px-2 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-[10px] font-bold"
                                    title="Delete Permanently"
                                  >
                                    <FaTrash className="inline" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}


            {/* ========================================================= */}
            {/* TAB 10: PAYMENT APPROVAL QUEUE                           */}
            {/* ========================================================= */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                {(() => {
                  const pending = licensePayments.filter((p) => p.status === "pending");

                  if (licensePayments.length === 0) {
                    return (
                      <div className="text-center py-16 bg-surface/50 border border-border/60 rounded-3xl space-y-3">
                        <FaCreditCard className="text-3xl text-emerald-400/50 mx-auto" />
                        <p className="text-secondary font-bold text-sm">No payment approval requests in queue.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto border border-border/80 rounded-2xl bg-surface/60">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-background/80 border-b border-border/80 text-text-muted font-mono uppercase text-[10px]">
                          <tr>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5">Customer Email</th>
                            <th className="p-3.5">Product & Plan</th>
                            <th className="p-3.5">Amount</th>
                            <th className="p-3.5">Provider</th>
                            <th className="p-3.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {licensePayments.map((pay) => {
                            const prod = products.find((p) => p.id === pay.productId);
                            const planObj = plans.find((p) => p.id === pay.planId);
                            const planNameDisplay = planObj
                              ? planObj.name
                              : pay.planId === "direct"
                                ? "Lifetime Direct"
                                : pay.planId?.startsWith("plan_") || pay.planId?.toLowerCase().includes("trial")
                                  ? "3-Day Free Trial"
                                  : pay.planId || "Standard Plan";

                            return (
                              <tr key={pay.id} className="hover:bg-surface-hover/50 transition-colors">
                                <td className="p-3.5">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${pay.status === "approved" || pay.status === "paid"
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : pay.status === "pending"
                                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                                      }`}
                                  >
                                    {pay.status}
                                  </span>
                                </td>
                                <td className="p-3.5 font-medium text-secondary">{pay.customerEmail}</td>
                                <td className="p-3.5 font-mono text-[11px]">
                                  <div className="font-bold text-secondary">{prod ? prod.title : pay.productId}</div>
                                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                                    {planNameDisplay}
                                  </span>
                                </td>
                                <td className="p-3.5 font-mono font-bold text-emerald-400">
                                  {pay.amount} {pay.currency}
                                </td>
                                <td className="p-3.5 font-mono uppercase text-text-muted">{pay.provider}</td>
                                <td className="p-3.5 text-right">
                                  {pay.status === "pending" && (
                                    <button
                                      onClick={async () => {
                                        const res = await fetch("/api/store/licenses", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            adminPassword: password,
                                            action: "approve_payment",
                                            paymentId: pay.id,
                                          }),
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                          setIssuedRawKeyModal({
                                            rawKey: data.rawLicenseKey,
                                            email: pay.customerEmail,
                                            expiresAt: data.license?.expiresAt || "",
                                          });
                                          loadLicensePlatformData();
                                        } else {
                                          showToast(data.error || "Approval failed.", "error");
                                        }
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 shadow-md"
                                    >
                                      Approve & Issue Key
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </main>

      </div>

      {/* Lightbox Image Preview Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-surface border border-border/80 rounded-3xl p-6 flex flex-col items-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full mb-4">
                <h3 className="text-sm font-bold text-secondary">{lightboxImage.title}</h3>
                <div className="flex items-center gap-2">
                  <a
                    href={lightboxImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary-dark transition-all flex items-center gap-1.5"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    <span>Open Original</span>
                  </a>
                  <button
                    onClick={() => setLightboxImage(null)}
                    className="p-2 rounded-xl text-text-muted hover:text-white bg-surface border border-border"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxImage.url} alt="Proof Lightbox" className="max-h-[75vh] object-contain rounded-2xl border border-border/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screenshot Viewer Modal */}
      <AnimatePresence>
        {viewScreenshotUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setViewScreenshotUrl(null)}
          >
            <div className="relative max-w-2xl w-full bg-surface border border-border rounded-3xl p-4 flex flex-col items-center">
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full"
              >
                <FaTimes />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewScreenshotUrl} alt="Payment Proof" className="max-h-[80vh] object-contain rounded-xl" />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Website Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface/95 border border-primary/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3.5 rounded-2xl ${confirmModal.variant === "danger"
                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                >
                  <FaExclamationTriangle className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-secondary">{confirmModal.title}</h3>
                  <p className="text-[11px] font-mono text-text-muted mt-0.5">Confirmation Required</p>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed bg-background/60 p-4 rounded-2xl border border-border/50 font-mono">
                {confirmModal.message}
              </p>

              <div className="flex items-center gap-3 pt-2 justify-end">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-border/80 text-xs font-bold text-text-secondary hover:text-white transition-all"
                >
                  {confirmModal.cancelText || "Cancel"}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${confirmModal.variant === "danger"
                    ? "bg-red-600 hover:bg-red-500 text-white shadow-red-900/30"
                    : "bg-primary text-black hover:bg-primary-dark shadow-amber-900/30"
                    }`}
                >
                  {confirmModal.confirmText || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit License Duration & Expiration Modal */}
      <AnimatePresence>
        {editDurationModal.isOpen && editDurationModal.license && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setEditDurationModal({ isOpen: false, license: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface/95 border border-primary/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 text-left my-auto relative"
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <FaClock className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-secondary">Edit License Duration</h3>
                    <p className="text-[11px] font-mono text-text-muted">{editDurationModal.license.userEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditDurationModal({ isOpen: false, license: null })}
                  className="w-8 h-8 rounded-full bg-background border border-border/80 text-text-muted hover:text-white flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Current Status Info */}
              <div className="bg-background/80 border border-border/60 rounded-2xl p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">License Key:</span>
                  <span className="font-bold text-amber-300">...{editDurationModal.license.licenseKeyLast4 || "KEY"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Current Status:</span>
                  <span className={`font-bold uppercase ${editDurationModal.license.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                    {editDurationModal.license.status}
                  </span>
                </div>
                {editDurationModal.license.expiresAt ? (
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Current Expiration:</span>
                    <span className="font-bold text-secondary">
                      {new Date(editDurationModal.license.expiresAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Configured Duration:</span>
                    <span className="font-bold text-cyan-400">
                      {editDurationModal.license.durationValue || 30} {editDurationModal.license.durationUnit || "days"}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2">Quick Duration Presets</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { label: "1 Hour", val: 1, unit: "hours" },
                    { label: "6 Hours", val: 6, unit: "hours" },
                    { label: "1 Day", val: 1, unit: "days" },
                    { label: "7 Days", val: 7, unit: "days" },
                    { label: "30 Days", val: 30, unit: "days" },
                    { label: "1 Year", val: 365, unit: "days" },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEditDurValue(preset.val);
                        setEditDurUnit(preset.unit);
                      }}
                      className="px-2 py-1.5 bg-surface hover:bg-primary/20 border border-border/80 hover:border-primary/40 rounded-xl text-[10px] font-mono font-bold text-secondary hover:text-primary transition-all text-center"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Duration Input */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-text-secondary">Set Custom Duration Value & Unit</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-text-muted font-mono mb-1">Duration Amount</span>
                    <input
                      type="number"
                      min="1"
                      value={editDurValue}
                      onChange={(e) => setEditDurValue(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-secondary focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <span className="block text-[10px] text-text-muted font-mono mb-1">Time Unit</span>
                    <select
                      value={editDurUnit}
                      onChange={(e) => setEditDurUnit(e.target.value)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-secondary focus:border-primary outline-none"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                {editDurationModal.license.expiresAt && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="editDurSetFromNow"
                      checked={editDurSetFromNow}
                      onChange={(e) => setEditDurSetFromNow(e.target.checked)}
                      className="accent-primary rounded w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="editDurSetFromNow" className="text-xs text-text-secondary font-medium cursor-pointer">
                      Calculate duration from <strong>NOW</strong> (Reset countdown starting right now)
                    </label>
                  </div>
                )}
              </div>

              {/* Exact Target Date/Time Option */}
              <div className="space-y-2 pt-3 border-t border-border/40">
                <label className="block text-xs font-bold text-text-secondary">Or Pick Exact End Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={editDurExactDate}
                  onChange={(e) => setEditDurExactDate(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs font-mono text-secondary focus:border-primary outline-none"
                />
                {editDurExactDate && (
                  <button
                    type="button"
                    onClick={() => setEditDurExactDate("")}
                    className="text-[10px] text-red-400 underline font-mono cursor-pointer"
                  >
                    Clear exact date pick (use custom amount instead)
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditDurationModal({ isOpen: false, license: null })}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-border text-text-secondary hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={updatingDuration}
                  onClick={async () => {
                    setUpdatingDuration(true);
                    try {
                      const payload: any = {
                        adminPassword: password,
                        action: "update_license_duration",
                        licenseId: editDurationModal.license.id,
                      };

                      if (editDurExactDate) {
                        payload.exactExpiresAt = new Date(editDurExactDate).toISOString();
                      } else {
                        payload.durationValue = editDurValue;
                        payload.durationUnit = editDurUnit;
                        payload.setFromNow = editDurSetFromNow;
                      }

                      const res = await fetch("/api/store/licenses", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                      });

                      const data = await res.json();
                      if (data.success) {
                        showToast(`Successfully updated license duration!`, "success");
                        setEditDurationModal({ isOpen: false, license: null });
                        loadLicensePlatformData();
                      } else {
                        showToast(data.error || "Failed to update duration", "error");
                      }
                    } catch (err: any) {
                      showToast(err.message || "Failed to update duration", "error");
                    } finally {
                      setUpdatingDuration(false);
                    }
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {updatingDuration ? <FaSpinner className="animate-spin" /> : <FaClock />}
                  <span>Save Duration</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showAddCouponModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-secondary mb-4">
                {editingCoupon ? "Edit Discount Coupon Code" : "Create Discount Coupon Code"}
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OFF50"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-secondary focus:border-primary outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Target Product / Scope</label>
                  <select
                    value={couponTargetProductInput}
                    onChange={(e) => setCouponTargetProductInput(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-secondary outline-none"
                  >
                    <option value="all">All Products (Store-Wide)</option>
                    {products
                      .filter((p) => p.pricingType === "paid")
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Discount Type</label>
                    <select
                      value={couponTypeInput}
                      onChange={(e) => setCouponTypeInput(e.target.value as any)}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-secondary outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (EGP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={couponValueInput}
                      onChange={(e) => setCouponValueInput(Number(e.target.value))}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-secondary focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Min Order Amount (EGP)</label>
                    <input
                      type="number"
                      value={couponMinOrderInput}
                      onChange={(e) => setCouponMinOrderInput(Number(e.target.value))}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-secondary focus:border-primary outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Max Usage Limit</label>
                    <input
                      type="number"
                      value={couponMaxUsesInput}
                      onChange={(e) => setCouponMaxUsesInput(Number(e.target.value))}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-sm text-secondary focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddCouponModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-surface border border-border text-secondary"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingCoupon}
                    className="px-6 py-2 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary-dark flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingCoupon ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Saving Coupon...</span>
                      </>
                    ) : (
                      <span>{editingCoupon ? "Save Changes" : "Create Coupon"}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Add/Edit Modal - Full Width Studio Layout */}
      <AnimatePresence>
        {showAddProductModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-md">
            <div className="bg-surface/95 border border-primary/40 rounded-3xl p-6 sm:p-8 max-w-7xl w-full shadow-2xl my-auto relative overflow-hidden text-left max-h-[94vh] flex flex-col">

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-lg">
                    <FaBox />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-secondary">
                      {editingProduct ? "Edit Product Specifications" : "Add New Digital Product"}
                    </h3>
                    <p className="text-text-muted text-xs">Configure product metadata, pricing, direct discounts, and upload media assets.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="w-9 h-9 rounded-full bg-background border border-border/80 text-text-muted hover:text-white flex items-center justify-center transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Form Body - Wide Horizontal 2 Column Grid */}
              <form onSubmit={handleSaveProduct} className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Input Fields (Span 7) */}
                    <div className="lg:col-span-7 space-y-5">

                      {/* Basic Info */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                          1. Product Identity
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Product Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Gridora Photoshop Layout System"
                              value={prodTitle}
                              onChange={(e) => handleTitleChange(e.target.value)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary focus:border-primary outline-none"
                            />
                            {prodSlug && (
                              <p className="text-[10px] font-mono text-text-muted mt-1 flex items-center gap-1">
                                <span className="text-primary font-bold">Auto Slug:</span>
                                <span className="text-secondary font-mono bg-background/60 px-1.5 py-0.5 rounded border border-border/50">
                                  /store/{prodSlug}
                                </span>
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Subtitle</label>
                            <input
                              type="text"
                              placeholder="e.g. Layout & Composition Plugin"
                              value={prodSub}
                              onChange={(e) => setProdSub(e.target.value)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary focus:border-primary outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Category</label>
                            <select
                              value={prodCat}
                              onChange={(e) => setProdCat(e.target.value as any)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none focus:border-primary"
                            >
                              <option value="plugin">Plugin</option>
                              <option value="tool">Tool / App</option>
                              <option value="script">Script / Code</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Type</label>
                            <select
                              value={prodPricing}
                              onChange={(e) => setProdPricing(e.target.value as any)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none focus:border-primary"
                            >
                              <option value="paid">Paid Item</option>
                              <option value="free">Free Item</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Badge Tag</label>
                            <input
                              type="text"
                              placeholder="Popular / Hot"
                              value={prodBadge}
                              onChange={(e) => setProdBadge(e.target.value as any)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Technical Specs */}
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                          2. Technical Specs
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Software</label>
                            <input
                              type="text"
                              placeholder="e.g. Adobe Illustrator"
                              value={prodSoftware}
                              onChange={(e) => setProdSoftware(e.target.value)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">System</label>
                            <input
                              type="text"
                              placeholder="e.g. Windows / Mac"
                              value={prodComp}
                              onChange={(e) => setProdComp(e.target.value)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-text-secondary mb-1">Version</label>
                            <input
                              type="text"
                              placeholder="e.g. v1.5.0"
                              value={prodVer}
                              onChange={(e) => setProdVer(e.target.value)}
                              className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description & Features */}
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                          3. Details & Features
                        </h4>

                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Description</label>
                          <textarea
                            rows={2}
                            placeholder="Describe what this tool does..."
                            value={prodDesc}
                            onChange={(e) => setProdDesc(e.target.value)}
                            className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none leading-relaxed"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-text-secondary mb-1">Key Features (Comma Separated)</label>
                          <textarea
                            rows={2}
                            placeholder="Grid System, One-click Export, Presets"
                            value={prodFeatures}
                            onChange={(e) => setProdFeatures(e.target.value)}
                            className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none"
                          />
                        </div>
                      </div>

                      {/* 4. Product Showcase & Media Gallery (Images, GIFs, Videos) */}
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <FaLayerGroup />
                            <span>4. Media Showcase & Video Demos ({prodGallery.length})</span>
                          </h4>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Images • GIFs • Videos
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-background/80 border border-border/60 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Type</label>
                              <select
                                value={newGalleryType}
                                onChange={(e) => setNewGalleryType(e.target.value as any)}
                                className="w-full bg-surface border border-border/80 rounded-xl px-2.5 py-1.5 text-xs text-secondary outline-none focus:border-primary font-medium"
                              >
                                <option value="image">📸 Image</option>
                                <option value="gif">🎞️ Animated GIF</option>
                                <option value="video">🎥 Video (MP4/YouTube)</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">Caption / Title (Optional)</label>
                              <input
                                type="text"
                                placeholder="e.g. Export Speed Benchmark Demo"
                                value={newGalleryCaption}
                                onChange={(e) => setNewGalleryCaption(e.target.value)}
                                className="w-full bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-secondary outline-none focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Direct URL or YouTube video link..."
                              value={newGalleryUrl}
                              onChange={(e) => setNewGalleryUrl(e.target.value)}
                              className="flex-1 bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none font-mono focus:border-primary"
                            />
                            <label className={`px-3 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-secondary cursor-pointer shrink-0 flex items-center gap-1 transition-all ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                              {uploadingGallery ? <FaSpinner className="animate-spin text-primary" /> : <FaDownload className="text-xs text-emerald-400" />}
                              <span>Upload File</span>
                              <input
                                type="file"
                                accept="image/*,video/*,.gif"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    const isVid = file.type.startsWith("video/");
                                    const isGif = file.type.includes("gif");
                                    if (isVid) setNewGalleryType("video");
                                    else if (isGif) setNewGalleryType("gif");
                                    else setNewGalleryType("image");

                                    handleFileUpload(file, "gallery", (url) => {
                                      setNewGalleryUrl(url);
                                    });
                                  }
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddGalleryItem()}
                              className="px-3.5 py-2 bg-primary text-black rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shrink-0 flex items-center gap-1 shadow-md"
                            >
                              <FaPlus />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>

                        {/* Added Gallery Items Grid */}
                        {prodGallery.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                            {prodGallery.map((item, idx) => (
                              <div key={idx} className="relative group rounded-xl overflow-hidden bg-black/60 border border-border/80 aspect-video flex items-center justify-center">
                                {item.type === "video" ? (
                                  item.url.includes("youtube.com") || item.url.includes("youtu.be") ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-red-400 bg-red-950/40 p-2">
                                      <FaVideo className="text-xl mb-1" />
                                      <span className="text-[9px] font-mono text-center truncate w-full">YouTube Video</span>
                                    </div>
                                  ) : (
                                    <video src={item.url} className="w-full h-full object-cover" muted loop autoPlay />
                                  )
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={item.url} alt={item.caption || "Media preview"} className="w-full h-full object-cover" />
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase bg-black/80 text-white">
                                    {item.type}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryItem(idx)}
                                    className="p-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition-all shadow-md"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                                {item.caption && (
                                  <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 text-[9px] text-secondary font-medium truncate text-center">
                                    {item.caption}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 5. External Author & Intellectual Property Attribution */}
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <span>5. Tool Ownership & Author Credit</span>
                          </h4>
                        </div>

                        <div className="bg-background/80 border border-border/60 p-3.5 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              id="prodIsExternalAuthor"
                              checked={prodIsExternalAuthor}
                              onChange={(e) => setProdIsExternalAuthor(e.target.checked)}
                              className="accent-amber-400 rounded w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor="prodIsExternalAuthor" className="text-xs text-secondary font-bold cursor-pointer">
                              Third-Party Tool / External Author (Not created or owned by me)
                            </label>
                          </div>

                          {prodIsExternalAuthor && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
                              <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Author / Creator Name *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. John Doe / Studio X"
                                  value={prodAuthorName}
                                  onChange={(e) => setProdAuthorName(e.target.value)}
                                  className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-amber-400 outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-text-secondary mb-1">Author Profile / Website Link</label>
                                <input
                                  type="url"
                                  placeholder="https://github.com/author or portfolio"
                                  value={prodAuthorLink}
                                  onChange={(e) => setProdAuthorLink(e.target.value)}
                                  className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-amber-400 outline-none font-mono"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 6. Store Display & Visibility Controls */}
                      <div className="space-y-3 pt-4 border-t border-border/40">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <FaSort className="text-primary text-xs" />
                            <span>6. Store Display & Visibility Controls</span>
                          </h4>
                        </div>

                        <div className="bg-background/80 border border-border/60 p-3.5 rounded-2xl space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-text-secondary mb-1">
                                Display Order Position
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={prodSortOrder}
                                onChange={(e) => setProdSortOrder(Number(e.target.value))}
                                className="w-full bg-surface border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary focus:border-primary outline-none font-mono font-bold"
                                placeholder="e.g. 1 for top priority"
                              />
                              <p className="text-[10px] text-text-muted mt-1">Lower numbers appear first (e.g., 1 = top of store).</p>
                            </div>

                            <div className="flex flex-col justify-center">
                              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border/60">
                                <input
                                  type="checkbox"
                                  id="prodIsHidden"
                                  checked={prodIsHidden}
                                  onChange={(e) => setProdIsHidden(e.target.checked)}
                                  className="accent-rose-500 rounded w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="prodIsHidden" className="text-xs text-rose-300 font-bold cursor-pointer flex items-center gap-1.5">
                                  <FaEyeSlash className="text-rose-400" />
                                  <span>Hide tool from public store (Draft mode)</span>
                                </label>
                              </div>
                              <p className="text-[10px] text-text-muted mt-1 px-1">Allows saving tool data without showing it to customers.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Live Card Preview & Media Assets (Span 5) */}
                    <div className="lg:col-span-5 space-y-5 bg-background/50 border border-border/60 p-5 rounded-2xl">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
                          <span>Real-time Live Preview</span>
                          <span className="text-[10px] text-text-muted">Store Card View</span>
                        </h4>

                        {/* Live Store Card Mockup */}
                        <div className="bg-surface border border-border rounded-2xl p-4 shadow-xl space-y-3">
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-border/60 flex items-center justify-center">
                            {prodCoverImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={prodCoverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-text-muted">
                                <FaBox className="text-2xl text-primary/40" />
                                <span className="text-[10px]">No Cover Image</span>
                              </div>
                            )}

                            <div className="absolute top-2 left-2 flex items-center gap-1">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-primary text-black">
                                {prodCat}
                              </span>
                              {prodBadge && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  {prodBadge}
                                </span>
                              )}
                            </div>

                            <div className="absolute top-2 right-2">
                              <span className="text-[9px] font-mono bg-black/70 px-1.5 py-0.5 rounded text-secondary border border-white/10">
                                {prodVer || "v1.0.0"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-bold text-secondary truncate">{prodTitle || "Product Title"}</h5>
                              <div className="text-right">
                                {prodOriginalPriceEgp && Number(prodOriginalPriceEgp) > Number(prodPriceEgp) && (
                                  <span className="text-[10px] line-through text-text-muted font-mono block">
                                    {prodOriginalPriceEgp} EGP
                                  </span>
                                )}
                                <span className="text-xs font-bold text-primary font-mono">
                                  {prodPricing === "paid" ? `${prodPriceEgp} EGP` : "Free"}
                                </span>
                              </div>
                            </div>
                            <p className="text-[11px] text-text-muted line-clamp-2 mt-1">{prodDesc || "Product description preview..."}</p>
                          </div>
                        </div>

                        {/* Live Gallery Media Strip Preview */}
                        {prodGallery.length > 0 && (
                          <div className="mt-3 p-3 bg-surface/80 border border-border/60 rounded-2xl space-y-2">
                            <span className="text-[10px] font-mono font-bold text-primary uppercase block">Gallery Preview ({prodGallery.length} Items)</span>
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                              {prodGallery.map((m, i) => (
                                <div key={i} className="w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-border/80 relative bg-black/60">
                                  {m.type === "video" ? (
                                    <div className="w-full h-full flex items-center justify-center text-red-400 bg-red-950/40">
                                      <FaPlay className="text-[10px]" />
                                    </div>
                                  ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.url} alt="thumb" className="w-full h-full object-cover" />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Asset Uploaders */}
                      <div className="space-y-3 pt-3 border-t border-border/40">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-text-secondary">Main Cover Image (Standalone)</label>
                            {prodCoverImage && (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                                <FaCheckCircle className="text-[10px]" /> Cover Ready
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={prodCoverImage}
                              onChange={(e) => setProdCoverImage(e.target.value)}
                              placeholder="/Photos/Tools/illustrator.png"
                              className="flex-1 bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none font-mono"
                            />
                            <label className={`px-3 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-secondary cursor-pointer shrink-0 flex items-center gap-1 ${uploadingCover ? "opacity-50 pointer-events-none" : ""}`}>
                              {uploadingCover ? <FaSpinner className="animate-spin text-primary" /> : "Upload"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "covers");
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold text-text-secondary">Digital File (ZIP / RAR / EXE)</label>
                            {prodFileUrl && (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
                                <FaCheckCircle className="text-[10px]" /> File Ready
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={prodFileUrl}
                              onChange={(e) => setProdFileUrl(e.target.value)}
                              placeholder="/assets/downloads/tool.zip"
                              className="flex-1 bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-secondary outline-none font-mono"
                            />
                            <label className={`px-3 py-2 bg-primary hover:bg-primary-dark rounded-xl text-xs font-bold text-black cursor-pointer shrink-0 flex items-center gap-1 ${uploadingFile ? "opacity-50 pointer-events-none" : ""}`}>
                              {uploadingFile ? <FaSpinner className="animate-spin" /> : "Upload File"}
                              <input
                                type="file"
                                accept=".zip,.rar,.7z,.exe,.msi,.tar,.gz,.pdf,.dmg,.pkg,image/*,application/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "downloads");
                                }}
                              />
                            </label>
                          </div>
                          {prodFileUrl && (
                            <p className="text-[10px] text-text-muted font-mono mt-1 truncate">
                              Path: <span className="text-primary font-bold">{prodFileUrl}</span>
                            </p>
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                  {/* End of Scrollable Content Area */}
                </div>

                {/* Fixed Footer Action Buttons Outside Scroll Area */}
                <div className="shrink-0 pt-4 mt-2 border-t border-border/60 flex items-center justify-end gap-3 bg-surface/95">
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-surface border border-border/80 text-text-secondary hover:text-white hover:bg-surface-hover transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary text-black hover:bg-primary-dark transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(245,127,0,0.3)] disabled:opacity-50"
                  >
                    {savingProduct ? (
                      <>
                        <FaSpinner className="animate-spin text-xs" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Marketing Campaign Generator Modal */}
      <AnimatePresence>
        {showMarketingCampaignModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface/95 border border-primary/40 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-lg">
                    <FaBullhorn />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary">Marketing Campaign Launchpad</h3>
                    <p className="text-xs text-text-muted">Generate personalized outreach text for WhatsApp & Email marketing.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMarketingCampaignModal(false)}
                  className="w-8 h-8 rounded-full bg-background border border-border text-text-muted hover:text-white flex items-center justify-center"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Template Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-text-secondary">Select Marketing Template</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCampaignTemplate("launch")}
                    className={`p-3 rounded-2xl text-left border transition-all ${campaignTemplate === "launch" ? "bg-primary/20 border-primary text-primary font-bold" : "bg-background border-border/80 text-text-muted"}`}
                  >
                    <div className="text-xs font-bold">New Tool Launch</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Announce new releases</div>
                  </button>

                  <button
                    onClick={() => setCampaignTemplate("discount")}
                    className={`p-3 rounded-2xl text-left border transition-all ${campaignTemplate === "discount" ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold" : "bg-background border-border/80 text-text-muted"}`}
                  >
                    <div className="text-xs font-bold">Discount Coupon</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Exclusive coupon code</div>
                  </button>

                  <button
                    onClick={() => setCampaignTemplate("feedback")}
                    className={`p-3 rounded-2xl text-left border transition-all ${campaignTemplate === "feedback" ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold" : "bg-background border-border/80 text-text-muted"}`}
                  >
                    <div className="text-xs font-bold">Review & Feedback</div>
                    <div className="text-[10px] mt-0.5 opacity-80">Engage past buyers</div>
                  </button>
                </div>
              </div>

              {/* Campaign Custom Text Area */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Generated Marketing Text (Editable)</label>
                <textarea
                  rows={4}
                  value={
                    campaignCustomMsg ||
                    (campaignTemplate === "launch"
                      ? "Hello! We just launched a brand new tool on Abdallah Store designed to speed up your workflow. Check it out now!"
                      : campaignTemplate === "discount"
                        ? "Hello! As a valued customer, here is an exclusive discount code for 20% OFF your next tool purchase: SPECIAL20"
                        : "Hello! How is your experience with our digital tools so far? Let us know if you need any support or custom updates!")
                  }
                  onChange={(e) => setCampaignCustomMsg(e.target.value)}
                  className="w-full bg-background border border-border/80 rounded-2xl p-3.5 text-xs text-secondary focus:border-primary outline-none font-sans leading-relaxed"
                />
              </div>

              {/* Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
                <div className="text-xs font-mono text-text-muted">
                  Targeting {getFilteredOrders(customerTypeFilter, customerProductFilter, customerDateRange).length} Leads
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const msg = campaignCustomMsg || "Hello from Abdallah Store!";
                      copyToClipboard(msg, "Campaign Message");
                    }}
                    className="px-4 py-2 rounded-xl border border-border bg-surface text-secondary hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <FaCopy />
                    <span>Copy Text</span>
                  </button>

                  <button
                    onClick={() => {
                      copyCustomerPhones(customerTypeFilter, customerProductFilter, customerDateRange);
                      setShowMarketingCampaignModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <FaWhatsapp />
                    <span>Copy Target Phones & Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom WhatsApp CRM Outreach Modal */}
        {whatsappModalCustomer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 text-lg border border-emerald-500/30">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary">{whatsappModalCustomer.name}</h3>
                    <p className="text-xs font-mono text-emerald-400">{whatsappModalCustomer.phone} • {whatsappModalCustomer.tag}</p>
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappModalCustomer(null)}
                  className="p-2 text-text-muted hover:text-white rounded-xl hover:bg-surface-hover"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2">Select Campaign Template</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setWhatsappTemplate("offer")}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${whatsappTemplate === "offer"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-border/80 bg-background text-text-secondary"
                        }`}
                    >
                      Special 20% Discount
                    </button>
                    <button
                      onClick={() => setWhatsappTemplate("update")}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${whatsappTemplate === "update"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-border/80 bg-background text-text-secondary"
                        }`}
                    >
                      🚀 Tool Updates & Addons
                    </button>
                    <button
                      onClick={() => setWhatsappTemplate("support")}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${whatsappTemplate === "support"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-border/80 bg-background text-text-secondary"
                        }`}
                    >
                      🤝🏼 Support & Follow-up
                    </button>
                    <button
                      onClick={() => setWhatsappTemplate("custom")}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${whatsappTemplate === "custom"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-border/80 bg-background text-text-secondary"
                        }`}
                    >
                      ✍🏼 Custom Message
                    </button>
                  </div>
                </div>

                {whatsappTemplate === "custom" && (
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Custom Message Text</label>
                    <textarea
                      rows={3}
                      value={whatsappCustomText}
                      onChange={(e) => setWhatsappCustomText(e.target.value)}
                      placeholder="Write your custom Arabic message..."
                      className="w-full bg-background border border-border/80 rounded-xl p-3 text-xs text-secondary outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-end gap-3">
                <button
                  onClick={() => setWhatsappModalCustomer(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={sendCustomWhatsAppMessage}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <FaWhatsapp className="text-sm" />
                  <span>Send via WhatsApp Web</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Custom Edit Max Devices Modal */}
        {editMaxDevicesModal?.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-secondary text-sm">Edit Device Limit</h3>
                <button onClick={() => setEditMaxDevicesModal(null)} className="text-text-muted hover:text-white">
                  <FaTimes />
                </button>
              </div>
              <p className="text-xs text-text-muted">Target Customer: <strong className="text-white">{editMaxDevicesModal.userEmail}</strong></p>
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Max Devices Allowed</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newMaxDevicesInput}
                  onChange={(e) => setNewMaxDevicesInput(Number(e.target.value))}
                  className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditMaxDevicesModal(null)} className="px-3 py-1.5 rounded-xl border border-border text-xs text-text-muted hover:text-white">
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/store/licenses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        adminPassword: password,
                        action: "update_max_devices",
                        licenseId: editMaxDevicesModal.licenseId,
                        maxDevices: newMaxDevicesInput,
                      }),
                    });
                    if (res.ok) {
                      showToast(`Updated device limit to ${newMaxDevicesInput}!`, "success");
                      loadLicensePlatformData();
                      setEditMaxDevicesModal(null);
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"
                >
                  Save Limit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Device Activity Inspector Modal */}
        {deviceInspectorModal?.isOpen && (() => {
          const lic = deviceInspectorModal.license;
          const activeBindings = licenseDevices.filter((b) => b.licenseId === lic.id && b.status === "active");
          const boundDeviceIds = new Set(activeBindings.map((b) => b.deviceId));
          const boundDevices = devices
            .filter((d) => boundDeviceIds.has(d.id) || d.licenseId === lic.id || d.id === lic.id)
            .map((d) => {
              const binding = activeBindings.find((b) => b.deviceId === d.id);
              return {
                ...d,
                firstSeenAt: binding?.activatedAt || d.firstSeenAt,
                lastSeenAt: binding?.lastHeartbeatAt || d.lastSeenAt,
              };
            });
          const prod = products.find((p) => p.id === lic.productId);

          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div>
                    <h3 className="font-black text-secondary text-lg flex items-center gap-2">
                      <FaKey className="text-amber-400" /> Device Activity Inspector
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">{lic.userEmail} • {prod ? prod.title : lic.productId}</p>
                  </div>
                  <button onClick={() => setDeviceInspectorModal(null)} className="text-text-muted hover:text-white">
                    <FaTimes />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-background/60 p-3 rounded-2xl border border-border/60">
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase font-mono">Allowed Limit</span>
                      <span className="font-bold text-amber-400">{lic.maxDevices} Devices</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase font-mono">Bound Devices</span>
                      <span className="font-bold text-emerald-400">{boundDevices.length} Active</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase font-mono">Key Status</span>
                      <span className="font-bold text-secondary uppercase">{lic.status}</span>
                    </div>
                    <div>
                      <span className="text-text-muted block text-[10px] uppercase font-mono">Time Remaining</span>
                      <span className="font-bold text-amber-400 font-mono">
                        {!lic.expiresAt || lic.status === "pending"
                          ? "Pending activation"
                          : formatRemainingTime(lic.expiresAt, nowTime).text}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {boundDevices.length === 0 ? (
                      <div className="text-center py-8 text-xs text-text-muted font-mono bg-background/40 rounded-2xl border border-border/40">
                        No active devices bound to this license key yet.
                      </div>
                    ) : (
                      boundDevices.map((dev, devIdx) => (
                        <div key={dev.id || `dev_${devIdx}_${dev.fingerprintHash || devIdx}`} className="bg-background/80 border border-border/80 rounded-2xl p-4 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-secondary flex items-center gap-2">
                              💻 {dev.deviceName || "Client PC / Workstation"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                              {dev.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-text-muted pt-1">
                            <div>Platform: <span className="text-secondary">{dev.platform || "Desktop App"}</span></div>
                            <div>Fingerprint: <span className="text-amber-400">{dev.fingerprintHash ? dev.fingerprintHash.slice(0, 12) + "..." : "Dev-Web"}</span></div>
                            <div>First Activated: <span className="text-secondary">{new Date(dev.firstSeenAt).toLocaleString()}</span></div>
                            <div>Last Heartbeat: <span className="text-emerald-400">{new Date(dev.lastSeenAt).toLocaleString()}</span></div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/60 flex justify-between items-center">
                  <button
                    onClick={() => {
                      setDeviceInspectorModal(null);
                      askConfirmation({
                        title: "Reset All Device Bindings",
                        message: `Are you sure you want to unbind all devices for key (${lic.userEmail})?`,
                        confirmText: "Unbind All",
                        variant: "warning",
                        onConfirm: async () => {
                          const res = await fetch("/api/store/licenses", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              adminPassword: password,
                              action: "reset_devices",
                              licenseId: lic.id,
                            }),
                          });
                          if (res.ok) {
                            showToast(`Reset bound devices for ${lic.userEmail}!`, "info");
                            loadLicensePlatformData();
                          }
                        },
                      });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold"
                  >
                    Unbind All Devices
                  </button>
                  <button onClick={() => setDeviceInspectorModal(null)} className="px-4 py-2 rounded-xl bg-surface-hover border border-border text-xs font-bold text-secondary hover:text-white">
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Custom Create Subscription Plan Modal */}
        {showAddPlanModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-secondary text-base">Create Subscription Plan</h3>
                <button onClick={() => setShowAddPlanModal(false)} className="text-text-muted hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Target Paid Tool</label>
                  <select
                    value={newPlanProductId}
                    onChange={(e) => setNewPlanProductId(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary outline-none focus:border-amber-400"
                  >
                    {products
                      .filter((p) => p.pricingType === "paid" && p.priceEgp > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.priceEgp} EGP)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Plan Name / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Month Pass, 10-Minute Pass, 3-Day Trial"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Duration Value</label>
                    <input
                      type="number"
                      min={1}
                      value={newPlanDurationValue}
                      onChange={(e) => setNewPlanDurationValue(Number(e.target.value))}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Time Unit</label>
                    <select
                      value={newPlanDurationUnit}
                      onChange={(e) => setNewPlanDurationUnit(e.target.value as "minutes" | "hours" | "days")}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold outline-none focus:border-amber-400"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Max Devices</label>
                  <input
                    type="number"
                    min={1}
                    value={newPlanMaxDevices}
                    onChange={(e) => setNewPlanMaxDevices(Number(e.target.value))}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Price (EGP)</label>
                    <input
                      type="number"
                      min={0}
                      value={newPlanPriceEgp}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewPlanPriceEgp(val);
                        if (usdExchangeRate > 0) {
                          setNewPlanPriceUsd(Math.round((val / usdExchangeRate) * 10) / 10);
                        }
                      }}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Price (USD)</label>
                    <input
                      type="number"
                      min={0}
                      value={newPlanPriceUsd}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setNewPlanPriceUsd(val);
                        if (usdExchangeRate > 0) {
                          setNewPlanPriceEgp(Math.round(val * usdExchangeRate));
                        }
                      }}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="newPlanTrial"
                    checked={newPlanIsTrial}
                    onChange={(e) => setNewPlanIsTrial(e.target.checked)}
                    className="accent-amber-400 rounded"
                  />
                  <label htmlFor="newPlanTrial" className="text-xs text-secondary font-bold cursor-pointer">
                    Is Free Trial Plan (Activates on First Use)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddPlanModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!newPlanName || !newPlanProductId) {
                      showToast("Please specify plan name and target product.", "error");
                      return;
                    }
                    const calculatedDays = newPlanDurationUnit === "days"
                      ? newPlanDurationValue
                      : newPlanDurationUnit === "hours"
                        ? newPlanDurationValue / 24
                        : newPlanDurationValue / 1440;

                    const res = await fetch("/api/store/licenses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        adminPassword: password,
                        action: "create_plan",
                        productId: newPlanProductId,
                        name: newPlanName,
                        durationValue: newPlanDurationValue,
                        durationUnit: newPlanDurationUnit,
                        durationDays: calculatedDays,
                        priceEgp: newPlanPriceEgp,
                        priceUsd: newPlanPriceUsd,
                        maxDevices: newPlanMaxDevices,
                        trial: newPlanIsTrial,
                      }),
                    });
                    if (res.ok) {
                      showToast(`Created subscription plan "${newPlanName}"!`, "success");
                      setShowAddPlanModal(false);
                      setNewPlanName("");
                      loadLicensePlatformData();
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
                >
                  Create Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Edit Subscription Plan Modal */}
        {editPlanModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <h3 className="font-bold text-secondary text-base">Edit Subscription Plan</h3>
                <button onClick={() => setEditPlanModal(null)} className="text-text-muted hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Target Paid Tool</label>
                  <select
                    value={editPlanModal.productId}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, productId: e.target.value })}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary outline-none focus:border-amber-400"
                  >
                    {products
                      .filter((p) => p.pricingType === "paid" && p.priceEgp > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.priceEgp} EGP)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Plan Name / Title</label>
                  <input
                    type="text"
                    value={editPlanModal.name}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, name: e.target.value })}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Duration Value</label>
                    <input
                      type="number"
                      min={1}
                      value={editPlanModal.durationValue || editPlanModal.durationDays || 30}
                      onChange={(e) => setEditPlanModal({ ...editPlanModal, durationValue: Number(e.target.value) })}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Time Unit</label>
                    <select
                      value={editPlanModal.durationUnit || "days"}
                      onChange={(e) => setEditPlanModal({ ...editPlanModal, durationUnit: e.target.value as "minutes" | "hours" | "days" })}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold outline-none focus:border-amber-400"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Max Devices</label>
                  <input
                    type="number"
                    min={1}
                    value={editPlanModal.maxDevices}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, maxDevices: Number(e.target.value) })}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Price (EGP)</label>
                    <input
                      type="number"
                      min={0}
                      value={editPlanModal.priceEgp}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const calculatedUsd = usdExchangeRate > 0 ? Math.round((val / usdExchangeRate) * 10) / 10 : editPlanModal.priceUsd;
                        setEditPlanModal({ ...editPlanModal, priceEgp: val, priceUsd: calculatedUsd });
                      }}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Price (USD)</label>
                    <input
                      type="number"
                      min={0}
                      value={editPlanModal.priceUsd}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const calculatedEgp = usdExchangeRate > 0 ? Math.round(val * usdExchangeRate) : editPlanModal.priceEgp;
                        setEditPlanModal({ ...editPlanModal, priceUsd: val, priceEgp: calculatedEgp });
                      }}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="editPlanTrial"
                    checked={editPlanModal.trial}
                    onChange={(e) => setEditPlanModal({ ...editPlanModal, trial: e.target.checked })}
                    className="accent-amber-400 rounded"
                  />
                  <label htmlFor="editPlanTrial" className="text-xs text-secondary font-bold cursor-pointer">
                    Is Free Trial Plan (Activates on First Use)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-end gap-3">
                <button
                  onClick={() => setEditPlanModal(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const unit = editPlanModal.durationUnit || "days";
                    const val = editPlanModal.durationValue || editPlanModal.durationDays || 30;
                    const calculatedDays = unit === "days" ? val : unit === "hours" ? val / 24 : val / 1440;

                    const res = await fetch("/api/store/licenses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        adminPassword: password,
                        action: "update_plan",
                        planId: editPlanModal.id,
                        productId: editPlanModal.productId,
                        name: editPlanModal.name,
                        durationValue: val,
                        durationUnit: unit,
                        durationDays: calculatedDays,
                        priceEgp: editPlanModal.priceEgp,
                        priceUsd: editPlanModal.priceUsd,
                        maxDevices: editPlanModal.maxDevices,
                        trial: editPlanModal.trial,
                      }),
                    });
                    if (res.ok) {
                      showToast(`Updated subscription plan "${editPlanModal.name}"!`, "success");
                      setEditPlanModal(null);
                      loadLicensePlatformData();
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Manual Issue License Key Modal */}
        {showManualLicenseModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-surface border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <FaKey className="text-amber-400 text-base" />
                  <h3 className="font-bold text-secondary text-base">Issue Activation License Key</h3>
                </div>
                <button onClick={() => setShowManualLicenseModal(false)} className="text-text-muted hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Customer Email Address *</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={manualUserEmail}
                    onChange={(e) => setManualUserEmail(e.target.value)}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Target Paid Tool *</label>
                  <select
                    value={manualProductId}
                    onChange={(e) => {
                      setManualProductId(e.target.value);
                      const matchingPlans = plans.filter((p) => p.productId === e.target.value);
                      if (matchingPlans.length > 0) setManualPlanId(matchingPlans[0].id);
                    }}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2.5 text-xs text-secondary outline-none focus:border-amber-400"
                  >
                    {products
                      .filter((p) => p.pricingType === "paid" || p.priceEgp > 0)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-text-secondary mb-1">Duration Value</label>
                    <input
                      type="number"
                      min={1}
                      value={manualCustomValue}
                      onChange={(e) => setManualCustomValue(Number(e.target.value))}
                      className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text-secondary mb-1">Time Unit</label>
                    <select
                      value={manualCustomUnit}
                      onChange={(e) => setManualCustomUnit(e.target.value as "minutes" | "hours" | "days")}
                      className="w-full bg-background border border-border/80 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold outline-none focus:border-amber-400"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Max Devices Allowed</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={manualMaxDevices}
                    onChange={(e) => setManualMaxDevices(Number(e.target.value))}
                    className="w-full bg-background border border-border/80 rounded-xl px-3.5 py-2 text-xs text-secondary outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                  <FaClock className="text-amber-400 text-sm mt-0.5 shrink-0" />
                  <span>
                    <strong>Activation Clock:</strong> Key will be created in <strong className="underline">Pending</strong> status. The timer ({manualCustomValue} {manualCustomUnit}) will only start counting down on the user&apos;s first device activation.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex justify-end gap-3">
                <button
                  onClick={() => setShowManualLicenseModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const paidProds = products.filter((p) => p.pricingType === "paid" || p.priceEgp > 0);
                    const targetProductId = manualProductId || (paidProds.length > 0 ? paidProds[0].id : (products[0]?.id || ""));

                    if (!manualUserEmail || !targetProductId) {
                      showToast("Please provide user email and select a product.", "error");
                      return;
                    }
                    const calculatedDays = manualCustomUnit === "days"
                      ? manualCustomValue
                      : manualCustomUnit === "hours"
                        ? manualCustomValue / 24
                        : manualCustomValue / 1440;

                    const res = await fetch("/api/store/licenses", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        adminPassword: password,
                        action: "issue_license",
                        userEmail: manualUserEmail,
                        productId: targetProductId,
                        planId: manualPlanId || "custom",
                        durationValue: manualCustomValue,
                        durationUnit: manualCustomUnit,
                        durationDays: calculatedDays,
                        maxDevices: manualMaxDevices,
                      }),
                    });

                    const data = await res.json();
                    if (res.ok && data.rawLicenseKey) {
                      setShowManualLicenseModal(false);
                      setIssuedRawKeyModal({
                        rawKey: data.rawLicenseKey,
                        email: manualUserEmail,
                        expiresAt: `Pending (Starts on first device activation)`,
                      });
                      showToast(`Issued license key for ${manualUserEmail}!`, "success");
                      loadLicensePlatformData();
                    } else {
                      showToast(data.error || "Failed to issue license.", "error");
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs hover:bg-amber-300 transition-colors shadow-md shadow-amber-400/20"
                >
                  Generate & Issue Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issued License Key Reveal Modal */}
        <AnimatePresence>
          {issuedRawKeyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="bg-surface border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  <FaCheckCircle />
                </div>

                <div>
                  <h3 className="font-black text-secondary text-xl">License Key Issued Successfully!</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Issued for <span className="text-white font-bold">{issuedRawKeyModal.email}</span>
                  </p>
                </div>

                <div className="p-4 bg-background border border-border/80 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block tracking-wider">
                    Raw License Key (Copy Now)
                  </span>
                  <p className="font-mono text-lg font-black text-emerald-400 select-all tracking-widest break-all">
                    {issuedRawKeyModal.rawKey}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      copyToClipboard(issuedRawKeyModal.rawKey, "License Key");
                      setIsKeyCopied(true);
                      setTimeout(() => setIsKeyCopied(false), 2500);
                    }}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${isKeyCopied
                        ? "bg-emerald-400 text-black scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.5)]"
                        : "bg-emerald-500 text-black hover:bg-emerald-400"
                      }`}
                  >
                    {isKeyCopied ? (
                      <>
                        <FaCheck className="text-sm" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="text-sm" />
                        <span>Copy License Key</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIssuedRawKeyModal(null);
                      setIsKeyCopied(false);
                    }}
                    className="px-5 py-3 rounded-2xl border border-border/80 text-xs font-bold text-text-secondary hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}
