"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ScrollTextRevealProps {
  text: string;
  className?: string;
}

export default function ScrollTextReveal({
  text,
  className = "",
}: ScrollTextRevealProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.88", "end 0.35"],
  });

  const words = text.split(" ");
  const total = words.length;

  return (
    <p
      ref={containerRef}
      className={`flex flex-wrap gap-x-[0.32em] gap-y-[0.25em] text-base sm:text-lg leading-relaxed font-medium ${className}`}
    >
      {words.map((word, i) => {
        const start = i / total;
        const end = Math.min(1, (i + 1.2) / total);

        return (
          <Word
            key={i}
            word={word}
            progress={scrollYProgress}
            range={[start, end]}
          />
        );
      })}
    </p>
  );
}

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: any;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const y = useTransform(progress, range, [8, 0]);

  // Clean punctuation to check keywords
  const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, "");

  const isPrimaryHighlight = [
    "Abdallah",
    "Senior",
    "Graphic",
    "Designer",
    "Web",
    "Developer",
    "5",
    "years",
  ].includes(cleanWord);

  const isSecondaryHighlight = [
    "creative",
    "full-stack",
    "identities",
    "packaging",
    "applications",
    "high-impact",
    "results",
  ].includes(cleanWord);

  return (
    <motion.span
      style={{ opacity, y, willChange: "transform, opacity" }}
      className={`inline-block transition-colors duration-300 select-none cursor-default ${
        isPrimaryHighlight
          ? "text-primary font-bold"
          : isSecondaryHighlight
          ? "text-secondary font-semibold"
          : "text-text-secondary"
      } hover:text-primary hover:scale-105`}
    >
      {word}
    </motion.span>
  );
}
