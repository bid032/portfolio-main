"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const roles = [
  {
    text: "Designer",
    gradient: "from-primary via-orange-400 to-amber-300",
    glow: "rgba(245, 127, 0, 0.45)",
    cursorColor: "#f57f00",
  },
  {
    text: "Developer",
    gradient: "from-cyan-400 via-teal-400 to-emerald-400",
    glow: "rgba(45, 212, 191, 0.45)",
    cursorColor: "#2dd4bf",
  },
  {
    text: "Vibe Coder",
    gradient: "from-purple-400 via-fuchsia-400 to-pink-400",
    glow: "rgba(217, 70, 239, 0.45)",
    cursorColor: "#d946ef",
  },
];

export default function RotatingTitle() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const cursorRef = useRef<HTMLSpanElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const currentRole = roles[roleIndex];
  const fullText = currentRole.text;
  const currentText = fullText.substring(0, subIndex);

  // GSAP Blinking & Color Pulsing Cursor
  useEffect(() => {
    if (!cursorRef.current) return;

    const blinkAnim = gsap.to(cursorRef.current, {
      opacity: 0.1,
      repeat: -1,
      yoyo: true,
      duration: 0.5,
      ease: "power2.inOut",
    });

    return () => {
      blinkAnim.kill();
    };
  }, []);

  // Update glow effect on role change
  useEffect(() => {
    if (!glowRef.current) return;

    gsap.to(glowRef.current, {
      opacity: 0.85,
      scale: 1.1,
      duration: 0.4,
      ease: "power2.out",
    });
  }, [roleIndex]);

  // Typewriter Engine Logic (Type -> Pause -> Erase -> Cycle)
  useEffect(() => {
    // Finished typing the word -> pause then start erasing
    if (!isDeleting && subIndex === fullText.length) {
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1800); // Pause for 1.8s
      return () => clearTimeout(timeout);
    }

    // Finished erasing word -> switch role & start typing
    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setRoleIndex((prev) => (prev + 1) % roles.length);
      return;
    }

    // Typing speed vs Erasing speed
    const speed = isDeleting ? 45 : 90;

    const timer = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [subIndex, isDeleting, fullText, roleIndex]);

  return (
    <span className="relative inline-flex items-center justify-center py-1 select-none min-h-[1.2em]">
      {/* Background Ambient Glow tailored to active role */}
      <div
        ref={glowRef}
        className="absolute inset-0 -z-10 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${currentRole.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Styled Typed Text Container */}
      <span className="inline-flex items-center text-transparent bg-clip-text bg-gradient-to-r font-extrabold whitespace-nowrap drop-shadow-sm pb-1">
        <span className={`bg-clip-text bg-gradient-to-r ${currentRole.gradient} inline-flex items-center`}>
          <span>{currentText}</span>

          {/* Blinking Typewriter Cursor with Matching Accent Glow */}
          <span
            ref={cursorRef}
            className="inline-block ml-1 sm:ml-1.5 w-[3px] sm:w-[4px] h-[0.75em] rounded-full align-middle shadow-lg"
            style={{
              backgroundColor: currentRole.cursorColor,
              boxShadow: `0 0 10px ${currentRole.cursorColor}`,
            }}
          />
        </span>
      </span>
    </span>
  );
}
