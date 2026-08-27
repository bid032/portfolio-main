"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/image";
import { useApp } from "@/context/AppContext";
import SectionWrapper from "./SectionWrapper";
import RotatingTitle from "./RotatingTitle";
import ScrambleText from "./ScrambleText";

import { TbSparkles } from "react-icons/tb";
import { FaAward, FaBriefcase, FaCheckCircle, FaClock } from "react-icons/fa";

interface AboutProps {
  data: {
    bio?: any;
    skillsText?: string;
    profileImage?: any;
  } | null;
}

const disciplines = [
  {
    num: "01",
    tag: "AI & Visual Strategy",
    titleLine1: "AI-Powered",
    titleLine2: "Brand & Visuals",
    title: "AI-Powered Brand & Visuals",
    description:
      "Leveraging generative AI tools to turn complex creative visions into custom, unfamiliar stock imagery, distinctive logo systems, and brand identities.",
    glowColor: "from-primary/20 via-orange-500/10 to-transparent",
    borderColor: "group-hover:border-primary/60",
    accentBg: "bg-primary/10 border-primary/30 text-primary",
  },
  {
    num: "02",
    tag: "Vibe Coding & Web",
    titleLine1: "Full-Stack Web",
    titleLine2: "& Workflow Tools",
    title: "Full-Stack Web & Workflow Tools",
    description:
      "Practicing vibe coding and modern full-stack development to build custom web apps, workflow tools, and interactive digital products.",
    glowColor: "from-cyan-500/20 via-teal-500/10 to-transparent",
    borderColor: "group-hover:border-cyan-500/60",
    accentBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
  },
  {
    num: "03",
    tag: "Production Ready",
    titleLine1: "Print &",
    titleLine2: "Packaging Design",
    title: "Print & Packaging Design",
    description:
      "High-precision prepress, die-cut packaging, commercial brochures, and print collateral engineered for flawless physical execution.",
    glowColor: "from-emerald-500/20 via-teal-500/10 to-transparent",
    borderColor: "group-hover:border-emerald-500/60",
    accentBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    num: "04",
    tag: "Digital Compositing",
    titleLine1: "Photo Manipulation",
    titleLine2: "& Campaign Art",
    title: "Photo Manipulation & Campaign Art",
    description:
      "Advanced digital compositing, creative image editing, lighting manipulation, and surreal artwork for high-impact commercial campaigns.",
    glowColor: "from-purple-500/20 via-amber-500/10 to-transparent",
    borderColor: "group-hover:border-purple-500/60",
    accentBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
  },
];

const highlights = [
  { icon: <FaBriefcase className="text-primary" />, label: "5+ Years Experience" },
  { icon: <FaAward className="text-orange-400" />, label: "100+ Completed Projects" },
  { icon: <FaCheckCircle className="text-emerald-400" />, label: "99% Client Satisfaction" },
  { icon: <FaClock className="text-amber-400" />, label: "1-Hour Response Time" },
];

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  r: number;
  time: number;
}

