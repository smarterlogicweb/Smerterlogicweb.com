"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

type Props = {
  slug: "grille-tarifs-2025" | "wp-vs-site-statique-3-ans";
  label?: string;
  className?: string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function PdfDownloadButton({ slug, label = "Recevoir le PDF par email", className }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<null | { emailed: boolean; downloadUrl: string }>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadUrl = `/api/pdf/${slug}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Adresse email invalide");
      return;
    }
    setSending(true);
    try {
      // Track intent before sending
      try {
        track("pdf_pricing_downloaded", { slug, emailProvided: true });
      } catch {}
      const res = await fetch("/api/pdf/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Erreur lors de l’envoi");
      }
      setDone({ emailed: !!data.emailed, downloadUrl: data.downloadUrl || downloadUrl });
      // Start download immediately (ne pas bloquer le lecteur)
      window.open(downloadUrl, "_blank");
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue");
      // Fallback: démarrer quand même le téléchargement
      window.open(downloadUrl, "_blank");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={className}>
      {!open ? (
        <button
          onClick={() => {
            setOpen(true);
            try {
              track("pdf_intent_opened", { slug });
            } catch {}
          }}
          className="inline-flex items-center rounded-full border bg-card px-4 py-2 text-sm hover:bg-accent"
        >
          {label}
        </button>
      ) : (
        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-4">
          <label className="block text-sm font-medium">Votre email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@cabinet.fr"
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
          {done ? (
            <p className="mt-2 text-xs text-emerald-600">
              {done.emailed
                ? "Lien envoyé par email. Le téléchargement démarre..."
                : "Téléchargement démarré. Un email sera envoyé si la fonction est activée."}
            </p>
          ) : null}
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
            >
              {sending ? "Envoi..." : "Envoyer et télécharger"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center rounded-full border px-4 py-2 text-sm hover:bg-accent"
            >
              Annuler
            </button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Nous n’envoyons aucun spam. Vous pouvez répondre à l’email pour demander un devis.
          </p>
        </form>
      )}
    </div>
  );
}