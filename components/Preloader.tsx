"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";

const r1 = ["Hello", "Bonjour", "Hola", "Ciao", "Olá", "Konnichiwa", "Nǐ Hǎo", "Namaste"];
const r2 = ["Merhaba", "Privet", "Shalom", "Guten Tag", "Aloha", "Selamat", "Annyeong"];
const r3 = ["Sawasdee", "Yassas", "Xin Chào", "Cześć", "Dobry Den", "أهلاً", "Welcome"];

const allRows = [r1, r2, r3, r1, r2, r3, r1, r2];

export default function Preloader() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  const isHomePage = pathname === "/";
  const firstWord = "ABDALLAH";
  const secondWord = "AHMED";

  useEffect(() => {
    if (typeof window === "undefined" || !isHomePage) return;

    // Fast & Snappy Typewriter Effect (35ms per step)
    let totalStep = 0;
    const typingTimer = setInterval(() => {
      if (totalStep <= firstWord.length) {
        setText1(firstWord.slice(0, totalStep));
      } else if (totalStep <= firstWord.length + secondWord.length) {
        setText2(secondWord.slice(0, totalStep - firstWord.length));
      } else {
        clearInterval(typingTimer);
      }
      totalStep++;
    }, 35);

    const ctx = gsap.context(() => {
      // 1. Lightweight Row Marquee Animation (GPU accelerated on 8 row containers only)
      if (rowsRef.current) {
        const strips = rowsRef.current.querySelectorAll(".ticker-strip");
        strips.forEach((strip, index) => {
          const direction = index % 2 === 0 ? -1 : 1;
          const duration = 16 + (index % 3) * 3;

          gsap.to(strip, {
            xPercent: direction * 40,
            duration: duration,
            repeat: -1,
            ease: "none",
            force3D: true,
          });
        });
      }

      // 2. Central Name Entrance
      if (centerTextRef.current) {
        gsap.fromTo(
          centerTextRef.current,
          { scale: 0.85, opacity: 0, filter: "blur(12px)" },
          { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.4, ease: "power2.out" }
        );
      }

      // 3. Fast Exit Reveal Timeline (Total duration ~1.3s)
      const tl = gsap.timeline({
        delay: 0.95,
        onComplete: () => {
          setIsLoading(false);
        },
      });

      // Character fall & curtain lift
      tl.to(".falling-char", {
        y: "75vh",
        rotation: (index) => (index % 2 === 0 ? 25 : -25),
        scale: 0.85,
        duration: 0.45,
        stagger: 0.02,
        ease: "power2.in",
      })
        .to(
          rowsRef.current,
          {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
          },
          "-=0.3"
        )
        .to(containerRef.current, {
          yPercent: -100,
          duration: 0.55,
          ease: "power4.inOut",
        });
    }, containerRef);

    return () => {
      clearInterval(typingTimer);
      ctx.revert();
    };
  }, [isHomePage]);

  if (!isHomePage || !isLoading) return null;

  const isTypingSecond = text1.length >= firstWord.length && text2.length < secondWord.length;

  return (
    <AnimatePresence>
      <div
        ref={containerRef}
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-background overflow-hidden select-none pointer-events-auto"
      >
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] sm:w-[50rem] sm:h-[50rem] bg-primary/10 rounded-full blur-[130px] pointer-events-none" />

        {/* Lightweight Background Ticker Rows */}
        <div
          ref={rowsRef}
          className="absolute inset-0 flex flex-col justify-around pointer-events-none overflow-hidden opacity-[0.03] py-4"
        >
          {allRows.map((rowWords, rowIndex) => (
            <div
              key={rowIndex}
              className="ticker-strip flex whitespace-nowrap gap-8 sm:gap-14 w-[250vw] -ml-[30vw] leading-none my-1"
              style={{ willChange: "transform" }}
            >
              {rowWords.concat(rowWords, rowWords).map((word, wordIndex) => (
                <span
                  key={`r${rowIndex}-${wordIndex}`}
                  className="inline-block text-lg sm:text-3xl font-black text-secondary/40 uppercase tracking-widest font-['Space_Grotesk',sans-serif]"
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Central Typewriter Name */}
        <div
          ref={centerTextRef}
          className="relative z-30 flex flex-col items-center justify-center text-center px-4 max-w-full leading-[0.92] tracking-tight"
          style={{ willChange: "transform, opacity" }}
        >
          {/* Line 1: ABDALLAH */}
          <div className="inline-flex items-center gap-1 sm:gap-2">
            <h1 className="text-4xl xs:text-6xl sm:text-8xl md:text-[8.5rem] font-extrabold uppercase text-primary tracking-tight leading-[0.92] drop-shadow-[0_10px_35px_rgba(245,127,0,0.4)]">
              {text1.split("").map((char, index) => (
                <span key={`t1-${index}`} className="falling-char inline-block">
                  {char}
                </span>
              ))}
            </h1>
            {!isTypingSecond && text2.length < secondWord.length && (
              <span className="w-1.5 xs:w-2 sm:w-3.5 h-8 xs:h-12 sm:h-20 md:h-24 bg-primary rounded-full animate-pulse shadow-[0_0_20px_#f57f00]" />
            )}
          </div>

          {/* Line 2: AHMED */}
          <div className="inline-flex items-center gap-1 sm:gap-2 mt-2 sm:mt-4">
            <h1 className="text-4xl xs:text-6xl sm:text-8xl md:text-[8.5rem] font-black uppercase text-secondary tracking-tight leading-[0.92] drop-shadow-[0_10px_30px_rgba(255,255,255,0.2)]">
              {text2.split("").map((char, index) => (
                <span key={`t2-${index}`} className="falling-char inline-block">
                  {char}
                </span>
              ))}
            </h1>
            {(isTypingSecond || text2.length >= secondWord.length) && (
              <span className="w-1.5 xs:w-2 sm:w-3.5 h-8 xs:h-12 sm:h-20 md:h-24 bg-white rounded-full animate-pulse shadow-[0_0_20px_#ffffff]" />
            )}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
