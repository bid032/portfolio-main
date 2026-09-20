import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MouseGlow from "@/components/MouseGlow";
import Preloader from "@/components/Preloader";
import { AppContextProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "Abdallah Ahmed - Senior Graphic Designer, Video Editor & Web Developer",
  description:
    "Official Portfolio of Abdallah Ahmed (bid032). Senior Graphic Designer, Commercial Video Editor & Full-Stack Web Developer. Specializing in Brand Identity Systems, Commercial Video Editing, and Custom Web Applications.",
  keywords: [
    // Graphic Design keywords
    "Abdallah Ahmed",
    "Senior Graphic Designer",
    "Brand Identity Specialist",
    "Logo Designer",
    "Corporate Branding",
    "Print & Packaging Designer",
    "Prepress Specialist",
    "Photo Compositing Artist",
    "Visual Designer Egypt",
    "Adobe Photoshop Expert",
    "Adobe Illustrator Specialist",
    "Graphic Design Team Leader",

    // Video Editing & Motion keywords
    "Video Editor",
    "Commercial Video Editing",
    "Social Media Reels Creator",
    "Premiere Pro Specialist",
    "CapCut Video Editor",
    "Commercial Ads Video Editor",
    "Motion Video Designer",

    // Web Development keywords
    "Web Developer",
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Frontend Engineer",
    "UI UX Designer",
    "Custom Web Applications",
    "Tailwind CSS Specialist",
    "TypeScript Developer",

    // Personal Brand & Agency terms
    "bid032",
    "bido",
    "bid032.com",
    "bid032.io",
    "CanGrow Group",
    "Creative Corner",
    "Full Frame Group",
    "CanGrow Group Graphic Designer",
    "Freelance Designer & Developer",
  ],
  authors: [{ name: "Abdallah Ahmed", url: "https://bid032.com" }],
  creator: "Abdallah Ahmed",
  publisher: "Abdallah Ahmed",
  metadataBase: new URL("https://bid032.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Abdallah Ahmed - Senior Graphic Designer, Video Editor & Web Developer",
    description:
      "Explore the official portfolio of Abdallah Ahmed (bid032): Brand Identity Systems, Commercial Video Editing, and Custom Web Applications.",
    url: "https://bid032.com",
    siteName: "Abdallah Ahmed Portfolio",
    images: [
      {
        url: "https://bid032.com/Photos/01.webp",
        width: 1200,
        height: 630,
        alt: "Abdallah Ahmed Portfolio Showcase",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abdallah Ahmed - Senior Graphic Designer, Video Editor & Web Developer",
    description:
      "Brand Identity Systems, Commercial Video Reels, and Custom Full-Stack Web Applications.",
    images: ["https://bid032.com/Photos/01.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://bid032.com/#person",
      name: "Abdallah Ahmed",
      alternateName: ["bid032", "bido", "bid032.com", "Abdallah Ahmed (bid032)"],
      url: "https://bid032.com",
      image: "https://bid032.com/Photos/01.webp",
      jobTitle: "Senior Graphic Designer, Video Editor & Web Developer",
      description:
        "Senior Graphic Designer, Commercial Video Editor & Full-Stack Web Developer with over 5 years of commercial experience in corporate brand identity systems, commercial video reels, custom web applications, Next.js, and AI-driven workflows.",
      worksFor: {
        "@type": "Organization",
        name: "CanGrow Group",
      },
      sameAs: [
        "https://www.behance.net/bid032/projects",
        "https://www.linkedin.com/in/bid032/",
        "https://www.instagram.com/bid032/",
        "https://www.facebook.com/bid032",
      ],
      knowsLanguage: [
        {
          "@type": "Language",
          name: "Arabic",
          alternateName: "ar",
        },
        {
          "@type": "Language",
          name: "English",
          alternateName: "en",
        },
      ],
      knowsAbout: [
        // Graphic Design & Branding Core
        "Graphic Design",
        "Senior Graphic Designer",
        "Brand Identity Systems",
        "Logo Design",
        "Corporate Branding",
        "Visual Identity Strategy",
        "Brand Guidelines & Style Guides",
        "Typography & Font Pairing",
        "Prepress Preparation",
        "Print & Packaging Design",
        "Social Media Design",
        "Ads Design",
        "Die-Cut Packaging",
        "Photo Compositing & Retouching",
        "Commercial Artwork",

        // Video Editing & Motion Core
        "Video Editing",
        "Commercial Video Editing",
        "Social Media Video Reels",
        "Shorts & Viral Video Content",
        "Adobe Premiere Pro",
        "CapCut Video Editing",
        "Color Grading & Audio Syncing",

        // Web Development & Engineering Core
        "Web Development",
        "Full Stack Developer",
        "Frontend Engineering",
        "UI/UX Design",
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "JavaScript (ES6+)",
        "Custom Web Applications",
        "Vibe Coding",
        "Agentic AI Workflows",
        "Generative AI Integration",
        "API Integration & CMS Development",
        "Web Performance Optimization",
        "Responsive Web Design",

        // Professional Role & Services
        "Freelance Designer & Developer",
        "Design Team Leadership",
        "Creative Direction",
        "Digital Product Design",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services Offered by Abdallah Ahmed",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Brand Identity & Corporate Design",
              description:
                "Complete visual identity design, logo creation, prepress print files, and commercial packaging.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Commercial Video Editing & Reels",
              description:
                "High-converting commercial promo videos, social media reels, color grading, and audio editing.",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Custom Web Application Development",
              description:
                "High-performance React & Next.js web application engineering with modern UI/UX animations.",
            },
          },
        ],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://bid032.com/#website",
      url: "https://bid032.com",
      name: "Abdallah Ahmed - Portfolio (bid032)",
      description:
        "Official Portfolio & Agency Studio of Abdallah Ahmed. Senior Graphic Designer & Web Developer.",
      inLanguage: ["en", "ar"],
      publisher: { "@id": "https://bid032.com/#person" },
    },
  ],
};

import MetaPixelScript from "@/components/MetaPixelScript";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="--font-inter overflow-x-hidden max-w-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('app_theme');
                  if (t === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased max-w-full relative min-h-screen" suppressHydrationWarning>
        <AppContextProvider>
          <MetaPixelScript />
          <Preloader />
          <MouseGlow />
          <Navbar />
          <main className="w-full min-h-screen">{children}</main>
          <Footer />
        </AppContextProvider>
      </body>
    </html>
  );
}
