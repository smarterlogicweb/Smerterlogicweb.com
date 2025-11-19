"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";

type Props = {
  locale: "fr" | "en";
  action: string;
};

type Fields = {
  firstName: string;
  phone: string;
  metier: string;
  city?: string;
  consent: boolean;
  "bot-field"?: string;
};

export function ContactForm({ locale, action }: Props) {
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, touchedFields },
    watch,
    setValue,
  } = useForm<Fields>({ mode: "onChange" });

  const onSubmit = async (_: Fields, e?: React.BaseSyntheticEvent) => {
    // Track client-side just before native form submission
    try {
      const firstName = (watch("firstName") || "").trim();
      const metier = (watch("metier") || "").trim();
      const city = (watch("city") || "").trim();
      if (firstName && metier) {
        track("contact_form_submitted", { firstName, metier, city, locale });
      }
    } catch {}
    const form = e?.target as HTMLFormElement | undefined;
    if (form) form.submit();
  };

  const t = {
    firstName: locale === "fr" ? "Prénom" : "First name",
    phone: locale === "fr" ? "Téléphone" : "Phone",
    metier: locale === "fr" ? "Métier" : "Trade",
    city: locale === "fr" ? "Ville (optionnel)" : "City (optional)",
    send: locale === "fr" ? "📞 Être rappelé aujourd'hui" : "📞 Call me back today",
    sending: locale === "fr" ? "Envoi en cours..." : "Sending...",
    required: locale === "fr" ? "Champ requis." : "Required field.",
    reassurance:
      locale === "fr"
        ? "✓ Sans engagement ✓ Réponse sous 2h ✓ Audit offert"
        : "✓ No commitment ✓ Reply within 2h ✓ Free audit",
    invalidPhone: locale === "fr" ? "Numéro invalide (ex: 06 12 34 56 78)." : "Invalid phone number.",
    placeholderFirst: locale === "fr" ? "Votre prénom" : "Your first name",
    placeholderPhone: locale === "fr" ? "06 12 34 56 78" : "+33 6 12 34 56 78",
    placeholderCity: locale === "fr" ? "Votre ville" : "Your city",
    consentLabel:
      locale === "fr"
        ? <>En soumettant ce formulaire, vous acceptez le traitement de vos données conformément à notre{" "}
            <a href="/politique-de-confidentialite" className="underline">politique de confidentialité</a>.
          </>
        : <>By submitting this form, you agree to the processing of your data in accordance with our{" "}
            <a href="/en/privacy-policy" className="underline">privacy policy</a>.
          </>,
    mustAccept: locale === "fr" ? "Veuillez accepter la politique de confidentialité." : "Please accept the privacy policy.",
  };

  // Prefill from localStorage, URL params, and referrer
  React.useEffect(() => {
    try {
      const lf = (k: string) => {
        try {
          return localStorage.getItem(k) || "";
        } catch {
          return "";
        }
      };

      const urlFirst = searchParams?.get("first") || searchParams?.get("prenom") || searchParams?.get("firstName") || "";
      const urlPhone = searchParams?.get("phone") || searchParams?.get("tel") || "";
      const urlMetier = searchParams?.get("metier") || searchParams?.get("trade") || "";
      const urlCity = searchParams?.get("city") || "";

      const fromReferrer = (() => {
        if (typeof document === "undefined") return "";
        const ref = document.referrer || "";
        const mFr = ref.match(/\/site-web\/([^\/?#]+)/i);
        const mEn = ref.match(/\/en\/website\/([^\/?#]+)/i);
        const slug = (mFr?.[1] || mEn?.[1] || "").toLowerCase();
        if (!slug) return "";
        const mapFR: Record<string, string> = {
          plombier: "Plombier",
          electricien: "Électricien",
          boulanger: "Boulanger",
          coiffeur: "Coiffeur",
          "artisan-batiment": "Artisan du Bâtiment",
        };
        const mapEN: Record<string, string> = {
          plumber: "Plumber",
          electrician: "Electrician",
          baker: "Baker",
          hairdresser: "Hairdresser",
          "general-contractor": "General Contractor",
        };
        return (locale === "fr" ? mapFR[slug] : mapEN[slug]) || "";
      })();

      const initialFirst = urlFirst || lf("contact:firstName");
      const initialPhone = urlPhone || lf("contact:phone");
      const initialMetier = urlMetier || fromReferrer || lf("contact:metier");
      const initialCity = urlCity || lf("contact:city");

      if (initialFirst) setValue("firstName", initialFirst, { shouldValidate: true });
      if (initialPhone) setValue("phone", initialPhone, { shouldValidate: true });
      if (initialMetier) setValue("metier", initialMetier, { shouldValidate: true });
      if (initialCity) setValue("city", initialCity, { shouldValidate: true });
    } catch {
      // ignore
    }
  }, [searchParams, setValue, locale]);

  // Persist as user types
  const firstNameVal = watch("firstName");
  const phoneVal = watch("phone");
  const metierVal = watch("metier");
  const cityVal = watch("city");

  React.useEffect(() => {
    try {
      localStorage.setItem("contact:firstName", firstNameVal || "");
    } catch {}
  }, [firstNameVal]);

  React.useEffect(() => {
    try {
      localStorage.setItem("contact:phone", phoneVal || "");
    } catch {}
  }, [phoneVal]);

  React.useEffect(() => {
    try {
      localStorage.setItem("contact:metier", metierVal || "");
    } catch {}
  }, [metierVal]);

  React.useEffect(() => {
    try {
      localStorage.setItem("contact:city", cityVal || "");
    } catch {}
  }, [cityVal]);

  const validatePhone = (val: string) => {
    const raw = String(val || "");
    const sanitized = raw.replace(/[\\s.()-]/g, "");
    if (locale === "fr") {
      const ok = /^(\\+33|0)[1-9]\\d{8}$/.test(sanitized);
      return ok || t.invalidPhone;
    }
    const ok = /^[+]?[\\d\\s().-]{6,}$/.test(raw);
    return ok || t.invalidPhone;
  };

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      action={action}
      className="mt-4 grid gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <input type="hidden" name="form-name" value="contact" />
      <p className="hidden">
        <label>Don’t fill: <input {...register("bot-field")} /></label>
      </p>

      {/* Prénom */}
      <div className="grid gap-2">
        <div className="relative fl-group">
          <input
            id="firstName"
            className={`peer fl-input h-11 w-full rounded-md border bg-background px-3 outline-none ring-offset-background transition-colors input-glow placeholder-transparent
            ${errors.firstName ? "border-red-400" : "border-foreground/20"}
            `}
            placeholder=" "
            {...register("firstName", { required: t.required })}
          />
          <label
            htmlFor="firstName"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200
            peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-foreground
            peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-foreground"
          >
            {t.firstName}
          </label>
          {touchedFields.firstName && !errors.firstName ? (
            <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500 transition-transform duration-300" />
          ) : null}
        </div>
        {errors.firstName && <div className="text-sm text-red-500">{errors.firstName.message}</div>}
      </div>

      {/* Téléphone */}
      <div className="grid gap-2">
        <div className="relative fl-group">
          <input
            id="phone"
            type="tel"
            className={`peer fl-input h-11 w-full rounded-md border bg-background px-3 outline-none ring-offset-background transition-colors input-glow placeholder-transparent
            ${errors.phone ? "border-red-400" : "border-foreground/20"}
            `}
            placeholder=" "
            {...register("phone", {
              required: t.required,
              validate: validatePhone,
            })}
          />
          <label
            htmlFor="phone"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200
            peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-foreground
            peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-foreground"
          >
            {t.phone}
          </label>
          {touchedFields.phone && !errors.phone ? (
            <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500 transition-transform duration-300" />
          ) : null}
        </div>
        {errors.phone && <div className="text-sm text-red-500">{errors.phone.message}</div>}
      </div>

      {/* Métier */}
      <div className="grid gap-2">
        <div className="relative">
          <select
            id="metier"
            className={`h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background transition-colors
            ${errors.metier ? "border-red-400" : "border-foreground/20"}
            `}
            {...register("metier", { required: t.required })}
            defaultValue=""
          >
            <option value="" disabled>{t.metier}</option>
            <option value="Plombier">{locale === "fr" ? "Plombier" : "Plumber"}</option>
            <option value="Électricien">{locale === "fr" ? "Électricien" : "Electrician"}</option>
            <option value="Boulanger">{locale === "fr" ? "Boulanger" : "Baker"}</option>
            <option value="Coiffeur">{locale === "fr" ? "Coiffeur" : "Hairdresser"}</option>
            <option value="Artisan du Bâtiment">{locale === "fr" ? "Artisan du Bâtiment" : "General Contractor"}</option>
            <option value="Autre">{locale === "fr" ? "Autre" : "Other"}</option>
          </select>
        </div>
        {errors.metier && <div className="text-sm text-red-500">{errors.metier.message}</div>}
      </div>

      {/* Ville (optionnel) */}
      <div className="grid gap-2">
        <div className="relative fl-group">
          <input
            id="city"
            className="peer fl-input h-11 w-full rounded-md border border-foreground/20 bg-background px-3 outline-none ring-offset-background transition-colors input-glow placeholder-transparent"
            placeholder=" "
            {...register("city")}
          />
          <label
            htmlFor="city"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground transition-all duration-200
            peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-foreground
            peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-foreground"
          >
            {t.city}
          </label>
        </div>
      </div>

      {/* Consentement RGPD */}
      <div className="mt-2">
        <label htmlFor="consent" className="flex items-start gap-2 text-sm">
          <input
            id="consent"
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-foreground/30"
            {...register("consent", { required: true })}
          />
          <span>{t.consentLabel}</span>
        </label>
        {errors.consent && (
          <div className="mt-1 text-sm text-red-500">{t.mustAccept}</div>
        )}
      </div>

      <div>
        <Button
          type="submit"
          className="rounded-full"
          variant="cta"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.sending}
            </span>
          ) : (
            t.send
          )}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">{t.reassurance}</p>
      </div>
    </form>
  );
}
     