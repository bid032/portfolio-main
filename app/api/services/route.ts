import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

let cachedServices: any[] | null = null;
let lastServicesFetchTime = 0;
const SERVICES_CACHE_TTL_MS = 15000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedServices && now - lastServicesFetchTime < SERVICES_CACHE_TTL_MS) {
      return NextResponse.json(cachedServices);
    }

    const fetchPromise = supabase
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error("Supabase timeout") }), 1200)
    );

    const { data: services, error } = await Promise.race([fetchPromise, timeoutPromise]);

    if (!error && services && services.length > 0) {
      cachedServices = services;
      lastServicesFetchTime = now;
      return NextResponse.json(services);
    }

    // Fallback default services if table is empty or being initialized
    const defaultServices = [
      {
        id: "srv_brand_identity",
        title: "Brand Identity & Corporate Design",
        category: "Design",
        description: "End-to-end brand strategy, logo systems, graphic brand guidelines, and vector design assets for enterprise companies.",
        features: ["Full Brand Book & Style Guides", "Vector Logo Systems", "Stationery & Packaging Layouts"],
        icon: "Palette"
      },
      {
        id: "srv_commercial_video",
        title: "Commercial Video Editing & Motion",
        category: "Video",
        description: "High-converting promo video ads, dynamic social reels, kinetic typography, and broadcast-grade color grading.",
        features: ["9:16 & 16:9 Ad Cutdowns", "Motion Graphic Overlays", "Sound Design & Color Grade"],
        icon: "Film"
      },
      {
        id: "srv_web_development",
        title: "Full-Stack Web Application Engineering",
        category: "Development",
        description: "Ultra-fast Next.js web applications, digital store portals, CMS integrations, and modern glassmorphism UI/UX design.",
        features: ["Next.js 15 & React 19 Engine", "Database & Payment Integration", "Smooth Animations & SEO"],
        icon: "Code"
      }
    ];

    return NextResponse.json(defaultServices);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch services" }, { status: 500 });
  }
}
