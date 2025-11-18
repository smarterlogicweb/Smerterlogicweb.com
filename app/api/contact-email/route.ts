import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") || "";
  const isForm = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");

  if (!isForm) {
    return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
  }

  const formData = await req.formData();

  // Honeypot anti-spam: ignore if bot-field is filled
  const botField = String(formData.get("bot-field") || "").trim();
  if (botField) {
    // Silently succeed and redirect
    return NextResponse.redirect(new URL("/merci", req.url), { status: 303 });
  }

  const firstName = String(formData.get("firstName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const metier = String(formData.get("metier") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const consent = String(formData.get("consent") || "").toLowerCase() === "on";

  if (!firstName || !phone || !metier || !consent) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 422 });
  }

  const toEmail = (process.env.CONTACT_EMAIL_TO || "contact@smarterlogicweb.com").trim();
  const fromEmail = (process.env.CONTACT_EMAIL_FROM || "noreply@smarterlogicweb.com").trim();
  const resendKey = (process.env.RESEND_API_KEY || "").trim();

  if (!resendKey) {
    // No email provider configured; accept and redirect to thank you to avoid UX break
    return NextResponse.redirect(new URL("/merci", req.url), { status: 303 });
  }

  const subject = `Nouveau contact — ${firstName} (${metier})`;
  const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height: 1.5;">
    <h2 style="margin:0 0 8px;">Nouveau contact</h2>
    <p style="margin:0 0 6px;"><strong>Prénom:</strong> ${escapeHtml(firstName)}</p>
    <p style="margin:0 0 6px;"><strong>Téléphone:</strong> ${escapeHtml(phone)}</p>
    <p style="margin:0 0 6px;"><strong>Métier:</strong> ${escapeHtml(metier)}</p>
    ${city ? `<p style="margin:0 0 6px;"><strong>Ville:</strong> ${escapeHtml(city)}</p>` : ""}
    <p style="margin:12px 0 0; color:#64748b; font-size:12px;">Consentement RGPD: ${consent ? "oui" : "non"}</p>
  </div>
  `;

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });
  } catch {
    // Swallow errors to avoid blocking the user flow; log server-side in real env
  }

  return NextResponse.redirect(new URL("/merci", req.url), { status: 303 });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}