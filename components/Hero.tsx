"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MousePointer2, Move, Palette } from "lucide-react";
import { useApp } from "@/context/AppContext";
import Magnetic from "./Magnetic";
import { urlFor } from "@/sanity/image";

interface MetricItem {
  value: string;
  label: string;
}

const fallbackMetrics: MetricItem[] = [
  { value: "5+", label: "Years Experience" },
  { value: "120+", label: "Completed Projects" },
  { value: "99%", label: "Client Satisfaction" },
  { value: "24/7", label: "Fast Turnaround" },
];

function AnimatedMetricCard({
  value,
  label,
  isMobile = false,
}: {
  value: string;
  label: string;
  isMobile?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  const match = value.match(/^(\d+)(.*)$/);
  const targetNumber = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";

  useEffect(() => {
    if (!isInView) return;

    if (targetNumber !== null && !isNaN(targetNumber)) {
      let start = 0;
      const duration = 1200;
      const steps = Math.min(targetNumber, 45);
      const stepTime = duration / steps;
      const increment = targetNumber / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= targetNumber) {
          setDisplayValue(`${targetNumber}${suffix}`);
          clearInterval(timer);
        } else {
          setDisplayValue(`${Math.floor(start)}${suffix}`);
        }
      }, stepTime);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [isInView, value, targetNumber, suffix]);

  return (
    <motion.div
      ref={ref}
      whileHover={{ y: -5, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 450, damping: 15 }}
      className={`group relative overflow-hidden rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md transition-all duration-300 hover:border-primary/70 hover:bg-surface/80 hover:shadow-[0_12px_30px_rgba(245,127,0,0.2)] ${isMobile ? "text-center p-2.5" : "text-left p-3.5"
        }`}
    >
      {/* Top Accent Glow Bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/0 to-transparent transition-all duration-500 group-hover:via-primary" />

      {/* Dynamic Animated Number */}
      <motion.span
        className={`block font-black text-primary font-mono leading-none tracking-tight transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-[0_0_15px_rgba(245,127,0,0.6)] ${isMobile ? "text-xl xs:text-2xl" : "text-2xl sm:text-3xl"
          }`}
      >
        {displayValue}
      </motion.span>

      {/* Label */}
      <span
        className={`block text-text-secondary mt-1 font-medium leading-tight transition-colors duration-200 group-hover:text-secondary ${isMobile ? "text-[10px]" : "text-xs"
          }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

function InteractiveSubtitle({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <div className={className}>
      {words.map((word, wIdx) => (
        <span key={`sub-w-${wIdx}`} className="inline-block whitespace-nowrap mr-[0.3em] py-1">
          {word.split("").map((char, cIdx) => (
            <motion.span
              key={`sub-c-${wIdx}-${cIdx}`}
              className="inline-block hover:text-primary transition-colors duration-150 cursor-pointer select-none"
              whileHover={{
                scale: 1.25,
                y: -6,
                rotate: (wIdx + cIdx) % 2 === 0 ? -5 : 5,
              }}
              transition={{
                type: "spring",
                stiffness: 450,
                damping: 12,
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
}

export default function Hero({ data }: { data?: any }) {
  const { t, theme } = useApp();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const metrics: MetricItem[] =
    data?.metrics && data.metrics.length > 0
      ? data.metrics
      : fallbackMetrics;

  const logoSrc = data?.logo
    ? urlFor(data.logo)?.url()
    : theme === "dark"
      ? "/Photos/Logo/Light.svg"
      : "/Photos/Logo/Dark.svg";

  const firstName = "ABDALLAH".split("");
  const lastName = "AHMED".split("");

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 sm:pt-24 sm:pb-16 lg:py-0 overflow-hidden">
      {/* Background Radial Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 lg:left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[250px] sm:w-[450px] h-[250px] sm:h-[450px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      {/* ========================================================= */}
      {/*  MOBILE DEDICATED LAYOUT (< lg screens)                 */}
      {/* ========================================================= */}
      <div className="lg:hidden relative z-10 max-w-lg mx-auto w-full flex flex-col items-center text-center px-4">

        {/* Availability Badge */}
        <div ref={badgeRef} className="inline-block mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/90 border border-primary/40 backdrop-blur-md shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary">
              {t.hero.badge}
            </span>
          </div>
        </div>

        {/* Compact Vector Monogram Logo Card */}
        <div className="vector-canvas-box relative w-44 h-44 xs:w-52 xs:h-52 my-3 bg-surface/70 border-2 border-primary rounded-none p-4 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl overflow-visible">
          {/* Vector Corner Anchors */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-white rounded-none" />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-white rounded-none" />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-white rounded-none" />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-white rounded-none" />

          {/* Dimension Tooltip */}
          <div className="absolute -top-3 right-3 bg-surface/95 border border-primary/50 px-2 py-0.5 rounded text-[9px] font-mono text-primary font-bold shadow-md">
            W: 1054px
          </div>

          {/* SVG Monogram (Enlarged inside card) */}
          <div className="w-36 xs:w-44 h-36 xs:h-44 flex items-center justify-center p-0.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt="Abdallah Ahmed Logo"
              className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(245,127,0,0.35)]"
            />
          </div>

          {/* Mobile Animated Cursors */}
          <motion.div
            animate={{
              x: [0, 10, -8, 0],
              y: [0, -8, 6, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-3 left-2 z-20 flex items-center gap-1 pointer-events-none"
          >
            <MousePointer2 className="w-3.5 h-3.5 text-primary fill-primary drop-shadow-sm" />
            <span className="bg-primary text-background font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
              Abdallah
            </span>
          </motion.div>

          <motion.div
            animate={{
              x: [0, -10, 8, 0],
              y: [0, 8, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
            className="absolute bottom-3 right-2 z-20 flex items-center gap-1 pointer-events-none"
          >
            <MousePointer2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 drop-shadow-sm" />
            <span className="bg-blue-500 text-white font-mono text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
              Next.js
            </span>
          </motion.div>

          {/* Compact Inspector Badge */}
          <div className="absolute -bottom-3 bg-surface/95 border border-border px-3 py-1 rounded-lg shadow-lg text-[9px] font-mono text-text-secondary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span className="font-bold text-secondary">#F57F00</span>
          </div>
        </div>

        {/* Mobile Title (ABDALLAH AHMED Stacked) */}
        <h1
          ref={titleRef}
          className="flex flex-col items-center font-black leading-[0.92] tracking-tight text-secondary w-full my-3"
        >
          <span className="block text-[11vw] xs:text-[12vw] sm:text-6xl text-secondary uppercase font-extrabold tracking-tight whitespace-nowrap">
            {firstName.map((char, index) => (
              <motion.span
                key={`first-mob-${index}`}
                className="inline-block text-secondary hover:text-primary transition-colors duration-150 cursor-pointer select-none"
                whileHover={{
                  scale: 1.25,
                  y: -10,
                  rotate: index % 2 === 0 ? -6 : 6,
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 12,
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
          <span className="block text-[11vw] xs:text-[12vw] sm:text-6xl text-primary uppercase font-black tracking-tight whitespace-nowrap">
            {lastName.map((char, index) => (
              <motion.span
                key={`last-mob-${index}`}
                className="inline-block text-primary cursor-pointer select-none"
                whileHover={{
                  scale: 1.25,
                  y: -10,
                  rotate: index % 2 === 0 ? 6 : -6,
                }}
                transition={{
                  type: "spring",
                  stiffness: 450,
                  damping: 12,
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* Mobile Subtitle with Interactive Letter Hover */}
        <InteractiveSubtitle
          text={t.hero.subtitle}
          className="text-xs xs:text-sm text-text-secondary tracking-[0.1em] uppercase font-semibold max-w-xs justify-center"
        />

        {/* Mobile Action Buttons */}
        <div ref={ctaRef} className="mt-6 w-full max-w-xs space-y-2.5">
          <a
            href="#contact"
            className="w-full block text-center py-3.5 bg-primary text-background font-bold text-xs tracking-wider uppercase rounded-xl shadow-[0_0_25px_rgba(245,127,0,0.35)] active:scale-95 transition-all"
          >
            {t.hero.contact}
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="#projects"
              className="w-full block text-center py-3 border border-primary/40 bg-primary/10 text-primary font-bold text-[11px] tracking-wide rounded-xl active:scale-95 transition-all truncate px-1"
            >
              {t.hero.viewWork}
            </a>

            <a
              href="https://drive.google.com/drive/u/0/folders/1j8fz91fXITKVRXUyxVzwJT3EEdQ6F9sY"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center py-3 border border-primary/40 bg-primary/10 text-primary font-bold text-[11px] tracking-wide rounded-xl active:scale-95 transition-all truncate px-1"
            >
              {t.hero.cvPortfolio}
            </a>
          </div>
        </div>

        {/* Mobile Compact Metrics Bar */}
        <div className="mt-8 pt-6 border-t border-border/50 grid grid-cols-2 gap-2.5 w-full max-w-xs">
          {metrics.map((m, i) => (
            <AnimatedMetricCard key={`mob-m-${i}`} value={m.value} label={m.label} isMobile={true} />
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/*  DESKTOP DEDICATED LAYOUT (>= lg screens)               */}
      {/* ========================================================= */}
      <div className="hidden lg:grid relative z-10 max-w-7xl mx-auto px-6 grid-cols-12 gap-12 items-center w-full">

        {/* LEFT COLUMN: DESKTOP HEADLINE & CTA */}
        <div className="col-span-7 flex flex-col items-start text-left">

          {/* Desktop Badge */}
          <div className="inline-block mb-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface/90 border border-primary/40 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
                {t.hero.badge}
              </span>
            </div>
          </div>

          {/* Desktop Headline */}
          <h1 className="flex flex-col items-start font-black leading-[0.92] tracking-tight text-secondary w-full py-1">
            <span className="block text-[5.5rem] xl:text-[6.8rem] text-secondary uppercase font-extrabold tracking-tight">
              {firstName.map((char, index) => (
                <motion.span
                  key={`first-desk-${index}`}
                  className="inline-block text-secondary hover:text-primary transition-colors duration-150 cursor-pointer select-none"
                  whileHover={{
                    scale: 1.25,
                    y: -14,
                    rotate: index % 2 === 0 ? -6 : 6,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 12,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
            <span className="block text-[5.5rem] xl:text-[6.8rem] text-primary uppercase font-black tracking-tight">
              {lastName.map((char, index) => (
                <motion.span
                  key={`last-desk-${index}`}
                  className="inline-block text-primary cursor-pointer select-none"
                  whileHover={{
                    scale: 1.25,
                    y: -14,
                    rotate: index % 2 === 0 ? 6 : -6,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 12,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Desktop Subtitle with Interactive Letter Hover */}
          <InteractiveSubtitle
            text={t.hero.subtitle}
            className="mt-6 text-lg text-text-secondary tracking-[0.14em] uppercase font-semibold max-w-xl"
          />

          {/* Desktop CTAs (Get in Touch is 1st & Primary) */}
          <div className="mt-10 w-full">
            <div className="flex flex-wrap gap-4 items-center">
              <Magnetic amount={0.25}>
                <a
                  href="#contact"
                  className="px-8 py-4 bg-primary text-background font-bold text-sm tracking-wide rounded-xl hover:bg-primary-dark hover:shadow-[0_0_35px_rgba(245,127,0,0.45)] transition-all duration-300 block"
                >
                  {t.hero.contact}
                </a>
              </Magnetic>

              <Magnetic amount={0.25}>
                <a
                  href="#projects"
                  className="px-8 py-4 border border-primary/40 bg-primary/10 text-primary font-bold text-sm tracking-wide rounded-xl hover:bg-primary hover:text-background transition-all duration-300 block"
                >
                  {t.hero.viewWork}
                </a>
              </Magnetic>

              <Magnetic amount={0.25}>
                <a
                  href="https://drive.google.com/drive/u/0/folders/1j8fz91fXITKVRXUyxVzwJT3EEdQ6F9sY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-4 border border-primary/40 bg-primary/10 text-primary font-bold text-sm tracking-wide rounded-xl hover:bg-primary hover:text-background transition-all duration-300 block"
                >
                  {t.hero.cvPortfolio}
                </a>
              </Magnetic>
            </div>

            {/* Desktop Metrics Bar */}
            <div className="mt-12 pt-8 border-t border-border/40 grid grid-cols-4 gap-3 max-w-2xl">
              {metrics.map((m, i) => (
                <AnimatedMetricCard key={`desk-m-${i}`} value={m.value} label={m.label} isMobile={false} />
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: DESKTOP VECTOR CANVAS WORKSPACE */}
        <div className="col-span-5 flex justify-center items-center">
          <div className="vector-canvas-box relative w-full max-w-md aspect-square bg-surface/60 border-2 border-primary rounded-none p-5 flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl overflow-visible group">

            {/* Vector Corner Anchor Handles */}
            <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-none shadow-md" />
            <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-none shadow-md" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-none shadow-md" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-primary border-2 border-white rounded-none shadow-md" />

            {/* Rotation Handle */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-md" />
              <div className="w-0.5 h-5 bg-primary/60" />
            </div>

            {/* Dimension Tooltip */}
            <div className="absolute -top-4 right-6 bg-surface/90 border border-primary/50 px-3 py-1 rounded-md text-[10px] font-mono text-primary font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
              <Move className="w-3 h-3 text-primary animate-pulse" />
              <span>W: 1054px • H: 921px</span>
            </div>

            {/* OFFICIAL SVG LOGO CENTERPIECE (Enlarged logo inside max-w-md box) */}
            <div className="relative z-10 w-80 h-80 sm:w-[21rem] sm:h-[21rem] flex items-center justify-center p-1 transition-transform duration-500 group-hover:scale-105">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt="Abdallah Ahmed Logo"
                className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(245,127,0,0.3)]"
              />
            </div>

            {/* Animated Designer Cursor */}
            <motion.div
              animate={{
                x: [0, 15, -10, 0],
                y: [0, -12, 8, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-10 left-6 z-20 flex items-center gap-1.5 pointer-events-none"
            >
              <MousePointer2 className="w-5 h-5 text-primary fill-primary drop-shadow-md" />
              <span className="bg-primary text-background font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                Abdallah (Design)
              </span>
            </motion.div>

            {/* Animated Developer Cursor */}
            <motion.div
              animate={{
                x: [0, -18, 12, 0],
                y: [0, 10, -15, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-12 right-6 z-20 flex items-center gap-1.5 pointer-events-none"
            >
              <MousePointer2 className="w-5 h-5 text-blue-500 fill-blue-500 drop-shadow-md" />
              <span className="bg-blue-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-lg">
                Code (Next.js)
              </span>
            </motion.div>

            {/* Bottom Design Inspector Panel */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-surface/90 border border-border px-4 py-2 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-3 z-20 whitespace-nowrap">
              <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                <Palette className="w-3.5 h-3.5 text-primary" />
                <span>Fill:</span>
                <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                <span className="font-bold text-secondary">#F57F00</span>
              </div>
              <div className="w-[1px] h-3 bg-border" />
              <div className="text-xs font-mono text-text-secondary">
                Mode: <span className="text-secondary font-semibold">Vector Path</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