export default function About({ data }: AboutProps) {
  const { t } = useApp();
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const lastAddRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Continuously fade & clean up trail points (1 second gradual fade out)
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      setTrail((prev) => {
        const valid = prev.filter((p) => now - p.time < 1000);
        if (valid.length !== prev.length) return valid;
        return prev;
      });
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastAddRef.current < 10) return;
    lastAddRef.current = now;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTrail((prev) => [
      ...prev.slice(-45),
      {
        id: Math.random(),
        x,
        y,
        r: 50,
        time: now,
      },
    ]);
  };

  const handleMouseLeave = () => {
    setTrail([]);
  };

  const profileImageUrl = data?.profileImage
    ? urlFor(data.profileImage)?.width(600).height(750).url()
    : "/Photos/About/01.webp";

  const now = Date.now();

  return (
    <SectionWrapper id="about">
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">

        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

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
            <span>{t.about.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-secondary mb-4 tracking-tight leading-tight max-w-5xl mx-auto flex flex-wrap items-center justify-center text-center gap-x-[0.35em]"
          >
            <span>Your Creative</span>
            <RotatingTitle />
          </motion.h2>
        </div>

        {/* Creative Bento Box Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-16 sm:mb-24">

          {/* Bento Card 1: Interactive Profile & Badge (4 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-4 relative group"
          >
            <div className="h-full p-1.5 rounded-3xl bg-gradient-to-b from-primary/30 via-border/50 to-primary/10 border border-border/80 shadow-2xl hover:border-primary/60 transition-all duration-500 flex flex-col">
              <div
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-2xl overflow-hidden bg-surface flex-1 cursor-pointer"
              >
                {/* Base Visible Image 01.webp */}
                <Image
                  src={profileImageUrl || "/Photos/About/01.webp"}
                  alt="Abdallah Ahmed - Senior Graphic Designer"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />

                {/* Dynamic Mouse Motion Fluid Brush Trail Mask (Negative Image Reveal) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  <defs>
                    <mask id="mouse-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                      <rect width="100%" height="100%" fill="black" />

                      {/* Connected SVG lines between points for 100% continuous unbroken stroke */}
                      {trail.map((p, idx) => {
                        if (idx === 0) return null;
                        const prevPoint = trail[idx - 1];
                        const elapsed = now - p.time;
                        const progress = Math.min(1, elapsed / 1000);
                        const opacity = Math.max(0, 1 - progress);
                        const radius = p.r * (1 - progress * 0.3);

                        return (
                          <line
                            key={`line-${p.id}`}
                            x1={prevPoint.x}
                            y1={prevPoint.y}
                            x2={p.x}
                            y2={p.y}
                            stroke="white"
                            strokeWidth={radius * 2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity={opacity}
                          />
                        );
                      })}

                      {/* Vertex circles for ultra-smooth rounded joints */}
                      {trail.map((p) => {
                        const elapsed = now - p.time;
                        const progress = Math.min(1, elapsed / 1000);
                        const opacity = Math.max(0, 1 - progress);
                        const radius = p.r * (1 - progress * 0.3);

                        return (
                          <circle
                            key={`circle-${p.id}`}
                            cx={p.x}
                            cy={p.y}
                            r={radius}
                            fill="white"
                            opacity={opacity}
                          />
                        );
                      })}
                    </mask>
                  </defs>

                  <g mask="url(#mouse-trail-mask)">
                    <foreignObject x="0" y="0" width="100%" height="100%">
                      <div className="relative w-full h-full" style={{ filter: "invert(1)" }}>
                        <Image
                          src={profileImageUrl || "/Photos/About/01.webp"}
                          alt="Abdallah Ahmed - Negative Trail Reveal"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      </div>
                    </foreignObject>
                  </g>
                </svg>

                {/* Floating Availability Badge at Bottom-Center */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/90 backdrop-blur-md border border-border text-secondary text-xs font-bold shadow-2xl z-30 whitespace-nowrap">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Available for Projects</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Narrative Story & Highlights (8 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            viewport={{ once: true }}
            className="lg:col-span-8 flex flex-col justify-between p-6 sm:p-9 bg-surface/90 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-xl hover:border-primary/40 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Story & Philosophy
                </span>
                {/* <span className="text-xs font-mono text-text-muted font-semibold">Est. 2020</span> */}
              </div>

              {data?.bio ? (
                <div className="prose prose-invert prose-p:text-text-secondary prose-p:text-base sm:prose-p:text-lg prose-p:leading-relaxed max-w-none">
                  <PortableText value={data.bio} />
                </div>
              ) : (
                <ScrambleText
                  text={t.about.bio}
                  scrambleChars=".:"
                  radius={100}
                  className="text-base sm:text-lg text-left"
                  highlightWords={[
                    "Abdallah",
                    "Senior",
                    "Graphic",
                    "Designer",
                    "&",
                    "Web",
                    "Developer",
                    "5",
                    "years",
                    "AI",
                    "tools",
                    "fresh",
                    "visual",
                    "identities",
                    "vibe",
                    "coding",
                    "web",
                    "applications",
                    "workflow",
                    "solutions",
                  ]}
                />
              )}

              {data?.skillsText && (
                <div className="mt-4 p-4 rounded-2xl bg-background/80 border border-border/80">
                  <p className="text-secondary font-medium text-xs sm:text-sm leading-relaxed">
                    {data.skillsText}
                  </p>
                </div>
              )}

              {/* Horizontal Divider Line between Bio text & Metrics */}
              <div className="w-full h-[1px] bg-border/60 my-5 sm:my-6" />

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-5">
                {highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-2xl bg-surface-hover/80 border border-border/60 flex items-center justify-center sm:justify-start gap-2.5 hover:border-primary/40 transition-colors"
                  >
                    <div className="text-base shrink-0">{item.icon}</div>
                    <span className="text-xs font-bold text-secondary leading-snug">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eye-Catching Call-to-Action Bar (Links to Contact Section) */}
            <div className="pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-text-secondary text-center sm:text-left">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Ready to bring your brand or web app to life?</span>
              </div>
              <a
                href="#contact"
                className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-background text-xs sm:text-sm font-black uppercase tracking-widest shadow-[0_0_30px_rgba(245,127,0,0.55)] hover:shadow-[0_0_45px_rgba(245,127,0,0.85)] transition-all duration-300 transform hover:scale-105 active:scale-95 w-full sm:w-auto shrink-0"
              >
                <span>Get In Touch</span>
                <span className="text-sm font-black group-hover:translate-x-1 transition-transform duration-300">→</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Ultra-Creative Core Disciplines Bento Cards */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-secondary tracking-tight">
              Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">Design Disciplines</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {disciplines.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`group relative p-7 bg-surface/90 backdrop-blur-2xl border border-border/80 rounded-3xl flex flex-col justify-between ${item.borderColor} transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden`}
              >
                {/* Background Ambient Color Glow */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${item.glowColor} rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700`} />

                {/* Top Bar: Tag & Number Node */}
                <div className="relative z-10 flex items-center justify-between mb-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${item.accentBg}`}>
                    {item.tag}
                  </span>
                  <span className="text-4xl font-black font-mono text-text-muted/30 group-hover:text-primary/40 transition-colors">
                    {item.num}
                  </span>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                  <h4 className="text-secondary font-extrabold text-lg sm:text-xl mb-3 leading-tight group-hover:text-primary transition-colors flex flex-col min-h-[3.25rem] justify-end">
                    <span className="block">{item.titleLine1}</span>
                    <span className="block">{item.titleLine2}</span>
                  </h4>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}