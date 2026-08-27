"use client";

import { useRef, JSX } from "react";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import { urlFor } from "@/sanity/image";
import { useApp } from "@/context/AppContext";
import SectionWrapper from "./SectionWrapper";

import {
  TbBrandAdobePhotoshop,
  TbBrandAdobeIllustrator,
  TbBrandAdobeIndesign,
  TbBrandAdobePremiere,
  TbBrandReact,
  TbBrandNextjs,
  TbBrandTailwind,
  TbBrandTypescript,
  TbPalette,
  TbVideo,
  TbCode,
} from "react-icons/tb";

// Official Authentic CapCut Logo SVG Vector
const CapCutIcon = ({ className = "w-7 h-7 sm:w-8 sm:h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M24.189 6.442V2.671l-4.535 2.383V4.91c.002-1.505-1.078-2.411-2.638-2.411H2.64C.993 2.5 0 3.407 0 4.91V8.72L6.354 12 0 15.316v3.8C0 20.595 1 21.5 2.64 21.5h14.373c1.56 0 2.639-.907 2.639-2.382v-.197l4.536 2.409v-3.828L13.64 12 24.19 6.443zM9.982 13.873l7.797 4.083H2.157l7.825-4.083zm7.741-7.828l-7.742 4.057-7.825-4.057h15.567z" />
  </svg>
);

export interface SoftwareItem {
  _id: string;
  name: string;
  icon?: any;
  category?: string;
  discipline?: "design" | "video" | "dev";
  description?: string;
}

const fallbackSoftware: SoftwareItem[] = [
  //  Graphic & Brand Design
  {
    _id: "1",
    name: "Photoshop",
    category: "Image Compositing & Retouching",
    discipline: "design",
    description: "Advanced image editing, AI manipulation & composite artwork",
  },
  {
    _id: "2",
    name: "Illustrator",
    category: "Vector & Logo Design",
    discipline: "design",
    description: "Precision vector branding, logos & typography systems",
  },
  {
    _id: "3",
    name: "InDesign",
    category: "Editorial & Document Design",
    discipline: "design",
    description: "Multi-page layouts, brand guidelines & professional publications",
  },

  //  Video Editing & Commercial Media
  {
    _id: "5",
    name: "Premiere Pro",
    category: "Professional Video Editing",
    discipline: "video",
    description: "Commercial video editing, color grading & audio syncing",
  },
  {
    _id: "7",
    name: "CapCut",
    category: "Short Video Editing",
    discipline: "video",
    description: "Fast-paced edits, social content & commercial reels",
  },

  //  Web & App Development
  {
    _id: "9",
    name: "React",
    category: "Component-Based UI",
    discipline: "dev",
    description: "Reusable components, state management & interactive interfaces",
  },
  {
    _id: "10",
    name: "Next.js",
    category: "Full-Stack Web Frameworks",
    discipline: "dev",
    description: "High-performance web apps, SSR, SEO & reactive UIs",
  },
  {
    _id: "11",
    name: "Tailwind CSS",
    category: "Utility-First CSS",
    discipline: "dev",
    description: "Responsive interfaces, design systems, animations & rapid UI development",
  },
  {
    _id: "12",
    name: "TypeScript",
    category: "Typed JavaScript Development",
    discipline: "dev",
    description: "Reliable types, scalable codebases & maintainable component logic",
  },
];

const iconClass = "w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-700 group-hover:rotate-180";

const Icons: Record<string, JSX.Element> = {
  Photoshop: <TbBrandAdobePhotoshop className={iconClass} />,
  Illustrator: <TbBrandAdobeIllustrator className={iconClass} />,
  InDesign: <TbBrandAdobeIndesign className={iconClass} />,
  "Premiere Pro": <TbBrandAdobePremiere className={iconClass} />,
  CapCut: <CapCutIcon className={iconClass} />,
  Capcut: <CapCutIcon className={iconClass} />,
  React: <TbBrandReact className={iconClass} />,
  "Next.js": <TbBrandNextjs className={iconClass} />,
  "Next.js & React": <TbBrandNextjs className={iconClass} />,
  "Tailwind CSS": <TbBrandTailwind className={iconClass} />,
  TypeScript: <TbBrandTypescript className={iconClass} />,
};

function getIconElement(item: SoftwareItem) {
  try {
    if (item.icon && typeof item.icon === "object") {
      const src = urlFor(item.icon)?.url();
      if (src) {
        return (
          <Image
            src={src}
            alt={item.name}
            width={48}
            height={48}
            className="object-contain p-1 transition-transform duration-700 group-hover:rotate-180"
          />
        );
      }
    }
  } catch { }

  const normalizedName = item.name.trim();
  if (Icons[normalizedName]) return Icons[normalizedName];

  const matchedKey = Object.keys(Icons).find(
    (k) => k.toLowerCase() === normalizedName.toLowerCase()
  );
  if (matchedKey && Icons[matchedKey]) return Icons[matchedKey];

  return (
    <span className="text-primary font-bold text-lg sm:text-xl transition-transform duration-700 group-hover:rotate-180">
      {item.name.charAt(0)}
    </span>
  );
}

function SoftwareCard({ tool, index }: { tool: SoftwareItem; index: number }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const background = useMotionTemplate`radial-gradient(240px circle at ${mouseX}px ${mouseY}px, rgba(245,127,0,0.22), transparent 75%)`;

  const fallbackMeta = fallbackSoftware.find(
    (f) => f.name.toLowerCase() === tool.name.toLowerCase()
  );

  const categoryLabel = tool.category || fallbackMeta?.category || "Professional Tool";
  const descriptionText = tool.description || fallbackMeta?.description;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="relative overflow-hidden group p-4 sm:p-5 bg-surface border border-border/80 rounded-2xl sm:rounded-3xl transition-all duration-300 hover:border-primary/60 hover:shadow-[0_12px_35px_rgba(245,127,0,0.14)] flex items-start gap-4 sm:gap-5 shadow-sm"
    >
      {/* Dynamic Cursor Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{ background }}
      />

      {/* Left Column: Icon Container */}
      <div className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary border border-primary/30 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0 shadow-md">
        {getIconElement(tool)}
      </div>

      {/* Right Column: Name & Description */}
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <h3 className="text-secondary text-base sm:text-lg font-extrabold group-hover:text-primary transition-colors duration-300 truncate">
            {tool.name}
          </h3>
        </div>
        <p className="text-primary text-[11px] font-bold tracking-wide uppercase mb-1">
          {categoryLabel}
        </p>
        {descriptionText && (
          <p className="text-text-secondary text-xs leading-snug font-medium line-clamp-2">
            {descriptionText}
          </p>
        )}
      </div>
    </motion.div>
  );
}

