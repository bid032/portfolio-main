"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PortableText } from "@portabletext/react";
import {
  FaWhatsapp,
  FaArrowLeft,
  FaTimes,
  FaExpand,
  FaChevronLeft,
  FaChevronRight,
  FaExternalLinkAlt,
  FaGlobe,
} from "react-icons/fa";
import { useApp } from "@/context/AppContext";

interface ProjectDetailProps {
  project: {
    title: string;
    category?: string;
    date?: string;
    clientName?: string;
    deliverables?: string[];
    toolsUsed?: string[];
    projectUrl?: string;
    description?: any[];
  };
  coverUrl: string | null;
  galleryItems: {
    src: string;
    width: number;
    height: number;
    origWidth?: number | null;
    origHeight?: number | null;
  }[];
}

export default function ProjectDetailClient({
  project,
  galleryItems,
}: ProjectDetailProps) {
  const { t } = useApp();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Swipe gesture coordinates for touch devices
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const whatsappMessage = encodeURIComponent(
    `Hi Abdallah! I saw your project "${project.title}" on your portfolio and I would like to hire you for a similar project for my brand.`
  );
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=%2B201028463485&text=${whatsappMessage}`;

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === 0 || prev === null ? galleryItems.length - 1 : prev - 1
    );
  }, [selectedIndex, galleryItems.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) =>
      prev === null || prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  }, [selectedIndex, galleryItems.length]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 35;
    const isRightSwipe = distance < -35;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border/80 text-xs sm:text-sm text-text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300 shadow-sm"
        >
          <FaArrowLeft size={12} />
          {t.projectDetail.backBtn}
        </Link>
      </div>

      {/* Project Header Info & Metadata Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-surface border border-border/80 rounded-3xl p-6 sm:p-10 mb-12 shadow-xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {project.category && (
                <span className="px-3.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest">
                  {project.category}
                </span>
              )}
              {project.date && (
                <span className="text-text-muted text-xs font-mono">
                  {new Date(project.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              )}
            </div>

            {/* Live Website Button if URL is provided */}
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/20 hover:bg-primary border border-primary/50 text-primary hover:text-background font-bold text-xs sm:text-sm transition-all duration-300 shadow-[0_0_20px_rgba(245,127,0,0.2)] hover:shadow-[0_0_30px_rgba(245,127,0,0.5)]"
              >
                <FaGlobe size={14} />
                <span>{t.projectDetail.visitLiveSite}</span>
                <FaExternalLinkAlt size={11} className="opacity-80" />
              </a>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-8 leading-tight">
            {project.title}
          </h1>

          {/* Metadata Grid: Deliverables, Client, Tools, Live Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-background/60 border border-border/60 mb-8">
            {project.clientName && (
              <div>
                <span className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                  {t.projectDetail.clientLabel}
                </span>
                <span className="text-sm font-semibold text-secondary">{project.clientName}</span>
              </div>
            )}

            {project.deliverables && project.deliverables.length > 0 && (
              <div>
                <span className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                  {t.projectDetail.deliverablesLabel}
                </span>
                <span className="text-sm text-text-secondary">{project.deliverables.join(", ")}</span>
              </div>
            )}

            {project.toolsUsed && project.toolsUsed.length > 0 && (
              <div>
                <span className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                  {t.projectDetail.toolsLabel}
                </span>
                <span className="text-sm text-text-secondary">{project.toolsUsed.join(", ")}</span>
              </div>
            )}

            {project.projectUrl && (
              <div>
                <span className="block text-[11px] font-bold text-primary uppercase tracking-wider mb-1">
                  {t.projectDetail.websiteUrlLabel}
                </span>
                <a
                  href={project.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline font-mono truncate block"
                >
                  {project.projectUrl.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>

          {/* Project Description */}
          {project.description && (
            <div className="prose prose-invert prose-p:text-text-secondary prose-p:leading-relaxed prose-headings:text-secondary max-w-none">
              <PortableText value={project.description} />
            </div>
          )}
        </motion.div>

        {/* Gallery Section: Mobile Columns / Desktop Clean Grid */}
        {galleryItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-8">
              {t.projectDetail.galleryTitle}
            </h2>

            {/* Mobile Layout (Unchanged columns-1) | Desktop Layout (Balanced Clean Fixed Aspect Grid with Scrollable Preview) */}
            <div className="block lg:hidden columns-1 gap-4 space-y-4">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedIndex(index)}
                  className="break-inside-avoid group relative rounded-2xl overflow-hidden border border-border/80 bg-surface shadow-lg hover:border-primary/60 hover:shadow-[0_10px_30px_rgba(245,127,0,0.18)] cursor-pointer transition-all duration-300"
                >
                  <img
                    src={item.src}
                    alt={`${project.title} - Image ${index + 1}`}
                    width={item.width}
                    height={item.height}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-contain block group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="p-3 rounded-full bg-background/80 text-primary border border-primary/40 backdrop-blur-md">
                      <FaExpand size={14} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Web Layout: Ultra-Clean Grid with smooth thumbnail preview heights */}
            <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6">
              {galleryItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedIndex(index)}
                  className="group relative h-96 rounded-2xl overflow-hidden border border-border/80 bg-surface/90 backdrop-blur-xl shadow-lg hover:border-primary/60 hover:shadow-[0_12px_35px_rgba(245,127,0,0.18)] cursor-pointer transition-all duration-300 flex items-center justify-center p-3"
                >
                  <div className="w-full h-full overflow-hidden rounded-xl bg-background/40 flex items-start justify-center relative">
                    <img
                      src={item.src}
                      alt={`${project.title} - Image ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top block group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                    <span className="p-3.5 rounded-full bg-background/90 text-primary border border-primary/40 backdrop-blur-md shadow-xl group-hover:scale-110 transition-transform">
                      <FaExpand size={16} />
                    </span>
                    <span className="text-xs font-mono font-bold text-secondary bg-surface/90 px-3 py-1 rounded-full border border-border">
                      Click to expand
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Conversion CTA Banner with Live Website Link option */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-surface via-surface to-primary/10 border border-primary/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
              {t.projectDetail.ctaTag}
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-secondary mb-2">
              {t.projectDetail.ctaTitle}
            </h3>
            <p className="text-text-secondary text-sm sm:text-base">
              {t.projectDetail.ctaSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            {project.projectUrl && (
              <a
                href={project.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-surface hover:bg-surface/80 border border-primary/40 text-primary font-bold text-sm tracking-wide rounded-full transition-all duration-300 flex items-center gap-2.5 shrink-0"
              >
                <FaGlobe size={18} />
                {t.projectDetail.visitLiveSite}
              </a>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-[#25d366] text-white font-bold text-sm tracking-wide rounded-full hover:bg-[#20bd5a] hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all duration-300 flex items-center gap-3 shrink-0"
            >
              <FaWhatsapp size={20} />
              {t.projectDetail.ctaBtn}
            </a>
          </div>
        </motion.div>
      </div>

      {/* Lightbox Fullscreen Carousel Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 sm:p-8 select-none"
          >
            {/* Top Bar: Counter & Close Button */}
            <div className="w-full flex items-center justify-between z-50 px-2 pt-1 sm:pt-0">
              <span className="px-3.5 py-1.5 rounded-full bg-surface border border-border/80 text-xs font-mono font-bold text-primary shadow-sm">
                {selectedIndex + 1} / {galleryItems.length}
              </span>

              <button
                onClick={() => setSelectedIndex(null)}
                className="p-2.5 sm:p-3 rounded-full bg-surface border border-border/80 text-secondary hover:text-primary hover:border-primary/50 transition-colors z-50"
                aria-label="Close lightbox"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Main Image View */}
            <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center my-2 sm:my-4 overflow-hidden">
              {/* Previous Button (Desktop / Tablet only) */}
              {galleryItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="hidden sm:flex absolute left-2 sm:left-6 z-50 p-3 sm:p-4 rounded-full bg-surface/80 border border-border/80 text-secondary hover:text-primary hover:scale-110 backdrop-blur-md transition-all shadow-xl"
                  aria-label="Previous image"
                >
                  <FaChevronLeft size={16} />
                </button>
              )}

              {/* Displayed Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="relative max-w-full max-h-[75vh] sm:max-h-[82vh] flex items-center justify-center"
                >
                  <img
                    src={galleryItems[selectedIndex].src}
                    alt={`${project.title} - Visual ${selectedIndex + 1}`}
                    className="max-w-full max-h-[75vh] sm:max-h-[82vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-border/40"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Next Button (Desktop / Tablet only) */}
              {galleryItems.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="hidden sm:flex absolute right-2 sm:right-6 z-50 p-3 sm:p-4 rounded-full bg-surface/80 border border-border/80 text-secondary hover:text-primary hover:scale-110 backdrop-blur-md transition-all shadow-xl"
                  aria-label="Next image"
                >
                  <FaChevronRight size={16} />
                </button>
              )}
            </div>

            {/* Mobile Bottom Navigation Control Bar */}
            <div className="sm:hidden w-full flex flex-col items-center gap-2 pb-2 z-50">
              {galleryItems.length > 1 && (
                <div className="flex items-center gap-4 bg-surface/90 border border-border/80 px-5 py-2 rounded-full shadow-lg backdrop-blur-md">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    className="p-2 text-secondary hover:text-primary active:scale-95 transition-all"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft size={14} />
                  </button>

                  <span className="text-xs font-mono font-bold text-text-secondary">
                    {selectedIndex + 1} of {galleryItems.length}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="p-2 text-secondary hover:text-primary active:scale-95 transition-all"
                    aria-label="Next image"
                  >
                    <FaChevronRight size={14} />
                  </button>
                </div>
              )}
              <span className="text-[10px] text-text-muted opacity-75">
                ← Swipe left or right to flip →
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}