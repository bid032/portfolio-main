"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
    trackMetaPixel?: (eventName: string, data?: Record<string, any>) => void;
  }
}

function MetaPixelInner() {
  const [pixelId, setPixelId] = useState<string>("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fetch Meta Pixel ID from store settings
    fetch("/api/store/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.metaPixelId) {
          setPixelId(data.metaPixelId.trim());
        }
      })
      .catch(() => {});
  }, []);

  // Track PageView on route changes
  useEffect(() => {
    if (!pixelId) return;
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams, pixelId]);

  // Expose global helper function
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.trackMetaPixel = (eventName: string, data?: Record<string, any>) => {
        if (window.fbq && pixelId) {
          if (data) {
            window.fbq("track", eventName, data);
          } else {
            window.fbq("track", eventName);
          }
        }
      };
    }
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt="Meta Pixel"
        />
      </noscript>
    </>
  );
}

export default function MetaPixelScript() {
  return (
    <Suspense fallback={null}>
      <MetaPixelInner />
    </Suspense>
  );
}

