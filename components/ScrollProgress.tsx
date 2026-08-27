"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const pathname = usePathname();

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[100] shadow-[0_0_10px_rgba(245,127,0,0.8)]"
    />
  );
}
