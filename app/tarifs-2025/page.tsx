import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Particles } from "@/components/site/particles";
import { PricingOffers } from "@/components/site/pricing-offers";
import { ServicesCompare } from "@/components/site/services-compare";
import { FAQServices } from "@/components/site/faq-services";
import { BookingButton } from "@/components/site/booking-modal";
import { GoogleReviewsBadge } from "@/components/site/google-reviews";
import { Guarantee } from "@/components/site/guarantee";
import { FinalCTA } from "@/components/site/final-cta";
import { StickyMobileCTA } from "@/components/site/sticky-mobile-cta";
import { EVOLUTION_MONTHLY_EUR } from "@/data/pricing";
import { PdfDownloadButton } from "@/components/site/pdf-download-button";

export const metadata = {
  title: "Tarifs 2025 — smarterlogicweb.com",
  description:
    "Sites statiques pour professions libérales (avocats, experts‑comptables, architectes). Zéro maintenance technique obligatoire, performances, SEO et délais garantis.",
  alternates: {
    canonical: "/tarifs-2025",
    languages: {
      "fr-FR": "/tarifs-2025",
      "en-US": "/en/services",
    },
  },
  openGraph: {
    url: "https://smarterlogicweb.com/tarifs-2025",
    title: "Tarifs 2025 — smarterlogicweb.com",
    description:
      "Sites statiques pour professions libérales (avocats, experts‑comptables, architectes). Zéro maintenance obligatoire, performances et SEO au cœur.",
  },
};

function paymentLinks() {
  return {
    essentiel: (process.env.NEXT_PUBLIC_STRIPE_LINK_ESSENTIEL || "").trim(),
    professionnel: (process.env.NEXT_PUBLIC_STRIPE_LINK_PROFESSIONNEL || "").trim(),
    premium: (process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM || "").trim(),
  };
}

