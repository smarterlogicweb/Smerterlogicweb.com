"use client";

import * as React from "react";

export function CopyHeadingLinks({
  rootId = "article-content",
  locale = "fr",
}: {
  rootId?: string;
  locale?: "fr" | "en";
}) {
  const label = locale === "fr" ? "Copier le lien du titre" : "Copy heading link";
  const copiedLabel = locale === "fr" ? "Copié" : "Copied";

  React.useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const headings = root.querySelectorAll<HTMLElement>("h2[id], h3[id]");
    headings.forEach((h) => {
      if (h.dataset.copyAnchorAdded === "1") return;

      h.style.position = h.style.position || "relative";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
      btn.setAttribute("aria-label", label);
      btn.innerHTML = `<span class="sr-only">${label}</span>`;
      const icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      icon.style.display = "inline-flex";
      // We cannot mount a React icon into a vanilla button; use a simple Unicode link symbol fallback.
      icon.textContent = "🔗";
      btn.appendChild(icon);

      const id = h.id;
      const onClick = async () => {
        const url = `${location.origin}${location.pathname}#${id}`;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = url;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
          } finally {
            ta.remove();
          }
        }
        const prev = btn.getAttribute("data-prev-label");
        btn.setAttribute("data-prev-label", prev || "");
        btn.setAttribute("data-copied", "1");
        btn.title = copiedLabel;
        setTimeout(() => {
          btn.removeAttribute("data-copied");
          btn.title = "";
        }, 1500);
      };

      btn.addEventListener("click", onClick);
      h.appendChild(btn);
      h.dataset.copyAnchorAdded = "1";
    });
  }, [rootId, locale]);

  return null;
}