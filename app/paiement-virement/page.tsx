import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Paiement par virement — smarterlogicweb.com",
  description:
    "Paiement par virement bancaire (IBAN + QR SEPA). Alternative sans frais de transaction.",
  alternates: {
    canonical: "/paiement-virement",
    languages: {
      "fr-FR": "/paiement-virement",
      "en-US": "/en", // no dedicated EN page yet
    },
  },
  openGraph: {
    url: "https://smarterlogicweb.com/paiement-virement",
    title: "Paiement par virement — smarterlogicweb.com",
    description:
      "Paiement par virement bancaire (IBAN + QR SEPA). Alternative sans frais de transaction.",
  },
};

function env() {
  return {
    name: (process.env.NEXT_PUBLIC_BENEFICIARY_NAME || "").trim(),
    iban: (process.env.NEXT_PUBLIC_IBAN || "").replace(/\s+/g, ""),
    bic: (process.env.NEXT_PUBLIC_BIC || "").trim(),
  };
}

// Generate EPC QR payload (SEPA Credit Transfer)
// BCD
// 001
// 1
// SCT
// BIC
// NAME
// IBAN
// EUR{amount}
// {remittance}
// {empty line}
function epcPayload({ name, iban, bic, amount, remittance }: { name: string; iban: string; bic: string; amount?: string; remittance?: string }) {
  const amt = amount ? `EUR${amount}` : "";
  const rem = remittance || "";
  return [
    "BCD",
    "001",
    "1",
    "SCT",
    bic,
    name,
    iban,
    amt,
    rem,
    "",
  ].join("\n");
}

function qrUrl(payload: string) {
  const base = "https://api.qrserver.com/v1/create-qr-code/";
  const params = new URLSearchParams({
    data: payload,
    size: "240x240",
    qzone: "2",
    margin: "2",
  });
  return `${base}?${params.toString()}`;
}

export default function VirementPage() {
  const { name, iban, bic } = env();

  const variants = [
    { label: "Essentiel — 1 490€ TTC", amount: "1490.00", ref: "SITE-ESSENTIEL" },
    { label: "Professionnel — 2 490€ TTC", amount: "2490.00", ref: "SITE-PRO" },
    { label: "Premium — 4 990€ TTC", amount: "4990.00", ref: "SITE-PREMIUM" },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 md:py-24">
      <div className="text-center">
        <Badge variant="secondary" className="px-3 py-1">Paiement</Badge>
        <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight md:text-5xl">Paiement par virement</h1>
        <p className="mt-4 text-foreground/80">
          Alternative sans frais de transaction. Utilisez l’IBAN ci‑dessous ou scannez un QR SEPA prêt à l’emploi.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border bg-card p-6 card-elevated">
        <h2 className="font-heading text-xl font-semibold">Coordonnées bancaires</h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          <li><span className="text-muted-foreground">Bénéficiaire:</span> <span className="font-medium">{name || "—"}</span></li>
          <li><span className="text-muted-foreground">IBAN:</span> <span className="font-mono">{iban || "—"}</span></li>
          <li><span className="text-muted-foreground">BIC:</span> <span className="font-mono">{bic || "—"}</span></li>
        </ul>
        {!name || !iban || !bic ? (
          <p className="mt-3 text-xs text-amber-600">
            Renseignez NEXT_PUBLIC_BENEFICIARY_NAME, NEXT_PUBLIC_IBAN et NEXT_PUBLIC_BIC pour activer l’affichage.
          </p>
        ) : null}
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl font-semibold">QR SEPA prêts à l’emploi</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {variants.map((v) => {
            const payload = epcPayload({ name, iban, bic, amount: v.amount, remittance: v.ref });
            const url = qrUrl(payload);
            return (
              <article key={v.ref} className="rounded-2xl border bg-card p-4 card-elevated text-center">
                <h3 className="font-heading text-sm font-semibold">{v.label}</h3>
                <div className="mt-3">
                  <img src={url} alt={`QR SEPA ${v.label}`} className="mx-auto h-40 w-40 rounded-md border" />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Référence virement: <span className="font-mono">{v.ref}</span>
                </p>
              </article>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Vous pouvez aussi choisir le paiement immédiat par carte:{" "}
          <Link href="/tarifs-2025" className="underline">voir les liens “Payer maintenant”</Link>.
        </p>
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button asChild className="rounded-full" variant="secondary">
          <Link href="/tarifs-2025">← Retour aux tarifs</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href="/contact">Contacter avant paiement</Link>
        </Button>
      </div>
    </div>
  );
}