export default function Tarifs2025Page() {
  const links = paymentLinks();

  return (
    <div className="relative mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
      {/* Hero background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-gradient-animated absolute inset-0 rounded-[28px] opacity-60" />
        <Particles />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-3xl text-center">
        <Badge variant="secondary" className="px-3 py-1">Tarifs 2025</Badge>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight md:text-5xl text-balance">
          Sites statiques pour Professions Libérales
        </h1>
        <p className="mt-4 text-foreground/80">
          Avocats, experts‑comptables, architectes — sites rapides, sécurisés, SEO et conversion.
          Zéro maintenance technique obligatoire.
        </p>
      </section>

      {/* Notre différence — WordPress vs Statique */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Notre différence</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border bg-card p-6 card-elevated">
            <h3 className="font-heading text-lg font-semibold">WordPress classique</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
              <li>Création: 1 500€</li>
              <li>Maintenance 3 ans: 1 800€ (290€ à 600€/an)</li>
              <li className="font-semibold">Total 3 ans: 3 300€</li>
            </ul>
          </article>
          <article className="rounded-2xl border bg-card p-6 card-elevated">
            <h3 className="font-heading text-lg font-semibold">Notre site professionnel (statique)</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
              <li>Création: 2 490€</li>
              <li>Maintenance: 0€ (pas de mises à jour obligatoires)</li>
              <li className="font-semibold">Total 3 ans: 2 490€</li>
            </ul>
            <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium">Économie: 810€ et un site plus rapide et plus sécurisé.</p>
          </article>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Sites statiques = pas de base de données, pas de plugins, pas de CMS à maintenir. Sécurité intrinsèque et fiabilité long terme.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Pour approfondir :{" "}
          <Link href="/blog/cout-maintenance-site-web" className="text-primary hover:underline">coût de la maintenance</Link>
          {" · "}
          <Link href="/blog/contenu-forfait-maintenance-site-web" className="text-primary hover:underline">contenu d’un forfait</Link>
          {" · "}
          <Link href="/blog/frais-caches-site-internet" className="text-primary hover:underline">frais cachés</Link>.
        </p>
      </section>

      {/* Offres & tarifs (cartes) */}
      <section id="tarifs" className="mt-10">
        <PricingOffers />
        <div className="mt-6 rounded-2xl border bg-card p-6 card-elevated">
          <h3 className="font-heading text-lg font-semibold">Recevoir la grille PDF par email</h3>
          <p className="mt-1 text-sm text-foreground/80">
            Téléchargez la Grille Tarifs 2025 et recevez‑la par email pour la partager en interne.
          </p>
          <div className="mt-3">
            <PdfDownloadButton slug="grille-tarifs-2025" label="Recevoir la Grille Tarifs 2025 (PDF)" />
          </div>
        </div>
      </section>

      {/* Paiement immédiat */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Paiement immédiat</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border bg-card p-6 card-elevated text-center">
            <h3 className="font-heading text-lg font-semibold">Essentiel</h3>
            <p className="mt-1 text-sm text-muted-foreground">1 490€ TTC</p>
            <div className="mt-3">
              {links.essentiel ? (
                <Button asChild className="w-full rounded-full">
                  <a href={links.essentiel} target="_blank" rel="noopener noreferrer">Payer maintenant</a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Lien de paiement bientôt disponible.</p>
              )}
            </div>
          </article>
          <article className="rounded-2xl border bg-card p-6 card-elevated text-center">
            <h3 className="font-heading text-lg font-semibold">Professionnel</h3>
            <p className="mt-1 text-sm text-muted-foreground">2 490€ TTC</p>
            <div className="mt-3">
              {links.professionnel ? (
                <Button asChild className="w-full rounded-full">
                  <a href={links.professionnel} target="_blank" rel="noopener noreferrer">Payer maintenant</a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Lien de paiement bientôt disponible.</p>
              )}
            </div>
          </article>
          <article className="rounded-2xl border bg-card p-6 card-elevated text-center">
            <h3 className="font-heading text-lg font-semibold">Premium</h3>
            <p className="mt-1 text-sm text-muted-foreground">4 990€ TTC</p>
            <div className="mt-3">
              {links.premium ? (
                <Button asChild className="w-full rounded-full">
                  <a href={links.premium} target="_blank" rel="noopener noreferrer">Payer maintenant</a>
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Lien de paiement bientôt disponible.</p>
              )}
            </div>
          </article>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Alternative sans frais: <Link href="/paiement-virement" className="underline">paiement par virement (IBAN + QR SEPA)</Link>.
        </p>
      </section>

      {/* Option: Formule Évolution */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Option: Formule Évolution</h2>
        <div className="mt-4 rounded-2xl border bg-card p-6 card-elevated">
          <p className="text-sm text-foreground/80">
            {EVOLUTION_MONTHLY_EUR}€/mois, sans engagement — 1h de modifications/mois (textes, images, sections),
            heures cumulables sur 3 mois, support prioritaire, monitoring (uptime, vitesse) et tarifs préférentiels (-30% refonte, -25% fonctionnalités, article SEO 99€).
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Offerte 6 mois avec l’Offre Premium. Disponible après livraison du site (prélèvement automatique SEPA).
          </p>
        </div>
      </section>

      {/* Modalités de paiement */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Modalités de paiement</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border bg-card p-6 card-elevated">
            <h3 className="font-heading text-lg font-semibold">Essentiel — 1 490€ TTC</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
              <li>50% à la signature — 745€</li>
              <li>50% à la livraison — 745€</li>
            </ul>
          </article>
          <article className="rounded-2xl border bg-card p-6 card-elevated">
            <h3 className="font-heading text-lg font-semibold">Professionnel — 2 490€ TTC</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
              <li>50% à la signature — 1 245€</li>
              <li>30% à validation maquettes — 747€</li>
              <li>20% à la livraison — 498€</li>
            </ul>
          </article>
          <article className="rounded-2xl border bg-card p-6 card-elevated">
            <h3 className="font-heading text-lg font-semibold">Premium — 4 990€ TTC</h3>
            <ul className="mt-2 list-disc pl-5 text-sm text-foreground/80">
              <li>40% à la signature — 1 996€</li>
              <li>30% à validation maquettes — 1 497€</li>
              <li>20% à la recette intermédiaire — 998€</li>
              <li>10% à la livraison — 499€</li>
            </ul>
          </article>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Paiement en plus de 4 fois non accepté. Tarifs TTC — TVA non applicable (art. 293 B du CGI si micro‑entreprise).
        </p>
      </section>

      {/* Tableau comparatif */}
      <section className="mt-10">
        <ServicesCompare />
      </section>

      {/* Garantie */}
      <div className="mt-6">
        <Guarantee />
      </div>

      {/* FAQ */}
      <section id="faq" className="mt-6 scroll-mt-24">
        <FAQServices />
      </section>

      {/* Comment commander */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Comment commander</h2>
        <ol className="mt-3 list-decimal pl-5 text-sm text-foreground/80 space-y-1.5">
          <li>Choisissez votre offre (Essentiel, Professionnel ou Premium)</li>
          <li>Contactez‑nous: <Link href="/contact" className="link-underline link-underline-strong">smarterlogicweb.com/contact</Link></li>
          <li>Cadrage du projet (30–45 min — appel/visio)</li>
          <li>Devis détaillé ligne par ligne + planning de livraison</li>
          <li>Signature électronique + versement de l’acompte</li>
          <li>Démarrage sous 7 jours (2 semaines pour Premium)</li>
        </ol>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BookingButton className="rounded-full btn-pulse" size="lg" label="Réserver mon audit gratuit (15 min)" />
          <Button asChild className="rounded-full" variant="secondary">
            <a href="mailto:contact@smarterlogicweb.com?subject=Devis%20site%20statique%20—%20Tarifs%202025">Demander un devis par email</a>
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-center">
          <GoogleReviewsBadge />
        </div>
      </section>

      {/* Clients ciblés */}
      <section className="mt-10">
        <h2 className="font-heading text-2xl font-semibold">Clients ciblés</h2>
        <ul className="mt-3 list-disc pl-5 text-sm text-foreground/80 space-y-1.5">
          <li>Cabinets d’avocats (affaires, travail, famille)</li>
          <li>Experts‑comptables et commissaires aux comptes</li>
          <li>Architectes et architectes d’intérieur</li>
          <li>Notaires et juristes</li>
          <li>Consultants et professions libérales réglementées</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          SEO multi‑secteur: le site vise à capter des clients par requêtes ciblées (locales et nationales).
        </p>
      </section>

      {/* Final CTA */}
      <FinalCTA />

      {/* Quick links — bottom of page */}
      <section className="mx-auto w-full max-w-3xl px-6 py-8">
        <div className="rounded-[28px] card-elevated border bg-card p-6 text-center">
          <h3 className="font-heading text-xl font-semibold">Pour approfondir</h3>
          <p className="mt-2 text-sm text-foreground/80">
            Maintenance, coûts et garanties — liens rapides :
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <Link href="/blog/cout-maintenance-site-web" className="text-primary hover:underline">
              Coût de la maintenance
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/blog/contenu-forfait-maintenance-site-web" className="text-primary hover:underline">
              Contenu d’un forfait
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/blog/frais-caches-site-internet" className="text-primary hover:underline">
              Frais cachés après la livraison
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link href="/tarifs-2025" className="text-primary hover:underline">
              Tarifs 2025
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky CTA mobile */}
      <StickyMobileCTA />
    </div>
  );
}