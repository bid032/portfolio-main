"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaBehance, FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp, FaPhone } from "react-icons/fa";
import { useApp } from "@/context/AppContext";

const socialLinks = [
  {
    label: "Phone",
    href: "tel:+201028463485",
    icon: FaPhone,
    color: "hover:bg-[#22c55e]",
  },
  {
    label: "WhatsApp",
    href: "https://api.whatsapp.com/send/?phone=%2B201028463485&text=Hi%20Abdallah!%20I%20checked%20your%20portfolio%20and%20I%20would%20love%20to%20discuss%20a%20new%20design%20project%20with%20you.",
    icon: FaWhatsapp,
    color: "hover:bg-[#25d366]",
  },
  {
    label: "Behance",
    href: "https://www.behance.net/bid032/projects",
    icon: FaBehance,
    color: "hover:bg-[#1769ff]",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/bid032/",
    icon: FaInstagram,
    color:
      "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/bid032/",
    icon: FaLinkedin,
    color: "hover:bg-[#0a66c2]",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/bid032",
    icon: FaFacebook,
    color: "hover:bg-[#2c68ff]",
  },
];

export default function Footer() {
  const pathname = usePathname();
  const { theme } = useApp();

  // Hide Footer when viewing Sanity Studio or Store Admin dashboard
  if (pathname?.startsWith("/studio") || pathname?.startsWith("/store/admin")) {
    return null;
  }

  const logoSrc = theme === "dark" ? "/Photos/Logo/Light.svg" : "/Photos/Logo/Dark.svg";

  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Logo & Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex gap-2.5 items-center"
          >
            <span className="relative aspect-[63/55] h-8">
              <Image src={logoSrc} alt="Abdallah Ahmed Logo" fill className="object-contain" />
            </span>
            <span className="text-xl font-bold text-secondary">
              Abdallah Ahmed<span className="text-primary">.</span>
            </span>
          </motion.div>

          {/* Social Icons */}
          <ul className="flex items-center gap-4">
            {socialLinks.map((item, i) => {
              const Icon = item.icon;

              return (
                <motion.li
                  key={i}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-surface border border-border text-secondary hover:text-white transition-all duration-300 ${item.color} hover:shadow-md shadow-sm`}
                  >
                    <Icon size={18} />
                  </a>
                </motion.li>
              );
            })}
          </ul>

          {/* Copyright */}
          <motion.p
            className="text-xs text-text-muted font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            © {new Date().getFullYear()} Abdallah Ahmed. All rights reserved.
          </motion.p>

        </div>
      </div>
    </footer>
  );
}