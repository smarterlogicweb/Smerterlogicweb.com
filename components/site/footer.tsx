"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Mail } from "lucide-react";
import { track } from "@/lib/analytics";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { GoogleReviewsBadge } from "@/components/site/google-reviews";
import { availablePathsFR, availablePathsEN } from "@/data/routes";

export function Footer() {
  const pathname = usePathname() || "/";
  const isEn = pathname.startsWith("/en");
  const prefix = isEn ? "/en" : "";

  const available = isEn ? availablePathsEN : availablePathsFR;

  const t = useMemo(
    () =>
      isEn
        ? {
            navTitle: "Navigation",
            legalTitle: "Legal",
            contactTitle: "Contact",
            nav: {
              home: "Home",
              projects: "Projects",
              services: "Services",
              about: "About",
              contact: "Contact",
              commitment: "Commitment",
            },
            legal: {
              mentions: "Legal notice",
              privacy: "Privacy policy",
              security: "Security",
              cgv: "Terms of sale",
              cookies: "Manage cookies",
            },
            copyright: "All rights reserved.",
          }
        : {
            navTitle: "Navigation",
            legalTitle: "Légal",
            contactTitle: "Contact",
            nav: {
              home: "Accueil",
              projects: "Projets",
              services: "Services",
              about: "À propos",
              contact: "Contact",
              commitment: "Engagement",
            },
            legal: {
              mentions: "Mentions légales",
              privacy: "Politique de confidentialité",
              security: "Sécurité",
              cgv: "Conditions générales de vente",
              cookies: "Gérer les cookies",
            },
            copyright: "Tous droits réservés.",
          },
    [isEn]
  );

  const footerLogo = (process.env.NEXT_PUBLIC_LOGO_FOOTER || "").trim();

  return (
    <footer id="site-footer" className="w-full border-t">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-12">
          {/* Brand + tagline */}
          <div className="md:col-span-5">
            <Link href={isEn ? "/en" : "/"} className="inline-flex items-center gap-2">
              {footerLogo ? (
                <Image src={footerLogo} alt="Logo" width={120} height={40} className="h-10 w-auto" />
              ) : (
                <span className="rounded-md bg-accent px-2 py-1 text-sm font-semibold text-accent-foreground">
                  smarterlogicweb
                </span>
              )}
            </Link>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              {isEn
                ? "Quality you can measure: speed, security, results."
                : "La qualité qui se mesure : vitesse, sécurité, résultats."}
            </p>
            {/* Google Reviews badge */}
            <div className="mt-4">
              <GoogleReviewsBadge />
            </div>
          </div>

          {/* Navigation */}
          <nav className="md:col-span-3" aria-label="Navigation principale">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.navTitle}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={`${prefix}/`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/${isEn ? "projects" : "projets"}`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.projects}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/services`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/${isEn ? "about" : "a-propos"}`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link href={`${prefix}/contact`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/${isEn ? "nonprofit-commitment" : "engagement-associatif"}`.replace("//", "/")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.nav.commitment}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav className="md:col-span-2" aria-label="Liens légaux">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.legalTitle}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={`${prefix}/${isEn ? "legal-notice" : "mentions-legales"}`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.legal.mentions}
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/${isEn ? "privacy-policy" : "politique-de-confidentialite"}`.replace("//", "/")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.legal.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/${isEn ? "security" : "securite"}`.replace("//", "/")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.legal.security}
                </Link>
              </li>
              {/* CGV/Terms of sale — only if the route exists */}
              {(isEn ? available.has("terms-of-sale") : available.has("cgv")) ? (
                <li>
                  <Link
                    href={`${prefix}/${isEn ? "terms-of-sale" : "cgv"}`.replace("//", "/")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t.legal.cgv}
                  </Link>
                </li>
              ) : null}
              <li>
                {/* Open cookie preferences banner */}
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => {
                    try {
                      window.dispatchEvent(new Event("cookie-consent:open"));
                    } catch {
                      // ignore
                    }
                  }}
                >
                  {t.legal.cookies}
                </button>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t.contactTitle}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="mailto:contact@smarterlogicweb.com"
                  className="text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => track("cta_devis_mailto_footer_text")}
                >
                  contact@smarterlogicweb.com
                </Link>
              </li>
            </ul>
            <div className="mt-4 flex items-center gap-4">
              <Link
                href="https://www.linkedin.com/in/salwaessafi?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-muted-foreground transition-colors hover:text-primary"
                onClick={() => track("social_linkedin_footer")}
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://github.com/Soofmaax"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground transition-colors hover:text-primary"
                onClick={() => track("social_github_footer")}
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="mailto:contact@smarterlogicweb.com"
                aria-label="Envoyer un email"
                className="text-muted-foreground transition-colors hover:text-primary"
                onClick={() => track("cta_devis_mailto_footer_icon")}
              >
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © 2025 smarterlogicweb.com — {t.copyright}
          </p>
          <nav aria-label="Liens légaux secondaires" className="text-xs">
            <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <li>
                <Link href={`${prefix}/${isEn ? "legal-notice" : "mentions-legales"}`.replace("//", "/")} className="text-muted-foreground transition-colors hover:text-foreground">
                  {t.legal.mentions}
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/${isEn ? "privacy-policy" : "politique-de-confidentialite"}`.replace("//", "/")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.legal.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`${prefix}/${isEn ? "security" : "securite"}`.replace("//", "/")}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.legal.security}
                </Link>
              </li>
              {/* CGV/Terms of sale — only if the route exists */}
              {(isEn ? available.has("terms-of-sale") : available.has("cgv")) ? (
                <li>
                  <Link
                    href={`${prefix}/${isEn ? "terms-of-sale" : "cgv"}`.replace("//", "/")}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t.legal.cgv}
                  </Link>
                </li>
              ) : null}
              {/* Cookie preferences: allow user to reopen consent banner */}
              <li>
                <button
                  type="button"
                  className="text-muted-foreground transition-colors hover:text-foreground underline underline-offset-2"
                  onClick={() => {
                    try {
                      // Clear consent cookie and refresh to trigger banner
                      document.cookie = "cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
                    } catch {}
                    window.location.reload();
                  }}
                >
                  {isEn ? "Cookie preferences" : "Préférences cookies"}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}