"use client";

import Script from "next/script";
import * as React from "react";

const PROVIDER = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "").toLowerCase();
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "smarterlogicweb.com";
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://analytics.umami.is/script.js";
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "";
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

function getConsent(): { analytics?: boolean } | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|; )cookie_consent=([^;]+)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

export function AnalyticsLoader() {
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    const c = getConsent();
    setAllowed(Boolean(c && c.analytics === true));
  }, []);

  if (!allowed) return null;

  // Google Analytics direct (gtag)
  if (PROVIDER === "ga" && GA_ID) {
    return (
      <>
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `,
          }}
        />
        <Script
          id="ga4-src"
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
          strategy="afterInteractive"
        />
      </>
    );
  }

  // GTM is handled by MarketingLoader when marketing consent is granted
  if (PROVIDER === "gtm") return null;

  return (
    <>
      {PROVIDER === "plausible" && (
        <Script strategy="lazyOnload" data-domain={PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />
      )}
      {PROVIDER === "umami" && UMAMI_WEBSITE_ID && (
        <Script strategy="lazyOnload" src={UMAMI_SRC} data-website-id={UMAMI_WEBSITE_ID} />
      )}
    </>
  );
}