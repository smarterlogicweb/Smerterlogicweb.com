"use client";

import * as React from "react";

type Props = {
  portalId: string;
  formId: string;
  region?: string; // e.g., "na1"
  className?: string;
};

/**
 * Lightweight HubSpot form embed component.
 * Requires env vars:
 * - NEXT_PUBLIC_HUBSPOT_PORTAL_ID
 * - NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID
 * Optional:
 * - NEXT_PUBLIC_HUBSPOT_REGION (defaults to "na1")
 *
 * CSP must allow:
 * - script-src: https://js.hsforms.net https://js.hs-scripts.com https://js.hs-analytics.net
 * - frame-src: https://forms.hubspot.com
 * - connect/img as needed for tracking
 */
export function HubSpotForm({ portalId, formId, region = "na1", className }: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const scriptSrc = "https://js.hsforms.net/forms/embed/v2.js";

    function loadScript(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (typeof window !== "undefined" && (window as any).hbspt?.forms?.create) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = scriptSrc;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load HubSpot forms script"));
        document.head.appendChild(s);
      });
    }

    async function createForm() {
      try {
        await loadScript();
        const h = (window as any).hbspt;
        if (!h?.forms?.create || !containerRef.current) return;

        h.forms.create({
          portalId,
          formId,
          region,
          target: `#${containerRef.current.id}`,
        });
      } catch {
        // ignore
      }
    }

    createForm();
  }, [portalId, formId, region]);

  const id = React.useMemo(() => `hsform_${formId}`, [formId]);

  return <div id={id} ref={containerRef} className={className} />;
}