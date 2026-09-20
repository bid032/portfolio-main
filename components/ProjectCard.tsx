"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/image";

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  coverImage: any;
  category: string;
  date: string;
}

const formatCategory = (cat: string) => {
  if (!cat) return "DESIGN";
  const c = cat.toLowerCase();
  if (c === "web-dev" || c === "apps" || c.includes("web")) return "Web Development";
  if (c === "branding" || c.includes("brand")) return "Brand Identity";
  if (c === "ui-ux" || c.includes("ui")) return "UI/UX Design";
  if (c === "illustration" || c === "3d" || c.includes("3d") || c.includes("manipulation")) return "3D & Manipulation";
  if (c === "print" || c.includes("packag")) return "Print & Packaging";
  if (c === "digital" || c.includes("social")) return "Digital & Social Media";
  if (c === "motion" || c.includes("video")) return "Motion & Video";
  if (c.includes("typo") || c.includes("calligraphy") || c === "typography") return "Typography";
  if (c === "editorial" || c.includes("layout")) return "Editorial & Layout";
  return cat.toUpperCase();
};

export default function ProjectCard({ project }: { project: Project }) {
  const imageUrl = project.coverImage
    ? urlFor(project.coverImage).width(800).height(600).format("webp").url()
    : null;

  return (
    <Link href={`/projects/${project.slug.current}`}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-surface/90 border border-border/80 cursor-pointer shadow-md hover:shadow-[0_12px_35px_rgba(245,127,0,0.15)] transition-all duration-300"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-background/50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-108"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-surface-hover flex items-center justify-center">
              <span className="text-text-muted text-xs">No Image</span>
            </div>
          )}

          {/* Hover Overlay Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 rounded-2xl border border-primary/0 group-hover:border-primary/50 transition-all duration-500" />
        </div>

        {/* Info Bar */}
        <div className="p-3.5 sm:p-4.5 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
              {formatCategory(project.category)}
            </span>
            <span className="text-text-muted text-[10px] font-mono shrink-0">
              {project.date ? new Date(project.date).getFullYear() : ""}
            </span>
          </div>
          <h3 className="text-secondary text-xs sm:text-sm font-bold truncate group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
}