const disciplineCategories = [
  {
    id: "design",
    title: "Graphic & Brand Design",
    icon: TbPalette,
    badge: "Brand & Visual",
    tools: ["Photoshop", "Illustrator", "InDesign"],
  },
  {
    id: "video",
    title: "Video & Content Production",
    icon: TbVideo,
    badge: "Commercial Video",
    tools: ["Premiere Pro", "CapCut"],
  },
  {
    id: "dev",
    title: "Web Development & Code",
    icon: TbCode,
    badge: "Full-Stack Web",
    tools: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
  },
];

export default function Software({ data }: { data: SoftwareItem[] }) {
  const { t } = useApp();

  const items = data?.length > 0 ? data : fallbackSoftware;

  // Filter out removed software
  const filteredData = items.filter(
    (item) =>
      item.name.toLowerCase() !== "after effects" &&
      item.name.toLowerCase() !== "figma" &&
      item.name.toLowerCase() !== "blender" &&
      item.name.toLowerCase() !== "vs code" &&
      item.name.toLowerCase() !== "vscode"
  );

  return (
    <SectionWrapper id="software">
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(245,127,0,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Creative Arsenal</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-4 tracking-tight"
          >
            Tools of <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">The Craft</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-xs sm:text-base max-w-xl mx-auto leading-relaxed"
          >
            The digital tools and technologies I rely on to turn creative ideas into reality.
          </motion.p>
        </div>

        {/* 3 Discipline Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto items-stretch">
          {disciplineCategories.map((cat, catIdx) => {
            const CatIcon = cat.icon;
            // Get matching tools for this discipline
            const categoryTools = filteredData.filter((tool) => {
              const matchedFallback = fallbackSoftware.find(
                (f) => f.name.toLowerCase() === tool.name.toLowerCase()
              );
              const toolDiscipline = tool.discipline || matchedFallback?.discipline;
              if (toolDiscipline) return toolDiscipline === cat.id;
              return cat.tools.some((t) => t.toLowerCase() === tool.name.toLowerCase());
            });

            if (categoryTools.length === 0) return null;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: catIdx * 0.12 }}
                viewport={{ once: true }}
                className="flex flex-col bg-surface/50 border border-border/70 rounded-3xl p-5 sm:p-6 hover:border-primary/40 transition-all duration-300 shadow-sm"
              >
                {/* Column Discipline Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/60">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary border border-primary/30 flex items-center justify-center shrink-0 shadow-sm">
                    <CatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-extrabold text-secondary tracking-tight truncate">
                      {cat.title}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 inline-block mt-0.5">
                      {cat.badge}
                    </span>
                  </div>
                </div>

                {/* Vertical Stack of Software Cards inside Column */}
                <div className="flex flex-col gap-4 flex-1">
                  {categoryTools.map((tool, index) => (
                    <SoftwareCard key={tool._id || tool.name} tool={tool} index={index} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}