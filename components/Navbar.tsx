"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Magnetic from "./Magnetic";
import { FaSun, FaMoon } from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, t, toggleTheme } = useApp();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide Navbar when viewing Sanity Studio or Store Admin dashboard
  if (pathname?.startsWith("/studio") || pathname?.startsWith("/store/admin")) {
    return null;
  }

  const logoSrc = theme === "dark" ? "/Photos/Logo/Light.svg" : "/Photos/Logo/Dark.svg";

  const navLinks = [
    { label: t.nav.about, href: "#about" },
    { label: t.nav.experience, href: "#experience" },
    { label: t.nav.process, href: "#process" },
    { label: t.nav.projects, href: "#projects" },
    { label: t.nav.contact, href: "#contact" },
    { label: t.nav.store, href: "/store" },
  ];

  function handleNavClick(e: React.MouseEvent, href: string) {
    const isModified =
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      (e.nativeEvent && (e.nativeEvent as any).button === 1);

    if (isModified) return;

    // Internal route navigation (like /store)
    if (href.startsWith("/")) {
      e.preventDefault();
      router.push(href);
      setMobileOpen(false);
      return;
    }

    // External navigation
    if (href.startsWith("http")) {
      setMobileOpen(false);
      return;
    }

    // Anchor navigation (#about, #contact, etc.)
    e.preventDefault();
    const targetId = href.replace(/^#/, "");

    if (pathname === "/" || pathname === "") {
      const el = document.getElementById(targetId);

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        history.replaceState(null, "", `#${targetId}`);
      } else {
        history.replaceState(null, "", `#${targetId}`);
      }

      setMobileOpen(false);
      return;
    }

    router.push(`/#${targetId}`);
    setMobileOpen(false);
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border/80 shadow-xl py-2.5 sm:py-3"
          : "bg-transparent py-4 sm:py-5"
          }`}
      >
        <nav className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          <Magnetic amount={0.2}>
            <Link
              href="/"
              className="text-base sm:text-2xl flex gap-2 sm:gap-2.5 items-center font-bold text-secondary tracking-tight hover:text-primary transition-colors duration-300 group shrink-0"
            >
              <span className="relative aspect-[63/55] h-7 sm:h-8 transition-transform duration-300 group-hover:scale-110">
                <Image src={logoSrc} alt="Abdallah Ahmed Logo" fill className="object-contain" priority />
              </span>

              <span className="truncate">
                Abdallah Ahmed
                <span className="text-primary group-hover:animate-ping">.</span>
              </span>
            </Link>
          </Magnetic>

          {/* Desktop Links & Theme Control */}
          <div className="hidden lg:flex items-center gap-6 bg-surface/60 backdrop-blur-md px-6 py-2 rounded-full border border-border/60">
            {navLinks.map((link) => {
              const isExternal = link.href.startsWith("http");
              const isAnchor = link.href.startsWith("#");
              const hrefForLink = isAnchor
                ? `/#${link.href.replace(/^#/, "")}`
                : link.href;

              return (
                <a
                  key={link.label}
                  href={hrefForLink}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-xs sm:text-sm font-medium text-text-secondary hover:text-primary transition-colors duration-300 relative group py-1"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                </a>
              );
            })}

            {/* Theme Control Button */}
            <div className="flex items-center border-l border-border/60 pl-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-surface border border-border/80 text-secondary hover:text-primary hover:border-primary/50 transition-all duration-300"
                aria-label="Toggle dark/light theme"
              >
                {theme === "dark" ? <FaSun size={13} className="text-amber-400" /> : <FaMoon size={13} className="text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Mobile Right Theme & Hamburger */}
          <div className="flex items-center gap-1.5 lg:hidden shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-surface/80 border border-border/80 text-secondary"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <FaSun size={12} className="text-amber-400" /> : <FaMoon size={12} className="text-indigo-400" />}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1 p-2 rounded-lg border border-border/80 bg-surface/80 text-secondary"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-[2px] bg-secondary"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block w-5 h-[2px] bg-secondary"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="block w-5 h-[2px] bg-secondary"
              />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 flex flex-col items-center justify-center gap-8 lg:hidden px-6"
          >
            <div className="flex flex-col items-center gap-5 w-full max-w-sm">
              {navLinks.map((link, i) => {
                const isExternal = link.href.startsWith("http");
                const isAnchor = link.href.startsWith("#");
                const hrefForLink = isAnchor
                  ? `/#${link.href.replace(/^#/, "")}`
                  : link.href;

                return (
                  <motion.a
                    key={link.label}
                    href={hrefForLink}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="w-full text-center py-2.5 text-lg font-semibold text-secondary hover:text-primary transition-colors border-b border-border/40"
                  >
                    {link.label}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}