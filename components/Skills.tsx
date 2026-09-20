"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

interface SkillsData {
  items: string[];
}

const softSkillCards = [
  {
    num: "01",
    title: "Creative Problem Solving",
    category: "Strategy & Vision",
    desc: "Translating complex client objectives into clear visual systems and intuitive digital web applications.",
    isHighlight: true,
  },
  {
    num: "02",
    title: "Brand & Visual Strategy",
    category: "Identity Systems",
    desc: "Developing consistent brand style guidelines, color psychology, and typography hierarchies across all touchpoints.",
    isHighlight: true,
  },
  {
    num: "03",
    title: "Creative Team Leadership",
    category: "Management",
    desc: "Mentoring junior designers, managing project timelines, and leading cross-functional creative design sprints.",
    isHighlight: false,
  },
  {
    num: "04",
    title: "Precision & Prepress Detail",
    category: "Quality Control",
    desc: "Flawless prepress color separation, bleed verification, and pixel-perfect UI/UX design execution.",
    isHighlight: false,
  },
  {
    num: "05",
    title: "Agile & Fast Turnaround",
    category: "Execution Speed",
    desc: "Delivering production-grade design and code under tight commercial deadlines without compromising quality.",
    isHighlight: true,
  },
  {
    num: "06",
    title: "Client Pitching & Communication",
    category: "Client Relations",
    desc: "Articulating design decisions clearly to stakeholders and building long-term agency client relationships.",
    isHighlight: false,
  },
];

export default function Skills({ data }: { data: SkillsData | null }) {
  const rawItems = data?.items?.length ? data.items : [];

  const displayCards =
    rawItems.length > 0
      ? rawItems.map((title, idx) => ({
          num: String(idx + 1).padStart(2, "0"),
          title,
          category: "Core Capability",
          desc: "Delivering strategic value through high-quality creative design & full-stack development execution.",
          isHighlight: idx % 3 === 0,
        }))
      : softSkillCards;

  return (
    <SectionWrapper id="skills">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(245,127,0,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Professional Strengths</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-3 tracking-tight"
          >
            Soft Skills & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">Leadership</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-xs sm:text-base max-w-lg mx-auto leading-relaxed font-medium"
          >
            The strategic & collaborative mindset that elevates every project.
          </motion.p>
        </div>

        {/* Icon-Free Typography Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className={`group relative p-6 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                card.isHighlight
                  ? "bg-gradient-to-br from-primary/10 via-surface to-surface border-primary/40 hover:border-primary/80"
                  : "bg-surface/90 border-border/80 hover:border-primary/50"
              }`}
            >
              {/* Subtle Highlight Glow */}
              {card.isHighlight && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
              )}

              {/* Header: Numbering & Category Tag */}
              <div className="relative z-10 flex items-center justify-between gap-3 mb-6">
                <span className="text-2xl font-mono font-black text-primary/40 group-hover:text-primary transition-colors duration-300">
                  {card.num}
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-secondary px-3 py-1 rounded-full bg-background/80 border border-border/80">
                  {card.category}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-secondary font-extrabold text-lg sm:text-xl mb-2.5 group-hover:text-primary transition-colors duration-300 leading-snug">
                  {card.title}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed font-normal">
                  {card.desc}
                </p>
              </div>

              {/* Bottom Accent Bar on Hover */}
              <div className="mt-6 w-full h-[2px] bg-border/40 group-hover:bg-primary/60 transition-colors duration-300 rounded-full" />
            </motion.div>
          ))}
        </div>

      </div>
    </SectionWrapper>
  );
}
