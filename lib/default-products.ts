import { Product } from "./store-types";

// Static representation matching EXACT Supabase products table
export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "c68806b2-d4f9-44d0-bc6b-ec3833a169cf",
    slug: "whatsapp-bulk-sender-pro",
    title: "WhatsApp Bulk Sender Pro",
    subtitle: "Professional WhatsApp bulk messaging tool built directly into Google Chrome as an embedded Side Panel.",
    description: "Professional WhatsApp bulk messaging tool built directly into Google Chrome as an embedded Side Panel. \n\nSend promotional, marketing, and customer service messages effortlessly through WhatsApp Web without needing to re-scan QR codes or log into external tools. Features intelligent safety mechanisms including randomized send delays and automated batch rest breaks—to protect your account from bans, alongside automated duplicate contact filtration and file importing.",
    category: "plugin",
    pricingType: "free",
    priceEgp: 0,
    priceUsd: 0,
    badge: "Popular",
    features: [
      "Integrated Chrome Side Panel UI inside WhatsApp Web",
      "Import contacts via Excel, CSV, TXT files or paste directly",
      "Automatic duplicate contact removal and unique stats counter",
      "Smart anti-ban protection with randomized delay intervals",
      "Full transmission controls (Start, Pause, Resume, Stop)",
      "Customizable batch pause timers and execution delays",
      "Auto-detect text direction with full Arabic and English support"
    ],
    software: "Google Chrome",
    compatibility: "Windows / Mac (Google Chrome)",
    version: "v2.0.0",
    fileUrl: "/uploads/downloads/WhatsApp_Bulk_Sender_v2.zip",
    coverImage: "/uploads/covers/3cbe8515-7f11-446d-9e8c-26b1143a63d9.jpg",
    gallery: [
      {
        type: "image",
        url: "/uploads/gallery/ChatGPT Image Sep 1, 2026, 08_22_51 PM.png",
        caption: "Chrome Extension Side Panel Interface"
      }
    ],
    downloadsCount: 0,
    sortOrder: 0,
    isHidden: false,
    createdAt: "2026-09-01T17:15:17.494Z"
  },
  {
    id: "fc39e726-93da-4bc3-b898-3a0149b1348b",
    slug: "outliner-pro",
    title: "Outliner Pro",
    subtitle: "See the geometry behind every vector.",
    description: "Outliner Pro transforms your Illustrator artwork into a detailed visual construction map. Inspect anchors, Bezier handles, curves, tangents, radii, dimensions, and path geometry in real time with clean presentation controls, customizable visual styles, and smart label positioning. Built for designers who want to understand, analyze, and present vector construction with precision.",
    category: "script",
    pricingType: "free",
    priceEgp: 0,
    priceUsd: 0,
    badge: "Popular",
    features: [
      "Live Vector Analysis",
      "Precision Geometry Tools",
      "Smart Presentation System"
    ],
    software: "Adobe Illustrator",
    compatibility: "Windows / Mac",
    version: "v1.0.0",
    fileUrl: "/uploads/downloads/Outliner.zip",
    coverImage: "/uploads/covers/109ce602-d5aa-4635-bc50-293ed7bd1bb9.jpg",
    gallery: [
      {
        type: "video",
        url: "/uploads/gallery/Outliner.mp4",
        caption: "How Script Works"
      }
    ],
    downloadsCount: 0,
    sortOrder: 1,
    isHidden: false,
    createdAt: "2026-08-24T00:48:24.221Z"
  },
  {
    id: "a96a20d6-b046-412e-a234-464cbc799a32",
    slug: "arabic-direction-tool",
    title: "Arabic Direction Tool",
    subtitle: "Professional RTL & LTR paragraph direction control for Adobe Illustrator.",
    description: "A lightweight, non-destructive Illustrator tool for instantly switching paragraph direction between RTL and LTR while preserving your existing text formatting. Apply changes to selected text or the entire document with a dedicated, simple control panel.",
    category: "tool",
    pricingType: "free",
    priceEgp: 0,
    priceUsd: 0,
    badge: "Popular",
    features: [
      "Instant RTL / LTR Switching",
      "Formatting-Safe Direction Control",
      "Selection & Entire Document Support"
    ],
    software: "Adobe Illustrator",
    compatibility: "Windows / Mac",
    version: "v1.1.0",
    fileUrl: "/uploads/downloads/Arabic_Direction_Tool_v1.1_Windows.zip",
    coverImage: "/uploads/covers/3cbe8515-7f11-446d-9e8c-26b1143a63d9.jpg",
    gallery: [
      {
        type: "video",
        url: "https://www.youtube.com/watch?v=D4a0IMeECbY",
        caption: "Tutorial"
      }
    ],
    isExternalAuthor: true,
    authorName: "Mohamed Habib",
    authorLink: "https://www.facebook.com/mohamed.habib.805693",
    downloadsCount: 0,
    sortOrder: 2,
    isHidden: false,
    createdAt: "2026-08-24T21:26:00.406Z"
  },
  {
    id: "88883779-a29b-49e6-afa0-225b20adac93",
    slug: "gridora",
    title: "Gridora",
    subtitle: "Professional grid, layout & composition toolkit for Adobe Photoshop.",
    description: "Gridora is a professional grid and composition toolkit for Adobe Photoshop, built to help designers create structured layouts with greater precision and consistency.\n\nIt provides a collection of predefined canvas and social-media layouts, including Instagram posts and stories, Facebook covers, X posts and covers, YouTube thumbnails and covers, Behance formats, LinkedIn covers, presentations, and multi-post Instagram layouts.\n\nGridora also includes composition overlays such as the Golden Spiral, custom grid controls, guide generation, live previews, document-size detection, unit conversion, and preset management. Custom grid configurations can be previewed and applied directly to your Photoshop document, giving you a flexible workflow for both everyday design work and more advanced composition studies.\n\nThe plugin is delivered as a native Adobe .ccx package with a dockable Photoshop panel and supports Photoshop 22.0 and newer.",
    category: "plugin",
    pricingType: "paid",
    priceEgp: 1450,
    originalPriceEgp: 500,
    priceUsd: 29,
    badge: "Popular",
    features: [
      "Custom Grids & Composition Guides",
      "Ready-Made Design Grids",
      "Live Preview & Smart Presets"
    ],
    software: "Adobe Photoshop",
    compatibility: "Windows / Mac",
    version: "v2.0",
    fileUrl: "https://qbxwddtepdpwcvteqnaf.supabase.co/storage/v1/object/public/downloads/404959c6-6e43-4665-8a4c-89449a34c0ee.zip",
    coverImage: "https://qbxwddtepdpwcvteqnaf.supabase.co/storage/v1/object/public/products/0bed6cdf-5963-48b5-bea4-1176dd7b44d1.png",
    gallery: [],
    downloadsCount: 0,
    sortOrder: 3,
    isHidden: false,
    createdAt: "2026-06-07T20:28:19.364Z"
  }
];
