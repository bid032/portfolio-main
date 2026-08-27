"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import SectionWrapper from "./SectionWrapper";
import {
  FaSearch,
  FaLightbulb,
  FaPencilRuler,
  FaRocket,
  FaCode,
  FaLaptopCode,
  FaServer,
  FaCloudUploadAlt,
  FaBolt,
  FaBrain,
  FaMagic,
  FaShareAlt,
  FaCheckCircle,
} from "react-icons/fa";

interface ProcessStep {
  num: string;
  tag: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  glowColor: string;
  borderColor: string;
  accentBg: string;
  numHover: string;
  progressPercent: number;
}

function TypewriterWord({ text, gradient }: { text: string; gradient: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let index = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      index++;
      setDisplayText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className="inline-flex items-center whitespace-nowrap overflow-visible py-1">
      <span
        className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} select-none leading-normal overflow-visible pb-1`}
      >
        {displayText}
      </span>
      <span className="inline-block w-[3px] sm:w-[4px] h-[0.75em] bg-primary rounded-full ml-1 animate-pulse align-middle shrink-0" />
    </span>
  );
}

interface ProcessStep {
  num: string;
  tag: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  glowColor: string;
  borderColor: string;
  accentBg: string;
  numHover: string;
  progressPercent: number;
}

interface MethodologyRole {
  id: string;
  roleTitle: string;
  middleWord: string;
  gradient: string;
  glow: string;
  accentBorder: string;
  activeBadgeBg: string;
  subheading: string;
  steps: ProcessStep[];
}

const methodologies: MethodologyRole[] = [
  {
    id: "designer",
    roleTitle: "Design",
    middleWord: "Design",
    gradient: "from-amber-400 via-orange-500 to-primary",
    glow: "rgba(245, 127, 0, 0.35)",
    accentBorder: "border-primary/50 text-primary bg-primary/10",
    activeBadgeBg: "bg-primary text-black font-extrabold shadow-[0_0_20px_rgba(245,127,0,0.4)]",
    subheading:
      "Strategic 4-step workflow for crafting AI-driven visual assets, brand identities, and commercial packaging.",
    steps: [
      {
        num: "01",
        tag: "Visual Strategy",
        icon: <FaSearch className="text-xs shrink-0" />,
        title: "Visual & Market Strategy",
        desc: "Analyzing brand goals, target audience, competitive market positioning, and visual direction.",
        glowColor: "from-primary/25 via-orange-500/10 to-transparent",
        borderColor: "group-hover:border-primary/60",
        accentBg: "bg-primary/10 border-primary/30 text-primary",
        numHover: "group-hover:text-primary",
        progressPercent: 25,
      },
      {
        num: "02",
        tag: "AI Concepting",
        icon: <FaLightbulb className="text-xs shrink-0" />,
        title: "AI Concept Generation",
        desc: "Harnessing generative AI tools to turn custom creative ideas into fresh, unfamiliar visual assets.",
        glowColor: "from-primary/25 via-orange-500/10 to-transparent",
        borderColor: "group-hover:border-primary/60",
        accentBg: "bg-primary/10 border-primary/30 text-primary",
        numHover: "group-hover:text-primary",
        progressPercent: 50,
      },
      {
        num: "03",
        tag: "Brand Identity",
        icon: <FaPencilRuler className="text-xs shrink-0" />,
        title: "Identity & Packaging",
        desc: "Crafting distinctive logo systems, prepress print files, die-cut packaging, and typography.",
        glowColor: "from-primary/25 via-orange-500/10 to-transparent",
        borderColor: "group-hover:border-primary/60",
        accentBg: "bg-primary/10 border-primary/30 text-primary",
        numHover: "group-hover:text-primary",
        progressPercent: 75,
      },
      {
        num: "04",
        tag: "Final Delivery",
        icon: <FaRocket className="text-xs shrink-0" />,
        title: "Production & Guidelines",
        desc: "Delivering production-ready vector assets, brand style guides, and launch-ready artwork.",
        glowColor: "from-primary/25 via-orange-500/10 to-transparent",
        borderColor: "group-hover:border-primary/60",
        accentBg: "bg-primary/10 border-primary/30 text-primary",
        numHover: "group-hover:text-primary",
        progressPercent: 100,
      },
    ],
  },
  {
    id: "developer",
    roleTitle: "Development",
    middleWord: "Development",
    gradient: "from-cyan-400 via-teal-400 to-emerald-400",
    glow: "rgba(45, 212, 191, 0.35)",
    accentBorder: "border-cyan-500/50 text-cyan-400 bg-cyan-500/10",
    activeBadgeBg: "bg-cyan-400 text-black font-extrabold shadow-[0_0_20px_rgba(45,212,191,0.4)]",
    subheading:
      "Proven 4-step engineering workflow for high-performance, scalable web applications.",
    steps: [
      {
        num: "01",
        tag: "Architecture",
        icon: <FaCode className="text-xs shrink-0" />,
        title: "System Architecture",
        desc: "Defining database schemas, API structures, UX wireframes, and tech stack specifications.",
        glowColor: "from-cyan-500/25 via-teal-500/10 to-transparent",
        borderColor: "group-hover:border-cyan-400/60",
        accentBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        numHover: "group-hover:text-cyan-400",
        progressPercent: 25,
      },
      {
        num: "02",
        tag: "UI Engineering",
        icon: <FaLaptopCode className="text-xs shrink-0" />,
        title: "UI/UX Engineering",
        desc: "Engineering responsive user interfaces, fluid animations, and clean Next.js React components.",
        glowColor: "from-cyan-500/25 via-teal-500/10 to-transparent",
        borderColor: "group-hover:border-cyan-400/60",
        accentBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        numHover: "group-hover:text-cyan-400",
        progressPercent: 50,
      },
      {
        num: "03",
        tag: "Integration",
        icon: <FaServer className="text-xs shrink-0" />,
        title: "Full-Stack Integration",
        desc: "Building robust backend API endpoints, CMS integration, and real-time database operations.",
        glowColor: "from-cyan-500/25 via-teal-500/10 to-transparent",
        borderColor: "group-hover:border-cyan-400/60",
        accentBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        numHover: "group-hover:text-cyan-400",
        progressPercent: 75,
      },
      {
        num: "04",
        tag: "Deployment",
        icon: <FaCloudUploadAlt className="text-xs shrink-0" />,
        title: "QA & Cloud Launch",
        desc: "Cross-browser testing, performance optimization, SEO audit, and continuous Vercel deployment.",
        glowColor: "from-cyan-500/25 via-teal-500/10 to-transparent",
        borderColor: "group-hover:border-cyan-400/60",
        accentBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        numHover: "group-hover:text-cyan-400",
        progressPercent: 100,
      },
    ],
  },
  {
    id: "vibecoder",
    roleTitle: "Vibe Code",
    middleWord: "Vibe Code",
    gradient: "from-purple-400 via-fuchsia-400 to-pink-400",
    glow: "rgba(217, 70, 239, 0.35)",
    accentBorder: "border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10",
    activeBadgeBg: "bg-fuchsia-400 text-black font-extrabold shadow-[0_0_20px_rgba(217,70,239,0.4)]",
    subheading:
      "Rapid 4-step vibe coding methodology for engineering custom workflow tools and web applications.",
    steps: [
      {
        num: "01",
        tag: "Prompt Architecture",
        icon: <FaBolt className="text-xs shrink-0" />,
        title: "Scope & Prompt Spec",
        desc: "Identifying workflow friction points and structuring precise AI prompt architectures.",
        glowColor: "from-purple-500/25 via-fuchsia-500/10 to-transparent",
        borderColor: "group-hover:border-fuchsia-400/60",
        accentBg: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
        numHover: "group-hover:text-fuchsia-400",
        progressPercent: 25,
      },
      {
        num: "02",
        tag: "AI Code Synthesis",
        icon: <FaBrain className="text-xs shrink-0" />,
        title: "AI-Assisted Coding",
        desc: "Utilizing agentic AI coding tools to build full-stack web applications and custom scripts at speed.",
        glowColor: "from-purple-500/25 via-fuchsia-500/10 to-transparent",
        borderColor: "group-hover:border-fuchsia-400/60",
        accentBg: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
        numHover: "group-hover:text-fuchsia-400",
        progressPercent: 50,
      },
      {
        num: "03",
        tag: "Rapid Iteration",
        icon: <FaMagic className="text-xs shrink-0" />,
        title: "Iterative UX Polish",
        desc: "Live testing, refining micro-interactions, resolving edge cases, and polishing interfaces.",
        glowColor: "from-purple-500/25 via-fuchsia-500/10 to-transparent",
        borderColor: "group-hover:border-fuchsia-400/60",
        accentBg: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
        numHover: "group-hover:text-fuchsia-400",
        progressPercent: 75,
      },
      {
        num: "04",
        tag: "Live Deployment",
        icon: <FaShareAlt className="text-xs shrink-0" />,
        title: "Workflow Tool Launch",
        desc: "Deploying intuitive, high-impact web tools and custom automation apps for immediate business impact.",
        glowColor: "from-purple-500/25 via-fuchsia-500/10 to-transparent",
        borderColor: "group-hover:border-fuchsia-400/60",
        accentBg: "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400",
        numHover: "group-hover:text-fuchsia-400",
        progressPercent: 100,
      },
    ],
  },
];

export default function Process() {
  const { t } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Auto rotate methodology every 5 seconds unless paused
  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % methodologies.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const activeMethod = methodologies[activeIdx];

  return (
    <SectionWrapper id="process">
      <div
        className="relative max-w-7xl mx-auto px-3 sm:px-6 py-8"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        {/* Soft Ambient Glow matching active role */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] max-w-full h-80 rounded-full blur-[120px] pointer-events-none -z-10 transition-all duration-700 opacity-50"
          style={{ background: activeMethod.glow }}
        />

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-5 shadow-[0_0_20px_rgba(245,127,0,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>{t.process.badge}</span>
          </motion.div>

          {/* Interactive Role Switcher Tabs with Animated Highlight */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 flex-wrap">
            {methodologies.map((m, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveIdx(idx);
                    setIsAutoPlay(false);
                  }}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${isActive
                      ? m.accentBorder + " shadow-lg scale-105"
                      : "border-border/60 text-text-muted hover:text-secondary hover:border-border"
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isActive && <FaCheckCircle className="text-[10px] animate-pulse" />}
                    {m.roleTitle}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Heading: Fixed 'Strategic' & 'Methodology', Dynamic Middle Word (Strict 1-Line Layout) */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary mb-4 tracking-tight leading-snug py-3 flex items-center justify-center gap-x-2 sm:gap-x-3.5 whitespace-nowrap overflow-visible max-w-full"
          >
            <span className="shrink-0 select-none whitespace-nowrap">Strategic</span>

            <span className="inline-flex items-center justify-center relative overflow-visible py-2 px-1 whitespace-nowrap">
              <TypewriterWord text={activeMethod.middleWord} gradient={activeMethod.gradient} />
            </span>

            <span className="shrink-0 select-none whitespace-nowrap">Methodology</span>
          </motion.h2>

          {/* Dynamic Subheading with Smooth Blur Fade */}
          <div className="min-h-[2.5rem] flex items-center justify-center px-4">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeMethod.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="text-secondary/90 font-medium text-sm sm:text-base max-w-2xl mx-auto leading-relaxed text-center"
              >
                {activeMethod.subheading}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Process Step Cards Grid with Staggered Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMethod.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch"
          >
            {activeMethod.steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 25, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative p-6 sm:p-7 bg-surface/90 backdrop-blur-2xl border border-border/80 rounded-3xl flex flex-col justify-between h-full ${step.borderColor} transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden min-h-[230px]`}
              >
                {/* Ambient Color Glow on Hover */}
                <div
                  className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${step.glowColor} rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700`}
                />

                {/* Top Section: Tag Badge & Numeric Node */}
                <div>
                  <div className="relative z-10 flex items-center justify-between mb-4 gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border shrink-0 ${step.accentBg}`}
                    >
                      {step.icon}
                      <span>{step.tag}</span>
                    </span>

                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono text-text-muted/30 ${step.numHover} transition-colors shrink-0`}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Card Step Title */}
                  <h3 className="relative z-10 text-base sm:text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>

                  {/* Card Step Description */}
                  <p className="relative z-10 text-text-muted font-normal text-xs sm:text-sm leading-relaxed mb-6">
                    {step.desc}
                  </p>
                </div>

                {/* Bottom Step Progress Accent Bar */}
                <div className="relative z-10 w-full pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-[10px] font-mono text-text-muted/60 mb-1.5">
                    <span>STEP {step.num} / 04</span>
                    <span>{step.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-border/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${activeMethod.gradient} transition-all duration-500 group-hover:brightness-125`}
                      style={{ width: `${step.progressPercent}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}

