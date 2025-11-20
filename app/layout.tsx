import type { Metadata } from "next";
import "./globals.css";
import { Inter, DM_Sans } from "next/font/google";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { UXEnhancer } from "@/components/site/ux-enhancer";
import { ScrollProgress } from "@/components/site/scroll-progress";
import { CookieConsent } from "@/components/site/cookie-consent";
import { AnalyticsLoader } from "@/components/site/analytics-loader";
import { MarketingLoader } from "@/components/site/marketing-loader";
import { GA4PageviewTracker } from "@/components/site/ga-pageview";
import { AutoEvents } from "@/components/site/auto-events";

import { EasterEggs } from "@/components/site/easter-eggs";
import { AssistantOverlay } from "@/components/site/assistant-overlay";
import { GyroTilt } from "@/components/site/gyro-tilt";
import { UrgencyBanner } from "@/components/site/urgency-banner";

import Script from "next/script";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smarterlogicweb.com"),
  title: {
    default: "smarterlogicweb.com — Développeuse front-end",
    template: "%s — smarterlogicweb.com",
  },
  description:
    "La qualité qui se mesure : vitesse, sécurité, résultats. Sites web sur-mesure pour entrepreneurs et associations. Simple, performant, sans complexité — je m’occupe du reste.",
  keywords: [
    "développeuse front-end",
    "site vitrine",
    "Next.js",
    "Tailwind CSS",
    "création site web",
    "refonte",
    "SEO",
    "performance web",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon",
    shortcut: ["/icon"],
  },
  manifest: "/manifest.webmanifest?v=5",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "smarterlogicweb.com",
    url: "https://smarterlogicweb.com",
    title: "smarterlogicweb.com — Développeuse front-end",
    description:
      "La qualité qui se mesure : vitesse, sécurité, résultats. Sites web sur-mesure pour entrepreneurs et associations. Simple, performant, sans complexité — je m’occupe du reste.",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "smarterlogicweb.com — Développeuse front-end",
    description:
      "La qualité qui se mesure : vitesse, sécurité, résultats. Sites web sur-mesure pour entrepreneurs et associations. Simple, performant, sans complexité — je m’occupe du reste.",
    images: ["/opengraph-image"],
  },
  verification: {
    google: "icboO_CSLrw9wrG8c_4iRbw6jy6W1WItmeJOM-e3npg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "smarterlogicweb",
  url: "https://smarterlogicweb.com",
  sameAs: [
    "https://www.linkedin.com/in/salwaessafi?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    "https://github.com/Soofmaax"
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      email: "contact@smarterlogicweb.com",
      contactType: "customer support",
      availableLanguage: ["fr", "en"],
      areaServed: "FR"
    }
  ]
};

const jsonLdSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: "https://smarterlogicweb.com",
  name: "smarterlogicweb.com",
};

const phonePublic = process.env.NEXT_PUBLIC_PHONE || "";
const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "smarterlogicweb";
const ADDRESS_STREET = process.env.NEXT_PUBLIC_COMPANY_STREET || "";
const ADDRESS_POSTAL_CODE = process.env.NEXT_PUBLIC_COMPANY_ZIP || "";
const ADDRESS_LOCALITY = process.env.NEXT_PUBLIC_COMPANY_CITY || "";
const ADDRESS_REGION = process.env.NEXT_PUBLIC_COMPANY_REGION || "";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@smarterlogicweb.com";
const OPENING_HOURS = process.env.NEXT_PUBLIC_OPENING_HOURS || "";

const jsonLdLocalBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: COMPANY_NAME,
  url: "https://smarterlogicweb.com",
  areaServed: "France",
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
    ...(ADDRESS_STREET ? { streetAddress: ADDRESS_STREET } : {}),
    ...(ADDRESS_LOCALITY ? { addressLocality: ADDRESS_LOCALITY } : {}),
    ...(ADDRESS_REGION ? { addressRegion: ADDRESS_REGION } : {}),
    ...(ADDRESS_POSTAL_CODE ? { postalCode: ADDRESS_POSTAL_CODE } : {}),
  },
  ...(phonePublic ? { telephone: phonePublic } : {}),
  ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
  ...(OPENING_HOURS ? { openingHours: OPENING_HOURS } : {}),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f13" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const provider = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || "plausible").toLowerCase();
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || "smarterlogicweb.com";
  const umamiSrc = process.env.NEXT_PUBLIC_UMAMI_SRC || "https://analytics.umami.is/script.js";
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-5X2V579H";

  return (
    <html lang="fr">
      <body className={`${inter.variable} ${dmSans.variable} bg-background text-foreground antialiased font-sans`}>
        {/* Google Tag Manager (consent default denied) */}
        {provider === "gtm" ? (
          <>
            <Script id="gtm-consent-default" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  ad_storage:'denied',
  analytics_storage:'denied',
  functionality_storage:'denied',
  personalization_storage:'denied',
  security_storage:'granted',
  ad_user_data:'denied',
  ad_personalization:'denied'
});`}
            </Script>
            {/* Google Tag Manager */}
            <Script id="gtm-init" strategy="beforeInteractive">
              {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            {/* Google Tag Manager (noscript) */}
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
              }}
            />
          </>
        ) : null}

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSite) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdLocalBusiness) }}
        />

        {/* Analytics (loaded client-side only after consent) */}
        <AnalyticsLoader />
        {/* GA4 page_view tracker (after consent) */}
        <Suspense fallback={null}>
          <GA4PageviewTracker />
        </Suspense>
        {/* Auto events: CTA, outbound links, file downloads (after consent) */}
        <AutoEvents />
        {/* Marketing pixels (Meta/LinkedIn/Hotjar) loaded only after marketing consent */}
        <MarketingLoader />

        <UXEnhancer />
        <ScrollProgress />
        
        <GyroTilt />

        {/* Urgency fixed banner at top + dynamic spacer to avoid overlap (matches banner height) */}
        <UrgencyBanner />
        <div aria-hidden className="pointer-events-none" style={{ height: 'var(--banner-h, 0px)' }} />

        <a href="#content" className="sr-only focus:not-sr-only fixed top-2 left-2 z-50 rounded bg-primary px-3 py-2 text-white">
          Passer au contenu
        </a>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="content" className="flex-1 snap-y">{children}</main>
          <Footer />
        </div>

        {/* Right-hand friendly floating actions removed on request (mobile clutter) */}

        {/* Easter Eggs (fun, non-intrusive) */}
        <EasterEggs />
        <AssistantOverlay />
        {/* Cookie consent (shown when using GA/GTM or others) */}
        <CookieConsent />
      </body>
    </html>
  );
}