"use client";

import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import SectionWrapper from "./SectionWrapper";
import { FaGraduationCap } from "react-icons/fa";

interface EducationItem {
  _id: string;
  university: string;
  degree: string;
  year: string;
}

const fallbackEducation: EducationItem[] = [
  {
    _id: "1",
    university: "Zagazig University",
    degree: "Bachelor's Degree",
    year: "2019 - 2023",
  },
  {
    _id: "2",
    university: "Brand & Visual Identity Specialization",
    degree: "Advanced Graphic Design Certification",
    year: "2020",
  },
];

export default function Education({ data }: { data: EducationItem[] }) {
  const { t } = useApp();
  const items = data?.length > 0 ? data : fallbackEducation;

  return (
    <SectionWrapper id="education">
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
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
            <span>Academic & Credentials</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-secondary mb-4 tracking-tight"
          >
            Education & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">Qualifications</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-xs sm:text-base max-w-lg mx-auto leading-relaxed"
          >
            {t.education.subheading}
          </motion.p>
        </div>

        {/* Cards Container centered */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6 max-w-4xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="w-full md:w-1/2 p-6 sm:p-8 bg-surface/90 backdrop-blur-xl border border-border/80 rounded-3xl flex flex-col justify-between hover:border-primary/60 hover:shadow-[0_12px_40px_rgba(245,127,0,0.16)] transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-primary font-mono text-xs font-bold px-3 py-1 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
                    {item.year}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                    <FaGraduationCap size={16} />
                  </div>
                </div>

                <h3 className="text-secondary text-lg sm:text-xl font-extrabold mb-2 group-hover:text-primary transition-colors">
                  {item.degree}
                </h3>
                <p className="text-text-secondary text-xs sm:text-sm font-medium leading-relaxed">
                  {item.university}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
