import { Mail, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/site/tracked-link";
import { Reveal } from "@/components/site/reveal";
import { GoogleReviewsBadge } from "@/components/site/google-reviews";
import { BookingButton } from "@/components/site/booking-modal";
import { Guarantee } from "@/components/site/guarantee";
import { Particles } from "@/components/site/particles";
import { ContactForm } from "@/components/site/contact-form";

export const metadata = {
  title: "Contact — smarterlogicweb.com",
  description: "Contactez-moi pour un devis gratuit ou pour discuter de votre projet.",
  alternates: {
    canonical: "/contact",
    languages: {
      "fr-FR": "/contact",
      "en-US": "/en/contact",
    },
  },
  openGraph: {
    url: "https://smarterlogicweb.com/contact",
    title: "Contact — smarterlogicweb.com",
    description: "Contactez-moi pour un devis gratuit ou pour discuter de votre projet.",
  },
};

export default function ContactPage() {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      {/* Hero background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-gradient-animated absolute inset-0 rounded-[28px] opacity-60" />
        <Particles />
      </div>

      {/* Hero card */}
      <div className="rounded-[28px] card-elevated border bg-card p-6 shadow-sm">
        <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">Contact</h1>
        <p className="mt-4 text-lg leading-relaxed text-foreground/80">
          Le moyen le plus simple et le plus rapide : l&#39;email. Décrivez votre besoin, vos objectifs et vos contraintes — je reviens vers vous sous 24h.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="rounded-full" variant="cta">
            <TrackedLink href="mailto:contact@smarterlogicweb.com?subject=Devis%20gratuit" eventName="cta_devis_mailto_contact">
              <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> contact@smarterlogicweb.com</span>
            </TrackedLink>
          </Button>
          <BookingButton size="lg" className="rounded-full" label="Réserver mon audit gratuit (15 min)" />
          {process.env.NEXT_PUBLIC_PHONE ? (
            <Button asChild size="lg" className="rounded-full">
              <a href={`tel:${(process.env.NEXT_PUBLIC_PHONE as string).replace(/[^+\d]/g, "")}`}>📞 Appeler</a>
            </Button>
          ) : null}
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">Retour à l’accueil</Link>
        </div>

        {/* Note Google près du CTA */}
        <div className="mt-4">
          <GoogleReviewsBadge />
        </div>

        {/* Badges de réassurance (slide-in) */}
        <Reveal className="reveal-fade-up">
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { Icon: Clock, text: "Réponse sous 24h" },
              { Icon: ShieldCheck, text: "Tarifs transparents" },
              { Icon: CheckCircle2, text: "Sans engagement" },
            ].map((b, i) => (
              <div key={b.text} className="flex items-center gap-2 rounded-xl border bg-card p-3" style={{ transitionDelay: `${i * 150}ms` }}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent text-foreground">
                  <b.Icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{b.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Formulaire (envoi email pur via Resend) */}
      <div className="mt-10 rounded-[28px] card-elevated border bg-card p-6 shadow-sm">
        <Reveal as="h2" className="h2-underline text-left font-heading text-xl font-semibold">Envoyer un message</Reveal>
        <div className="mt-3">
          <ContactForm locale="fr" action="/api/contact-email" />
        </div>
      </div>

      {/* Conseils pour un premier message efficace */}
      <div className="mt-10 rounded-[28px] card-elevated border bg-card p-6 shadow-sm">
        <Reveal as="h2" className="h2-underline text-left font-heading text-xl font-semibold">Pour un premier message efficace</Reveal>
        <Reveal className="reveal-fade-up">
          <ul className="mt-3 list-disc pl-5 text-sm leading-relaxed text-foreground/80">
            <li>Objectif principal du site (vitrine, refonte, optimisation…)</li>
            <li>3 à 5 pages envisagées</li>
            <li>Exemples de sites que vous aimez</li>
            <li>Échéance et budget indicatif</li>
          </ul>
        </Reveal>
      </div>

      {/* Garantie (optionnelle sur la page contact) */}
      <div className="mt-10">
        <Guarantee />
      </div>

      {/* Quick links — bottom of page */}
      <section className="mx-auto w-full max-w-3xl px-0 py-8">
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
    </section>
  );
}