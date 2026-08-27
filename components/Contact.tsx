"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cal, { getCalApi } from "@calcom/embed-react";
import {
  FaPaperPlane,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaCheckCircle,
  FaChevronDown,
  FaCalendarAlt,
  FaComments,
} from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useApp } from "@/context/AppContext";
import SectionWrapper from "./SectionWrapper";
import Magnetic from "./Magnetic";

const serviceOptions = [
  "Branding & Visual Identity",
  "Social Media Design & Campaigns",
  "Websites & Web Apps",
  "Print & Packaging Design",
  "Visual Manipulation",
  "Typography & Calligraphy",
  "Other / Custom Project",
];

const calDurations = [
  { id: "15min", label: "15 Min Meeting", calLink: "bid032/15min", badge: "Fast" },
  { id: "30min", label: "30 Min Meeting", calLink: "bid032/30min", badge: "Popular" },
  { id: "60min", label: "60 Min Meeting", calLink: "bid032/60min", badge: "Deep Dive" },
];

export default function Contact() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState<"message" | "cal">("message");
  const [selectedCal, setSelectedCal] = useState(calDurations[1]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const cal = await getCalApi();
        cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#f57f00" } },
          hideEventTypeDetails: false,
          layout: "month_view",
        });
      } catch (err) {
        console.error("Cal.com init error:", err);
      }
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setErrorMessage(data.error || "Failed to send message.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again or reach out on WhatsApp.");
      setStatus("error");
    }
  };

  const directWhatsappUrl =
    "https://api.whatsapp.com/send/?phone=%2B201028463485&text=Hi%20Abdallah!%20%F0%9F%90%8B%20I%20checked%20your%20portfolio%20and%20I%20would%20love%20to%20discuss%20a%20new%20design%20project%20with%20you.";

  return (
    <SectionWrapper id="contact">
      <div className="relative max-w-7xl mx-auto px-2 sm:px-4">

        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>{t.contact.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-secondary mb-4 tracking-tight leading-none"
          >
            Let&apos;s Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">Brand</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8"
          >
            Ready to elevate your business with world-class branding and visual design? Drop a message below or schedule a 1-on-1 call on Cal.com.
          </motion.p>

          {/* Dual Contact Mode Tab Switcher */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="inline-flex items-center p-1.5 rounded-full bg-surface border border-border/80 shadow-xl max-w-md mx-auto"
          >
            <button
              onClick={() => setActiveTab("message")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${activeTab === "message"
                ? "bg-primary text-background shadow-[0_0_20px_rgba(245,127,0,0.4)]"
                : "text-text-secondary hover:text-secondary"
                }`}
            >
              <FaComments size={14} />
              <span>Send Message</span>
            </button>

            <button
              onClick={() => setActiveTab("cal")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${activeTab === "cal"
                ? "bg-primary text-background shadow-[0_0_20px_rgba(245,127,0,0.4)]"
                : "text-text-secondary hover:text-secondary"
                }`}
            >
              <FaCalendarAlt size={14} />
              <span>Book a Call</span>
            </button>
          </motion.div>
        </div>

        {/* Dynamic Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "message" ? (
            /* TAB 1: DIRECT MESSAGE & WHATSAPP FORM */
            <motion.div
              key="message-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
            >
              {/* Left Column: Direct WhatsApp Hero & Quick Details */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5 h-full">
                {/* Instant WhatsApp Highlight Card */}
                <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#25d366]/15 via-surface to-surface border border-[#25d366]/40 shadow-xl flex flex-col justify-between flex-1 group hover:border-[#25d366]/70 transition-all duration-500 min-h-[300px]">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#25d366]/20 border border-[#25d366]/40 text-[#1e9e4b] dark:text-[#25d366] text-xs font-extrabold uppercase tracking-wider shadow-sm">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#25d366] animate-pulse" />
                        Instant Response Guarantee
                      </div>

                      <div className="w-11 h-11 rounded-full bg-[#25d366]/20 text-[#1e9e4b] dark:text-[#25d366] border border-[#25d366]/40 flex items-center justify-center shrink-0 shadow-inner">
                        <FaWhatsapp size={24} />
                      </div>
                    </div>

                    <h3 className="text-2xl sm:text-3xl font-extrabold text-secondary mb-3">
                      Prefer WhatsApp?
                    </h3>
                    <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                      Get immediate scope estimates, project feedback, or start your order directly. I usually respond within 1 hour.
                    </p>
                  </div>

                  <div className="pt-4">
                    <a
                      href={directWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 bg-[#25d366] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl hover:bg-[#20bd5a] hover:shadow-[0_0_30px_rgba(37,211,102,0.4)] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-xl group-hover:scale-[1.01]"
                    >
                      <FaWhatsapp size={20} />
                      <span>Chat Instantly on WhatsApp</span>
                      <FaArrowUpRightFromSquare size={12} className="opacity-80" />
                    </a>
                  </div>
                </div>

                {/* Phone Call Pill */}
                <a
                  href="tel:+201028463485"
                  className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-surface border border-border/80 hover:border-blue-500/60 hover:shadow-[0_8px_30px_rgba(59,130,246,0.18)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer block shadow-md"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                      <FaPhone size={18} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[11px] font-extrabold text-text-muted uppercase tracking-wider">
                        Direct Phone Call
                      </span>
                      <span className="text-secondary font-mono text-base font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors block">
                        +201028463485
                      </span>
                    </div>
                  </div>
                  <FaArrowUpRightFromSquare size={14} className="text-text-muted group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 opacity-80" />
                </a>
              </div>

              {/* Right Column: Compact High-End Form */}
              <div className="lg:col-span-7 bg-surface border border-border/80 rounded-3xl p-6 sm:p-9 shadow-xl flex flex-col justify-between">
                {status === "success" ? (
                  <div className="py-16 text-center flex flex-col items-center justify-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 border border-green-500/30 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(34,197,94,0.25)]"
                    >
                      <FaCheckCircle size={38} />
                    </motion.div>
                    <h3 className="text-secondary font-extrabold text-2xl mb-2">
                      {t.contact.successTitle}
                    </h3>
                    <p className="text-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed font-medium">
                      {t.contact.successSub}
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="px-8 py-3 bg-surface border border-border/80 text-secondary font-bold text-xs uppercase tracking-wider rounded-full hover:border-primary hover:text-primary transition-all duration-300 shadow-sm"
                    >
                      {t.contact.sendAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                          {t.contact.nameLabel} <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t.contact.namePlaceholder}
                          className="w-full px-4 py-3.5 rounded-xl bg-surface-hover/70 border border-border text-secondary text-sm focus:border-primary focus:bg-surface focus:outline-none transition-all duration-300 placeholder:text-text-muted/60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                          {t.contact.emailLabel} <span className="text-primary">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t.contact.emailPlaceholder}
                          className="w-full px-4 py-3.5 rounded-xl bg-surface-hover/70 border border-border text-secondary text-sm focus:border-primary focus:bg-surface focus:outline-none transition-all duration-300 placeholder:text-text-muted/60"
                        />
                      </div>
                    </div>

                    {/* Mandatory Dropdown Select for Services / Subject */}
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Service Needed / Subject <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-surface-hover/70 border border-border text-secondary text-sm focus:border-primary focus:bg-surface focus:outline-none transition-all duration-300 appearance-none cursor-pointer pr-10"
                        >
                          <option value="" disabled className="text-text-muted bg-surface">
                            -- Select Needed Service --
                          </option>
                          {serviceOptions.map((opt) => (
                            <option key={opt} value={opt} className="bg-surface text-secondary py-2">
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                          <FaChevronDown size={12} />
                        </div>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
                        {t.contact.messageLabel} <span className="text-primary">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t.contact.messagePlaceholder}
                        className="w-full px-4 py-3.5 rounded-xl bg-surface-hover/70 border border-border text-secondary text-sm focus:border-primary focus:bg-surface focus:outline-none transition-all duration-300 placeholder:text-text-muted/60 resize-none"
                      />
                    </div>

                    {/* Error Banner */}
                    {status === "error" && (
                      <p className="text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl">
                        {errorMessage}
                      </p>
                    )}

                    {/* Submit Action Button */}
                    <Magnetic amount={0.15}>
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="group relative w-full py-4.5 px-8 bg-gradient-to-r from-primary via-orange-500 to-amber-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest rounded-2xl border border-white/20 shadow-[0_4px_25px_rgba(245,127,0,0.35)] hover:shadow-[0_0_40px_rgba(245,127,0,0.65)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                        {status === "loading" ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>{t.contact.sending}</span>
                          </div>
                        ) : (
                          <>
                            <FaPaperPlane
                              size={16}
                              className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110"
                            />
                            <span className="relative z-10">{t.contact.sendBtn}</span>
                          </>
                        )}
                      </button>
                    </Magnetic>
                  </form>
                )}
              </div>
            </motion.div>
          ) : (
            /* TAB 2: CAL.COM INTERACTIVE SCHEDULER */
            <motion.div
              key="cal-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-surface border border-border/80 rounded-3xl p-4 sm:p-8 shadow-2xl overflow-hidden"
            >
              {/* Duration Selector Pills */}
              <div className="mb-6 flex items-center justify-center flex-wrap gap-3">
                {calDurations.map((item) => {
                  const isSelected = selectedCal.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCal(item)}
                      className={`relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 cursor-pointer ${isSelected
                        ? "bg-primary/20 border-primary text-secondary shadow-[0_0_20px_rgba(245,127,0,0.3)] scale-105"
                        : "bg-surface-hover/70 border-border/70 text-text-secondary hover:border-primary/40 hover:text-secondary"
                        }`}
                    >
                      {/* <span className="text-base">{item.badge === "Popular" ? "" : item.badge === "Fast" ? "" : ""}</span> */}
                      <div className="text-left">
                        <span className="block font-bold leading-tight">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Embedded Cal.com Interactive Booking Widget */}
              <div className="w-full min-h-[600px] rounded-2xl overflow-hidden border border-border/60 bg-background/50">
                <Cal
                  key={selectedCal.calLink}
                  calLink={selectedCal.calLink}
                  style={{ width: "100%", height: "650px", overflow: "auto" }}
                  config={{ layout: "month_view", theme: "dark" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
}
