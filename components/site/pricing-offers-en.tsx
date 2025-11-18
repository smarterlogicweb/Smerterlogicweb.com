import * as React from "react";
import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingButton } from "@/components/site/booking-modal";
import { URGENCY_SLOTS_LEFT_MONTH } from "@/data/pricing";
import { Button } from "@/components/ui/button";

type Plan = {
  name: string;
  price: string;
  features: string[];
  recommended?: boolean;
};

const PLANS_EN: Plan[] = [
  {
    name: "Essential",
    price: "€1,490 incl. VAT",
    features: [
      "Static site 3–5 pages",
      "Semi‑custom template",
      "Basic technical SEO",
      "Contact form + Maps + SSL",
      "Netlify hosting free for life",
      "Domain included for 1 year",
      "Email support for 1 month",
    ],
  },
  {
    name: "Professional",
    price: "€2,490 incl. VAT",
    recommended: true,
    features: [
      "5–8 pages, bespoke design",
      "Full copywriting included",
      "Advanced SEO + internal linking",
      "Analytics + Calendly/booking",
      "Multi‑step lead form",
      "Performance 95+ desktop / 90+ mobile",
      "Priority support for 3 months",
    ],
  },
  {
    name: "Premium",
    price: "€4,990 incl. VAT",
    features: [
      "10–15 pages or multilingual (FR/EN)",
      "Premium design + micro‑animations",
      "Long‑form copy + 5 SEO articles",
      "Complete SEO strategy (6 months)",
      "CRM + advanced APIs + client area",
      "Performance 98+ guaranteed",
      "6 months of Evolution plan included",
    ],
  },
];

function getPaymentLink(name: string): string {
  // Reuse FR env vars to avoid duplication
  const map: Record<string, string | undefined> = {
    Essential: process.env.NEXT_PUBLIC_STRIPE_LINK_ESSENTIEL,
    Professional: process.env.NEXT_PUBLIC_STRIPE_LINK_PROFESSIONNEL,
    Premium: process.env.NEXT_PUBLIC_STRIPE_LINK_PREMIUM,
  };
  return (map[name] || "").trim();
}

export function PricingOffersEN() {
  const slides = PLANS_EN.map((plan) => <PlanCard key={plan.name} plan={plan} />);

  return (
    <section id="pricing" className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 text-center">
        <h2 className="font-heading text-3xl font-semibold md:text-4xl">Plans & pricing</h2>
        <p className="mt-2 text-foreground/70">
          Clear packages for professionals — performance, SEO and conversions at the core.
        </p>
      </div>

      <p className="mb-4 text-center text-sm font-medium text-primary">
        <span className="mr-1">⚠️</span>
        Only {URGENCY_SLOTS_LEFT_MONTH} slots left this month.{" "}
        <a href="/en/contact" className="link-underline link-underline-strong">
          Book your free audit!
        </a>
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {slides}
      </div>

      <p className="mt-5 text-sm text-foreground/70">
        Note: these prices apply if you already have basic brand assets (logo, color palette, content). If you need help
        with visual identity, we can recommend partner designers.
      </p>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const link = getPaymentLink(plan.name);

  return (
    <article
      className={cn(
        "relative rounded-[24px] border bg-card p-5 transition card-elevated hover:shadow-lg min-h-[22rem] h-full flex flex-col",
        plan.recommended ? "ring-2 ring-amber-400 border-amber-300" : ""
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
          {plan.recommended ? (
            <span className="badge-premium inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-2.5 py-0.5 text-[11px] font-semibold text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <Star className="h-3.5 w-3.5" /> Recommended
            </span>
          ) : null}
        </div>

        <div className="mt-1 text-2xl font-extrabold md:text-3xl">{plan.price}</div>

        <ul className="mt-3 space-y-1.5">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 grid grid-cols-1 gap-2">
          <BookingButton className="w-full h-11 md:h-12 text-base" label="Book my free audit (15 min)" />
          {link ? (
            <Button asChild className="w-full h-11 md:h-12 text-base" variant="secondary">
              <a href={link} rel="noopener noreferrer" target="_blank">Pay now</a>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}