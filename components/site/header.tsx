"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { track } from "@/lib/analytics";
import { availablePathsFR, availablePathsEN } from "@/data/routes";

function useDarkMode() {
  // Rely solely on the 'dark' class applied to <html> for theme,
  // to avoid mismatch between OS preference and actual site theme.
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const compute = () => document.documentElement.classList.contains("dark");
    setIsDark(compute());
    const mo = new MutationObserver(() => setIsDark(compute()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return isDark;
}

function getLogoSrc(isDark: boolean, small?: boolean) {
  // Defaults map to files placed in /public/logos (renamed for clarity)
  const defaultHeaderLight = "/logos/logo-header-blue.svg";
  const defaultHeaderDark = "/logos/logo-header-white.svg";
  const defaultHeaderSmallLight = "/logos/logo-header-blue-small.svg";
  const defaultHeaderSmallDark = "/logos/logo-header-white-small.svg"; // dedicated small white for dark theme

  const headerLight = process.env.NEXT_PUBLIC_LOGO_HEADER_LIGHT || defaultHeaderLight;
  const headerDark = process.env.NEXT_PUBLIC_LOGO_HEADER_DARK || defaultHeaderDark;
  const headerSmallLight = process.env.NEXT_PUBLIC_LOGO_HEADER_SMALL_LIGHT || defaultHeaderSmallLight;
  const headerSmallDark = process.env.NEXT_PUBLIC_LOGO_HEADER_SMALL_DARK || defaultHeaderSmallDark;

  if (small) {
    return isDark ? headerSmallDark : headerSmallLight;
  }
  return isDark ? headerDark : headerLight;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [openServices, setOpenServices] = useState(false);
  const [openProjets, setOpenProjets] = useState(false);
  const pathname = usePathname() || "/";
  const isEn = pathname.startsWith("/en");
  const prefix = isEn ? "/en" : "";
  const available = isEn ? availablePathsEN : availablePathsFR;
  const isDark = useDarkMode();

  const t = useMemo(
    () =>
      isEn
        ? {
            nav: {
              projects: "Projects",
              services: "Services",
              about: "About",
              commitment: "Commitment",
              contact: "Contact",
            },
            projects: {
              item1: "Nonprofit redesign",
              item2: "Showcase site for artisan",
              item3: "Performance optimisation",
            },
            services: {
              item1: "Fast showcase site",
              item2: "Redesign & optimisation",
              item3: "Ongoing support",
            },
            cta: "View pricing and examples",
            baseline: "Quality you can measure: speed, security, results.",
            lang: "FR",
          }
        : {
            nav: {
              projects: "Projets",
              services: "Services",
              about: "À propos",
              commitment: "Engagement",
              contact: "Contact",
            },
            projects: {
              item1: "Refonte associatif",
              item2: "Site vitrine artisan",
              item3: "Optimisation performance",
            },
            services: {
              item1: "Site vitrine rapide",
              item2: "Refonte & optimisation",
              item3: "Accompagnement continu",
            },
            cta: "Voir les tarifs et exemples",
            baseline: "La qualité qui se mesure : vitesse, sécurité, résultats.",
            lang: "EN",
          },
    [isEn]
  );

  // slug mapping for language switch
  const frToEn: Record<string, string> = {
    "": "",
    "projets": "projects",
    "services": "services",
    "a-propos": "about",
    "engagement-associatif": "nonprofit-commitment",
    "contact": "contact",
    "mentions-legales": "legal-notice",
    "politique-de-confidentialite": "privacy-policy",
    "merci": "thank-you",
    "securite": "security",
    "blog": "blog",
    "cgv": "terms-of-sale",
    "faq": "faq",
  };
  const enToFr: Record<string, string> = Object.fromEntries(Object.entries(frToEn).map(([k, v]) => [v, k]));

  function switchLocalePath(path: string) {
    const p = path.startsWith("/en") ? path.slice(3) || "/" : path;
    const parts = p.split("/").filter(Boolean);
    const first = parts[0] || "";
    if (path.startsWith("/en")) {
      // EN -> FR
      const mapped = enToFr[first] ?? first;
      return mapped ? `/${mapped}${parts.slice(1).length ? `/${parts.slice(1).join("/")}` : ""}` : "/";
    } else {
      // FR -> EN
      const mapped = frToEn[first] ?? first;
      return `/en${mapped ? `/${mapped}${parts.slice(1).length ? `/${parts.slice(1).join("/")}` : ""}` : ""}`;
    }
  }

  const langSwitchHref = switchLocalePath(pathname);
  const pricingHref = isEn
    ? "/en/services"
    : (pathname === "/" ? "/#tarifs" : "/tarifs-2025#tarifs");

  // Phone CTA (desktop)
  const rawPhone = process.env.NEXT_PUBLIC_PHONE || "";
  const sanitizePhone = (p: string) => p.replace(/[^+\d]/g, "");
  const callHref = rawPhone ? `tel:${sanitizePhone(rawPhone)}` : (isEn ? "/en/contact" : "/contact");
  const displayPhone = useMemo(() => {
    const s = rawPhone.replace(/[^\d+]/g, "");
    if (s.startsWith("+33") && s.length >= 12) {
      const digits = s.replace("+33", "0");
      return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
    }
    const d = s.replace(/\D/g, "");
    if (d.length === 10) return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
    return rawPhone || (isEn ? "Call" : "Appeler");
  }, [rawPhone, isEn]);

  // Close on ESC and lock scroll when open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setOpenServices(false);
      setOpenProjets(false);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const [logoSrc, setLogoSrc] = useState(getLogoSrc(isDark, false));
  const [logoSrcSmall, setLogoSrcSmall] = useState(getLogoSrc(isDark, true));

  // If renamed files are not yet deployed under /public/logos, fallback to root file names the user provided
  useEffect(() => {
    const targetLarge = getLogoSrc(isDark, false);
    const targetSmall = getLogoSrc(isDark, true);
    setLogoSrc(targetLarge);
    setLogoSrcSmall(targetSmall);

    const check = async (url: string) => {
      try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
      } catch {
        return false;
      }
    };

    (async () => {
      const okLarge = await check(targetLarge);
      const okSmall = await check(targetSmall);

      const fallbackLarge = isDark ? "/logo-gran-blanc.svg" : "/logograndbleu.svg";
      const fallbackSmall = isDark ? "/logo-petit-blanc.svg" : "/logo-petit-bleue.svg";

      if (!okLarge) setLogoSrc(fallbackLarge);
      if (!okSmall) setLogoSrcSmall(fallbackSmall);
    })();
  }, [isDark]);

  return (
    <header className="sticky top-11 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href={isEn ? "/en" : "/"} className="flex items-center gap-3 text-sm font-semibold tracking-tight rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label={isEn ? "Home — smarterlogicweb" : "Accueil — smarterlogicweb"} title={isEn ? "Home — smarterlogicweb" : "Accueil — smarterlogicweb"}>
            <Image
              src={logoSrc}
              alt="Logo"
              width={96}
              height={96}
              className="h-20 w-20 transition-transform hover:scale-105"
              priority
            />
            <span className="sr-only">{isEn ? "Home" : "Accueil"}</span>
          </Link>
        </div>

        {/* Active link helpers */}
        {(() => {
          // Using an IIFE to compute active flags succinctly
          const isProjects = pathname.startsWith(`${isEn ? "/en" : ""}/${isEn ? "projects" : "projets"}`);
          const isServices = pathname.startsWith(`${isEn ? "/en" : ""}/services`);
          const isAbout = pathname.startsWith(`${isEn ? "/en" : ""}/${isEn ? "about" : "a-propos"}`);
          const isCommitment = pathname.startsWith(`${isEn ? "/en" : ""}/${isEn ? "nonprofit-commitment" : "engagement-associatif"}`);
          const isContact = pathname.startsWith(`${isEn ? "/en" : ""}/contact`);
          const isBlog = pathname.startsWith(`${isEn ? "/en" : ""}/blog`);

          const showProjects = available.has(isEn ? "projects" : "projets");
          const showServices = available.has("services");
          const showAbout = available.has(isEn ? "about" : "a-propos");
          const showCommitment = available.has(isEn ? "nonprofit-commitment" : "engagement-associatif");
          const showBlog = available.has("blog");
          // Contact: always show, even if the page is missing (fallback to /contact)
          // Render nav with computed states
          return (
            <nav aria-label={isEn ? "Main navigation" : "Navigation principale"} className="hidden items-center gap-6 md:flex">
              {/* Projets dropdown */}
              {showProjects && (
                <div className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-sm transition-colors hover:text-foreground ${isProjects ? "text-foreground font-semibold" : "text-muted-foreground"} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
                    aria-haspopup="menu"
                    aria-controls="menu-projects"
                    aria-expanded={isProjects}
                    aria-current={isProjects ? "page" : undefined}
                  >
                    {t.nav.projects}
                    <ChevronDown className="h-4 w-4 opacity-70 transition-transform group-hover:rotate-180" />
                  </button>
                  <div
                    role="menu"
                    className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover p-2 opacity-0 shadow-sm transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                  >
                    <Link href={`${prefix}/${isEn ? "projects#cases" : "projets#cases"}`.replace("//", "/")} role="menuitem" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/60">
                      {t.projects.item1}
                    </Link>
                    <Link href={`${prefix}/${isEn ? "projects#cases" : "projets#cases"}`.replace("//", "/")} role="menuitem" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/60">
                      {t.projects.item2}
                    </Link>
                    <Link href={`${prefix}/${isEn ? "projects#cases" : "projets#cases"}`.replace("//", "/")} role="menuitem" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/60">
                      {t.projects.item3}
                    </Link>
                  </div>
                </div>
              )}

              {/* Services dropdown */}
              {showServices && (
                <div className="relative group">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 text-sm transition-colors hover:text-foreground ${isServices ? "text-foreground font-semibold" : "text-muted-foreground"} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60`}
                    aria-haspopup="menu"
                    aria-controls="menu-services"
                    aria-expanded={isServices}
                    aria-current={isServices ? "page" : undefined}
                  >
                    {t.nav.services}
                    <ChevronDown className="h-4 w-4 opacity-70 transition-transform group-hover:rotate-180" />
                  </button>
                  <div
                    role="menu"
                    className="pointer-events-none absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border bg-popover p-2 opacity-0 shadow-sm transition group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                  >
                    <Link href={`${prefix}/services#vitrine`.replace("//", "/")} role="menuitem" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/60">
                      {t.services.item1}
                    </Link>
                    <Link href={`${prefix}/services#refonte`.replace("//", "/")} role="menuitem" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/60">
                      {t.services.item2}
                    </Link>
                    <Link href={`${prefix}/services#accompagnement`.replace("//", "/")} role="menuitem" className="block rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent/60">
                      {t.services.item3}
                    </Link>
                  </div>
                </div>
              )}

              {showAbout && (
                <Link
                  href={`${prefix}/${isEn ? "about" : "a-propos"}`.replace("//", "/")}
                  className={`text-sm transition-colors hover:text-foreground ${isAbout ? "text-foreground font-semibold" : "text-muted-foreground"} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
                  aria-current={isAbout ? "page" : undefined}
                >
                  {t.nav.about}
                </Link>
              )}
              {showCommitment && (
                <Link
                  href={`${prefix}/${isEn ? "nonprofit-commitment" : "engagement-associatif"}`.replace("//", "/")}
                  className={`text-sm transition-colors hover:text-foreground ${isCommitment ? "text-foreground font-semibold" : "text-muted-foreground"} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
                  aria-current={isCommitment ? "page" : undefined}
                >
                  {t.nav.commitment}
                </Link>
              )}
              {showBlog && (
                <Link
                  href={`${prefix}/blog`.replace("//", "/")}
                  className={`text-sm transition-colors hover:text-foreground ${isBlog ? "text-foreground font-semibold" : "text-muted-foreground"} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
                  aria-current={isBlog ? "page" : undefined}
                >
                  Blog
                </Link>
              )}
              <Link
                href={`${prefix}/contact`.replace("//", "/")}
                className={`text-sm transition-colors hover:text-foreground ${isContact ? "text-foreground font-semibold" : "text-muted-foreground"} rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
                aria-current={isContact ? "page" : undefined}
              >
                {t.nav.contact}
              </Link>

              {/* Language switch */}
              <Link href={langSwitchHref} className="inline-flex items-center rounded-full border px-2 py-1 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label={isEn ? "Basculer en français" : "Switch to English"}>
                {t.lang}
              </Link>
            </nav>
          );
        })()}

        {/* CTA desktop */}
        <div className="hidden items-center gap-2 md:flex">
          {rawPhone ? (
            <Button
              asChild
              size="sm"
              className="rounded-full px-4 py-2 text-sm font-medium"
              aria-label={isEn ? "Call now" : "Appeler maintenant"}
            >
              <a
                href={callHref}
                onClick={(e) => {
                  try {
                    track("cta_call_header");
                  } catch {}
                  try {
                    const href = e.currentTarget.getAttribute("href") || "";
                    const text = (e.currentTarget.textContent || "").trim();
                    const label = e.currentTarget.getAttribute("aria-label") || text || href;
                    const dl = (window as any).dataLayer;
                    if (Array.isArray(dl) && href.toLowerCase().startsWith("tel:")) {
                      dl.push({ event: "tel_click", link_url: href, link_text: text, label });
                    }
                  } catch {}
                }}
              >
                📞 {displayPhone}
              </a>
            </Button>
          ) : null}
          <Button
            asChild
            size="sm"
            className="rounded-full px-4 py-2 text-sm font-medium"
            aria-label={isEn ? "View pricing and examples" : "Voir les tarifs et exemples"}
          >
            <Link
              href={pricingHref}
              onClick={() => track("cta_view_pricing_header")}
            >
              {t.cta}
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          className="inline-flex items-center gap-2 rounded-md p-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          aria-label={open ? (isEn ? "Close menu" : "Fermer le menu") : (isEn ? "Open menu" : "Ouvrir le menu")}
          aria-controls="mobile-menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 block bg-background supports-[backdrop-filter]:bg-background/90 backdrop-blur md:hidden"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href={isEn ? "/en" : "/"} className="flex items-center gap-3 text-sm font-semibold tracking-tight rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label={isEn ? "Home — smarterlogicweb" : "Accueil — smarterlogicweb"} title={isEn ? "Home — smarterlogicweb" : "Accueil — smarterlogicweb"} onClick={() => setOpen(false)}>
                <Image src={logoSrcSmall} alt="Logo" width={96} height={96} className="h-20 w-20 transition-transform hover:scale-105" />
                <span className="sr-only">{isEn ? "Home" : "Accueil"}</span>
              </Link>
              <button
                className="inline-flex items-center gap-2 rounded-md p-3 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={isEn ? "Close menu" : "Fermer le menu"}
                onClick={() => setOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6 space-y-2 text-lg" aria-label={isEn ? "Mobile navigation" : "Navigation mobile"}>
              {/* Projets with submenu */}
              {available.has(isEn ? "projects" : "projets") && (
                <div>
                  <button
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-foreground hover:bg-accent/50"
                    aria-expanded={openProjets}
                    aria-controls="submenu-projets"
                    onClick={() => setOpenProjets((v) => !v)}
                  >
                    <span>{t.nav.projects}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openProjets ? "rotate-180" : ""}`} />
                  </button>
                  {openProjets && (
                    <div id="submenu-projets" className="ml-4 border-l pl-3">
                      <Link href={`${prefix}/${isEn ? "projects#cases" : "projets#cases"}`.replace("//", "/")} className="block py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                        {t.projects.item1}
                      </Link>
                      <Link href={`${prefix}/${isEn ? "projects#cases" : "projets#cases"}`.replace("//", "/")} className="block py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                        {t.projects.item2}
                      </Link>
                      <Link href={`${prefix}/${isEn ? "projects#cases" : "projets#cases"}`.replace("//", "/")} className="block py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                        {t.projects.item3}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Services with submenu */}
              {available.has("services") && (
                <div className="mt-1">
                  <button
                    className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-foreground hover:bg-accent/50"
                    aria-expanded={openServices}
                    aria-controls="submenu-services"
                    onClick={() => setOpenServices((v) => !v)}
                  >
                    <span>{t.nav.services}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${openServices ? "rotate-180" : ""}`} />
                  </button>
                  {openServices && (
                    <div id="submenu-services" className="ml-4 border-l pl-3">
                      <Link href={`${prefix}/services#vitrine`.replace("//", "/")} className="block py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                        {t.services.item1}
                      </Link>
                      <Link href={`${prefix}/services#refonte`.replace("//", "/")} className="block py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                        {t.services.item2}
                      </Link>
                      <Link href={`${prefix}/services#accompagnement`.replace("//", "/")} className="block py-2 text-muted-foreground hover:text-foreground" onClick={() => setOpen(false)}>
                        {t.services.item3}
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {available.has(isEn ? "about" : "a-propos") && (
                <Link href={`${prefix}/${isEn ? "about" : "a-propos"}`.replace("//", "/")} className="block rounded-md px-2 py-2 text-foreground hover:bg-accent/50" onClick={() => setOpen(false)}>
                  {t.nav.about}
                </Link>
              )}
              {available.has(isEn ? "nonprofit-commitment" : "engagement-associatif") && (
                <Link href={`${prefix}/${isEn ? "nonprofit-commitment" : "engagement-associatif"}`.replace("//", "/")} className="block rounded-md px-2 py-2 text-foreground hover:bg-accent/50" onClick={() => setOpen(false)}>
                  {t.nav.commitment}
                </Link>
              )}
              {available.has("blog") && (
                <Link href={`${prefix}/blog`.replace("//", "/")} className="block rounded-md px-2 py-2 text-foreground hover:bg-accent/50" onClick={() => setOpen(false)}>
                  Blog
                </Link>
              )}
              <Link href={`${prefix}/contact`.replace("//", "/")} className="block rounded-md px-2 py-2 text-foreground hover:bg-accent/50" onClick={() => setOpen(false)}>
                {t.nav.contact}
              </Link>

              {/* Language switch */}
              <div className="pt-2">
                <Link href={langSwitchHref} className="inline-flex items-center rounded-full border px-2 py-1 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label={isEn ? "Basculer en français" : "Switch to English"} onClick={() => setOpen(false)}>
                  {t.lang}
                </Link>
              </div>
            </nav>

            <div className="mt-6">
              <Button
                asChild
                className="w-full rounded-full"
                aria-label={isEn ? "View pricing and examples" : "Voir les tarifs et exemples"}
                onClick={() => setOpen(false)}
              >
                <Link href={pricingHref} onClick={() => track("cta_view_pricing_header_mobile")}>
                  {t.cta}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}