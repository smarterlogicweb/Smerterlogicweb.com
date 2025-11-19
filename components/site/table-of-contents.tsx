"use client";

import React from "react";

type TocEntry = {
  id: string;
  text: string;
  level: number; // 2,3,4
};

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractHeadings(contentHtml: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const re = /<(h[2-4])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(contentHtml))) {
    const tag = m[1]; // h2|h3|h4
    const id = m[2];
    const inner = stripTags(m[3]);
    const level = Number(tag.substring(1));
    if (id && inner) {
      entries.push({ id, text: inner, level });
    }
  }
  return entries;
}

function readingTime(contentHtml: string): number {
  const text = stripTags(contentHtml);
  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return minutes;
}

export function TableOfContents({
  contentHtml,
  rootId = "article-content",
  title = "Sommaire",
  locale = "fr",
}: {
  contentHtml: string;
  rootId?: string;
  title?: string;
  locale?: "fr" | "en";
}) {
  const entries = React.useMemo(() => extractHeadings(contentHtml), [contentHtml]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!entries.length) return;

    const root = document.getElementById(rootId) || document;
    const selectors = entries.map((e) => `#${CSS.escape(e.id)}`).join(", ");
    const targets = root.querySelectorAll<HTMLElement>(selectors);

    const obs = new IntersectionObserver(
      (items) => {
        const visible = items
          .filter((it) => it.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top - b.boundingClientRect.top));
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: [0, 1],
      }
    );

    targets.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [entries, rootId]);

  const rtMin = readingTime(contentHtml);
  const pageTitle = locale === "fr" ? "Sommaire" : "Contents";
  const readLabel = locale === "fr" ? "Temps de lecture" : "Reading time";

  if (!entries.length) {
    return null;
  }

  return (
    <nav
      aria-label={pageTitle}
      className="mb-6 rounded-xl border bg-card p-4 text-sm md:sticky md:top-24 md:max-h-[calc(100vh-8rem)] md:overflow-auto"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold">{title || pageTitle}</span>
        <span className="text-muted-foreground">
          {readLabel}: ~{rtMin} min
        </span>
      </div>
      <ul className="space-y-1">
        {entries.map((e) => {
          const pad =
            e.level === 2 ? "" : e.level === 3 ? "pl-4" : "pl-8";
          const isActive = activeId === e.id;
          return (
            <li key={e.id} className={pad}>
              <a
                href={`#${e.id}`}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "block rounded-md px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isActive
                    ? "text-primary bg-accent/50 border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                ].join(" ")}
              >
                {e.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}