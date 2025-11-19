"use client";

import Link, { LinkProps } from "next/link";
import React from "react";
import { track } from "@/lib/analytics";

type TrackedLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
  eventName?: string; // optional GA4 event via track()
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

function pushDataLayerEvent(kind: "cta_click" | "mailto_click" | "tel_click" | "file_download" | "outbound_click", data: Record<string, unknown>) {
  try {
    const dl = (window as any).dataLayer;
    if (Array.isArray(dl)) {
      dl.push({ event: kind, ...data });
    }
  } catch {
    // ignore
  }
}

function getHost(href: string): string {
  try {
    const u = new URL(href, window.location.origin);
    return u.host || "";
  } catch {
    return "";
  }
}

export function TrackedLink({
  children,
  className,
  eventName,
  onClick, // ignored; we manage tracking internally
  ...rest
}: TrackedLinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const el = e.currentTarget;
      const href = el.getAttribute("href") || "";
      const text = (el.textContent || "").trim();
      const label = el.getAttribute("aria-label") || text || href;

      // Always send GA4/custom via our track() when provided
      if (eventName) {
        try {
          track(eventName);
        } catch {
          // no-op
        }
      }

      // GTM-compatible custom events (push to dataLayer) based on href pattern
      const lower = href.toLowerCase();
      if (lower.startsWith("mailto:")) {
        pushDataLayerEvent("mailto_click", { link_url: href, link_text: text, label });
        return;
      }
      if (lower.startsWith("tel:")) {
        pushDataLayerEvent("tel_click", { link_url: href, link_text: text, label });
        return;
      }
      if (/\.(pdf)(\?|#|$)/i.test(lower)) {
        const file_ext = "pdf";
        pushDataLayerEvent("file_download", { link_url: href, link_text: text, label, file_ext });
        return;
      }
      // outbound if different hostname and http(s)
      if (/^https?:\/\//i.test(href)) {
        const dest = getHost(href);
        if (dest && dest !== window.location.host) {
          pushDataLayerEvent("outbound_click", { link_url: href, link_text: text, label });
          return;
        }
      }
      // Otherwise consider it a CTA click
      pushDataLayerEvent("cta_click", { link_url: href, link_text: text, label });
    },
    [eventName]
  );

  return (
    <Link {...rest} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}