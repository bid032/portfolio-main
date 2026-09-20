"use client";

import React, { useRef, useEffect, useMemo } from "react";

interface ScrambleTextProps {
  text: string;
  className?: string;
  radius?: number;
  scrambleChars?: string;
  highlightWords?: string[];
}

export default function ScrambleText({
  text,
  className = "",
  radius = 100,
  scrambleChars = ".:",
  highlightWords = [],
}: ScrambleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Array of characters
  const characters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Track active scramble timeouts per character index
    const activeScrambles = new Map<number, NodeJS.Timeout[]>();

    const triggerScramble = (index: number, originalChar: string, dist: number) => {
      // Don't scramble spaces
      if (originalChar === " " || originalChar === "\n") return;

      const element = charRefs.current[index];
      if (!element) return;

      // Clear existing timeouts for this char if already scrambling
      if (activeScrambles.has(index)) {
        activeScrambles.get(index)?.forEach(clearTimeout);
        activeScrambles.delete(index);
      }

      const timeouts: NodeJS.Timeout[] = [];

      // Duration formula from CodePen: 1.2 - (dist / 100) seconds
      const totalDurationMs = Math.max(200, (1.2 - dist / radius) * 1000);
      const stepDuration = 45; // ms per symbol frame
      const steps = Math.max(3, Math.floor(totalDurationMs / stepDuration));

      for (let s = 0; s < steps; s++) {
        const t = setTimeout(() => {
          const randomChar =
            scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
          if (element) {
            element.textContent = randomChar;
            element.classList.add("text-primary");
          }
        }, s * stepDuration);
        timeouts.push(t);
      }

      // Final restore to original character
      const finalT = setTimeout(() => {
        if (element) {
          element.textContent = originalChar;
          element.classList.remove("text-primary");
        }
        activeScrambles.delete(index);
      }, totalDurationMs);
      timeouts.push(finalT);

      activeScrambles.set(index, timeouts);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      charRefs.current.forEach((el, index) => {
        if (!el) return;
        const originalChar = el.getAttribute("data-content") || el.textContent;
        if (!originalChar) return;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dx = mouseX - cx;
        const dy = mouseY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          triggerScramble(index, originalChar, dist);
        }
      });
    };

    container.addEventListener("pointermove", handlePointerMove);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      activeScrambles.forEach((timeouts) => timeouts.forEach(clearTimeout));
    };
  }, [characters, radius, scrambleChars]);

  // Split text by words to wrap each word in whitespace-nowrap container
  const words = useMemo(() => text.split(" "), [text]);

  // Set of lowercase highlight words for O(1) lookup
  const highlightSet = useMemo(() => {
    return new Set(highlightWords.map((w) => w.toLowerCase()));
  }, [highlightWords]);

  let charIndexCounter = 0;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={`select-none cursor-default text-left [direction:ltr] ${className}`}
    >
      <p className="leading-relaxed text-text-secondary text-left [direction:ltr] flex flex-wrap">
        {words.map((word, wordIdx) => {
          const wordChars = word.split("");
          const cleanWord = word.replace(/[^a-zA-Z0-9-&]/g, "").toLowerCase();
          const isHighlighted = highlightSet.has(cleanWord);

          return (
            <React.Fragment key={wordIdx}>
              <span className="inline-block whitespace-nowrap">
                {wordChars.map((char) => {
                  const currentIndex = charIndexCounter++;
                  return (
                    <span
                      key={currentIndex}
                      ref={(el) => {
                        charRefs.current[currentIndex] = el;
                      }}
                      className={`char inline-block will-change-transform transition-colors duration-150 hover:text-primary font-normal ${
                        isHighlighted
                          ? "text-secondary italic"
                          : "text-text-secondary"
                      }`}
                      data-content={char}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
              {wordIdx < words.length - 1 && (
                <span className="inline-block">&nbsp;</span>
              )}
            </React.Fragment>
          );
        })}
      </p>
    </div>
  );
}
