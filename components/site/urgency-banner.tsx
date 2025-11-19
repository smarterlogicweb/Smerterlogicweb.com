"use client";

import * as React from "react";
import Link from "next/link";
import { URGENCY_SLOTS_LEFT_MONTH } from "@/data/pricing";

/**
 * UrgencyBanner
 * - Remplace le rouge par un style harmonisé "bleu ↔ blanc" qui alterne en douceur
 * - Respecte prefers-reduced-motion (aucune alternance si activé)
 * - Optionnel: variante "stripes" (hachures) via le prop `variant="stripes"`
 */
export function UrgencyBanner({
  variant = "alternate",
}: {
  variant?: "alternate" | "stripes";
}) {
  const [invert, setInvert] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // Synchronise la hauteur réelle de la bannière dans une variable CSS (--banner-h)
  // afin que la mise en page (espacement + Header sticky) s'adapte dynamiquement,
  // notamment sur mobile où le contenu peut passer sur 2 lignes.
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const apply = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--banner-h", `${Math.round(h)}px`);
    };
    apply();

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    const onResize = () => apply();
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      // Nettoyage pour éviter un décalage persistant si la bannière est retirée
      document.documentElement.style.removeProperty("--banner-h");
    };
  }, []);

  // Alternance automatique (bleu ↔ blanc) si variante "alternate"
  React.useEffect(() => {
    if (variant !== "alternate") return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setInvert(false);
      return;
    }

    const id = window.setInterval(() => setInvert((v) => !v), 2500);
    return () => window.clearInterval(id);
  }, [variant]);

  const base =
    "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-700";
  const palette =
    variant === "alternate"
      ? invert
        ? "bg-white text-primary"
        : "bg-primary text-white"
      : "banner-stripes text-foreground";

  return (
    <div ref={ref} className={`${base} ${palette}`} role="region" aria-label="Annonce de disponibilité">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex items-center justify-center gap-3 py-2 text-sm">
          <span className="font-medium">
            ⚡ Plus que {URGENCY_SLOTS_LEFT_MONTH} créneaux disponibles ce mois-ci. Réservez votre audit gratuit !
          </span>
          <Link
            href="/contact"
            className={[
              "relative inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              // Bouton s'adapte selon le fond actuel
              variant === "alternate"
                ? invert
                  ? // fond clair → bouton bleu
                    "bg-primary text-white hover:bg-primary/90 ring-1 ring-primary/30 focus-visible:ring-primary/60"
                  : // fond bleu → bouton blanc
                    "bg-white text-primary hover:bg-white/90 ring-1 ring-white/30 focus-visible:ring-white/80"
                : // stripes → bouton bleu lisible
                  "bg-primary text-white hover:bg-primary/90 ring-1 ring-primary/30 focus-visible:ring-primary/60",
              "shadow-sm btn-shine",
            ].join(" ")}
          >
            Réserver maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}