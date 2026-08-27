"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

interface ExperienceItem {
  _id: string;
  role: string;
  company: string;
  duration: string;
  description?: string;
  type?: string;
}

const fallbackExperience: ExperienceItem[] = [
  {
    _id: "1",
    company: "CanGrow Group",
    role: "Team Leader - Graphic Team",
    duration: "Nov 2024 – Apr 2026",
    type: "Full Time",
  },
  {
    _id: "2",
    company: "Creative Corner",
    role: "Mid-Graphic Designer",
    duration: "Nov 2023 – Oct 2024",
    type: "Full Time",
  },
  {
    _id: "3",
    company: "To Print Agency",
    role: "Printing Design Specialist",
    duration: "Feb 2020 – Oct 2023",
    type: "Full Time",
  },
  {
    _id: "4",
    company: "Freelance",
    role: "Freelance Graphic Designer",
    duration: "Jan 2020 – Present",
    type: "Freelance",
  },
];

const typeColors: Record<string, string> = {
  "full-time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Full-Time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Full Time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "full time": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  freelance: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Freelance: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contract: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Contract: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function Experience({ data }: { data?: ExperienceItem[] }) {
  const items = data && data.length > 0 ? data : fallbackExperience;
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [lineHeight, setLineHeight] = useState(0);
  const [lineX, setLineX] = useState(0);

  useEffect(() => {
    const updateMeasurements = () => {
      const firstDot = dotRefs.current[0];
      const lastDot = dotRefs.current[items.length - 1];
      const container = containerRef.current;

      if (firstDot && lastDot && container) {
        const firstDotRect = firstDot.getBoundingClientRect();
        const lastDotRect = lastDot.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const firstCenterY = firstDotRect.top + firstDotRect.height / 2 - containerRect.top;
        const lastCenterY = lastDotRect.top + lastDotRect.height / 2 - containerRect.top;
        const totalHeight = lastCenterY - firstCenterY;

        const centerX = firstDotRect.left + firstDotRect.width / 2 - containerRect.left;

        setLineHeight(Math.max(totalHeight, 10));
        setLineX(centerX);
      }
    };

    updateMeasurements();
    const timer = setTimeout(updateMeasurements, 150);

    window.addEventListener("resize", updateMeasurements);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateMeasurements);
    };
  }, [items.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 80%"],
  });

  const animatedHeight = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, lineHeight]),
    {
      stiffness: 100,
      damping: 30,
      restDelta: 0.001,
    }
  );

  return (
    <SectionWrapper id="experience">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-20">
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
            <span>Career Path</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-4 tracking-tight"
          >
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">Experience</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-xs sm:text-base max-w-lg mx-auto leading-relaxed"
          >
            Where precision design meets technical execution.
          </motion.p>
        </div>

        {/* Timeline Container */}
        <div ref={containerRef} className="relative max-w-4xl mx-auto">

          {/* SVG Vertical Timeline Line - Exact Center Alignment */}
          {lineHeight > 0 && (
            <svg
              className="absolute top-6 left-0 w-full h-full pointer-events-none z-0"
              style={{ overflow: "visible" }}
            >
              {/* Static Background Base Line */}
              <line
                x1={lineX}
                y1={0}
                x2={lineX}
                y2={lineHeight}
                stroke="var(--color-border, rgba(255,255,255,0.15))"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeLinecap="butt"
              />

              {/* Animated Progress Line Overlay */}
              <motion.line
                x1={lineX}
                y1={0}
                x2={lineX}
                y2={animatedHeight}
                stroke="#F57F00"
                strokeWidth="3"
                strokeLinecap="butt"
                style={{
                  filter: "drop-shadow(0px 0px 8px rgba(245, 127, 0, 0.7))",
                }}
              />
            </svg>
          )}

          {/* Timeline Experience Cards */}
          {items.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={item._id || index}
                className="relative flex items-start mb-6 sm:mb-8 last:mb-0"
              >
                {/* Timeline Dot (Ref for pixel-perfect line measurement) */}
                <div
                  ref={(el) => {
                    dotRefs.current[index] = el;
                  }}
                  className="absolute left-3 sm:left-6 md:left-1/2 top-6 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 shadow-[0_0_15px_rgba(245,127,0,0.8)] shrink-0"
                >
                  <span className="animate-ping absolute inset-0 rounded-full bg-primary opacity-60" />
                </div>

                {/* Experience Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  viewport={{ once: true }}
                  className={`w-full pl-8 sm:pl-14 md:pl-0 md:w-[calc(50%-2.5rem)] text-left ${isEven ? "md:mr-auto" : "md:ml-auto"
                    }`}
                >
                  <div className="p-5 sm:p-7 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border/80 shadow-xl hover:border-primary/50 hover:shadow-[0_12px_35px_rgba(245,127,0,0.12)] transition-all duration-300 group">

                    {/* Company & Type Badge */}
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <h3 className="text-secondary font-extrabold text-lg sm:text-xl group-hover:text-primary transition-colors duration-300">
                        {item.company}
                      </h3>
                      {item.type && (
                        <span
                          className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border font-bold shrink-0 ${typeColors[item.type] || typeColors["Full-Time"]
                            }`}
                        >
                          {item.type}
                        </span>
                      )}
                    </div>

                    {/* Role Title */}
                    <p className="text-primary font-bold text-sm sm:text-base mb-1">
                      {item.role}
                    </p>

                    {/* Duration */}
                    <p className="text-text-secondary text-xs font-mono font-medium mb-3">
                      {item.duration}
                    </p>

                    {/* Description */}
                    {item.description && (
                      <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

      </div>
    </SectionWrapper>
  );
}
