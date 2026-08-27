"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { urlFor } from "@/sanity/image";
import { useApp } from "@/context/AppContext";
import SectionWrapper from "./SectionWrapper";

interface TestimonialItem {
  _id: string;
  name: string;
  role?: string;
  company?: string;
  quote: string;
  rating?: number;
  avatar?: any;
}

const fallbackTestimonials: TestimonialItem[] = [
  {
    _id: "1",
    name: "Ahmed El-Sayed",
    role: "Marketing Director",
    company: "Luxe Brands Agency",
    quote:
      "Abdallah is an exceptional graphic designer. He transformed our entire visual identity and social media presence. The attention to detail and creative execution exceeded all expectations!",
    rating: 5,
    avatar: null,
  },
  {
    _id: "2",
    name: "Sarah Mostafa",
    role: "Founder & CEO",
    company: "Pure Tea Organics",
    quote:
      "Working with Abdallah on our packaging and brand identity was smooth and highly professional. Sales went up 40% after launching the new visual packaging!",
    rating: 5,
    avatar: null,
  },
  {
    _id: "3",
    name: "Mahmoud Hassan",
    role: "Creative Director",
    company: "Vogue Digital",
    quote:
      "Abdallah's 3D manipulation and typography skills are top-tier. He delivers high-converting designs fast and understands commercial branding inside out.",
    rating: 5,
    avatar: null,
  },
];

export default function Testimonials({ data }: { data: TestimonialItem[] }) {
  const { t } = useApp();
  const items = data?.length > 0 ? data : fallbackTestimonials;

  return (
    <SectionWrapper id="testimonials">
      <div className="text-center mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-3"
        >
          <span>{t.testimonials.badge}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary mb-3 sm:mb-4"
        >
          {t.testimonials.heading}
        </motion.h2>
        <p className="text-text-secondary text-xs sm:text-base max-w-xl mx-auto px-4">
          {t.testimonials.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {items.map((item, index) => {
          const avatarUrl = item.avatar ? urlFor(item.avatar)?.width(100).height(100).url() : null;

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="relative p-6 sm:p-8 bg-surface border border-border/80 rounded-2xl flex flex-col justify-between hover:border-primary/50 hover:shadow-[0_12px_35px_rgba(234,88,12,0.12)] transition-all duration-300 group shadow-md"
            >
              <FaQuoteLeft className="text-primary/25 text-3xl mb-4 group-hover:text-primary/50 transition-colors duration-300" />

              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4 text-amber-500">
                {Array.from({ length: item.rating || 5 }).map((_, i) => (
                  <FaStar key={i} size={14} />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed mb-6 italic font-medium">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 border-t border-border/40 pt-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 overflow-hidden shrink-0 flex items-center justify-center font-bold text-primary text-sm">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    item.name.charAt(0)
                  )}
                </div>

                <div className="min-w-0">
                  <h4 className="text-secondary text-sm font-bold truncate group-hover:text-primary transition-colors duration-300">
                    {item.name}
                  </h4>
                  <p className="text-text-muted text-[11px] truncate">
                    {item.role && `${item.role}`} {item.company && `- ${item.company}`}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
