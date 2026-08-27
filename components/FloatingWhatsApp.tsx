"use client";

import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";

export default function FloatingWhatsApp() {
  const whatsappUrl =
    "https://api.whatsapp.com/send/?phone=%2B201028463485&text=Hi%20Abdallah!%20I%20visited%20your%20portfolio%20and%20I%20want%20to%20discuss%20a%20design%20project%20for%20my%20brand.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
    >
      {/* Tooltip hint on hover */}
      <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-surface border border-border/80 text-secondary text-xs font-semibold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        Let&apos;s talk about your project 
      </span>

      {/* Floating Button with Pulse Effect */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25d366] text-white shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_15px_35px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-30 pointer-events-none" />
        <FaWhatsapp size={30} />
      </a>
    </motion.div>
  );
}
