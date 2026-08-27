"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import ProjectCard from "./ProjectCard";

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  coverImage: any;
  category: string;
  date: string;
  order?: number;
}

const categories = [
  "All",
  "Websites & Apps",
  "Branding",
  "3D & Manipulation",
  "Print & Packaging",
  "Social Media Campaigns",
  "Typography & Calligraphy",
];

// Fallback sample projects when no CMS data
const sampleProjects: Project[] = [
  {
    _id: "1",
    title: "Brand Identity - Luxe",
    slug: { current: "brand-identity-luxe" },
    coverImage: null,
    category: "branding",
    date: "2024-06-15",
  },
  {
    _id: "2",
    title: "Full-Stack Web App - Ghost Friends",
    slug: { current: "ghost-friends-web-app" },
    coverImage: null,
    category: "web-dev",
    date: "2024-05-10",
  },
  {
    _id: "3",
    title: "App UI - Fintech Dashboard",
    slug: { current: "fintech-dashboard" },
    coverImage: null,
    category: "ui-ux",
    date: "2024-01-10",
  },
  {
    _id: "4",
    title: "Motion Graphics - Reel",
    slug: { current: "motion-reel" },
    coverImage: null,
    category: "motion",
    date: "2023-11-05",
  },
  {
    _id: "5",
    title: "3D Manipulation - Surreal",
    slug: { current: "3d-surreal" },
    coverImage: null,
    category: "illustration",
    date: "2023-09-18",
  },
  {
    _id: "6",
    title: "Print Campaign - Packaging",
    slug: { current: "print-packaging" },
    coverImage: null,
    category: "print",
    date: "2023-07-22",
  },
];

export default function ProjectsGrid({
  projects,
}: {
  projects: Project[];
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

  // Set default count: 6 for mobile (<640px), 12 for desktop
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 640;
      setVisibleCount(isMobile ? 6 : 12);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const displayProjects = projects?.length > 0 ? projects : sampleProjects;

  const sortedProjects = [...displayProjects].sort((a: any, b: any) => {
    const orderA = typeof a.order === "number" ? a.order : 9999;
    const orderB = typeof b.order === "number" ? b.order : 9999;
    if (orderA !== orderB) return orderA - orderB;

    const timeA = a._createdAt
      ? new Date(a._createdAt).getTime()
      : a.date
        ? new Date(a.date).getTime()
        : 0;
    const timeB = b._createdAt
      ? new Date(b._createdAt).getTime()
      : b.date
        ? new Date(b.date).getTime()
        : 0;
    return timeB - timeA;
  });

  const filtered =
    activeCategory === "All"
      ? sortedProjects
      : sortedProjects.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const target = activeCategory.toLowerCase();

        if (target.includes("web") || target.includes("app"))
          return cat.includes("web") || cat === "web-dev" || cat === "apps";
        if (target.includes("brand")) return cat.includes("brand") || cat === "branding";
        if (target.includes("ui")) return cat.includes("ui") || cat === "ui-ux";
        if (target.includes("3d") || target.includes("manipulation"))
          return cat.includes("3d") || cat.includes("manipulation") || cat === "illustration" || cat === "3d";
        if (target.includes("print"))
          return cat.includes("print") || cat.includes("packag") || cat === "editorial";
        if (target.includes("social") || target.includes("digital"))
          return cat.includes("social") || cat.includes("digital");
        if (target.includes("motion") || target.includes("reel") || target.includes("video"))
          return cat.includes("motion") || cat.includes("video");
        if (target.includes("typo") || target.includes("calligraphy"))
          return cat.includes("typo") || cat.includes("calligraphy") || cat === "typography";

        return cat === target;
      });

  const displayedProjects = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const initialCount = typeof window !== "undefined" && window.innerWidth < 640 ? 6 : 12;
    setVisibleCount(initialCount);
  };

  return (
    <SectionWrapper id="projects">
      <div className="text-center mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(245,127,0,0.15)]"
        >
          <span>Curated Portfolio</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-4 tracking-tight"
        >
          Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">Projects</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-text-secondary text-xs sm:text-base max-w-lg mx-auto leading-relaxed font-medium"
        >
          Explore strategic Brand Identities, Web Applications, and Visual Solutions.
        </motion.p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 max-w-4xl mx-auto px-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 ${activeCategory === cat
              ? "bg-primary text-background shadow-[0_0_20px_rgba(245,127,0,0.4)] scale-105"
              : "bg-surface border border-border/80 text-text-secondary hover:text-secondary hover:border-primary/40"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid Container */}
      <div className="relative max-w-7xl mx-auto px-4">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedProjects.map((project, index) => (
              <motion.div
                key={project._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: (index % 12) * 0.03 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Conditional Gradient Overlay & See More Button */}
        {hasMore && (
          <div className="relative z-20 -mt-36 pt-40 pb-6 bg-gradient-to-t from-background via-background/90 to-transparent flex flex-col items-center justify-end pointer-events-auto">
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                const step = typeof window !== "undefined" && window.innerWidth < 640 ? 6 : 12;
                setVisibleCount((prev) => prev + step);
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-surface border-2 border-primary/50 text-secondary text-sm font-bold shadow-[0_10px_30px_rgba(245,127,0,0.2)] hover:border-primary hover:bg-primary hover:text-background transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>See More Projects</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary group-hover:bg-background/20 group-hover:text-background transition-colors">
                +{filtered.length - visibleCount}
              </span>
            </motion.button>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
