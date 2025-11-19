import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkSlug from "remark-slug";
import remarkAutolinkHeadings from "remark-autolink-headings";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { createClient } from "@sanity/client";
import { toHTML } from "@portabletext/to-html";

import type { BlogPost, BlogLocale } from "./blog";

function getLocalHour(): number {
  const rawLocal = process.env.BLOG_PUBLISH_LOCAL_HOUR;
  const rawUtc = process.env.BLOG_PUBLISH_HOUR;
  const base = rawLocal ?? rawUtc;
  const h = base ? Number(base) : 9;
  return Number.isFinite(h) && h >= 0 && h <= 23 ? h : 9;
}

function isEuropeParisTz(): boolean {
  const tz = (process.env.BLOG_PUBLISH_TZ || "").trim();
  return tz.toLowerCase() === "europe/paris";
}

function lastSunday(year: number, monthIndex: number): Date {
  const last = new Date(Date.UTC(year, monthIndex + 1, 0, 0, 0, 0));
  const day = last.getUTCDay();
  const diff = day === 0 ? 0 : day;
  last.setUTCDate(last.getUTCDate() - diff);
  return last;
}

function isDstEuropeParis(d: Date): boolean {
  const y = d.getUTCFullYear();
  const start = lastSunday(y, 2);
  const dstStart = new Date(Date.UTC(y, start.getUTCMonth(), start.getUTCDate(), 1, 0, 0));
  const end = lastSunday(y, 9);
  const dstEnd = new Date(Date.UTC(y, end.getUTCMonth(), end.getUTCDate(), 1, 0, 0));
  return d.getTime() >= dstStart.getTime() && d.getTime() < dstEnd.getTime();
}

function computePublishAtISO(dateStr: string): string | undefined {
  // dateStr: YYYY-MM-DD
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mm = Number(m[2]) - 1;
  const dd = Number(m[3]);
  const localHour = getLocalHour();
  if (isEuropeParisTz()) {
    const base = new Date(Date.UTC(y, mm, dd, 0, 0, 0));
    const summer = isDstEuropeParis(base);
    const offset = summer ? 2 : 1;
    let utcHour = localHour - offset;
    let dayShift = 0;
    while (utcHour < 0) {
      utcHour += 24;
      dayShift -= 1;
    }
    while (utcHour >= 24) {
      utcHour -= 24;
      dayShift += 1;
    }
    const d = new Date(Date.UTC(y, mm, dd + dayShift, utcHour, 0, 0));
    return d.toISOString();
  }
  const d = new Date(Date.UTC(y, mm, dd, localHour, 0, 0));
  return d.toISOString();
}

function enhanceContentHtml(html: string): string {
  // Add lazy loading / decoding to images
  const withPerf = html
    .replace(/<img\b([^>]*?)>/gi, (m, attrs) => {
      const hasLoading = /\bloading=/.test(attrs);
      const hasDecoding = /\bdecoding=/.test(attrs);
      const hasReferrer = /\breferrerpolicy=/.test(attrs);
      const hasStyle = /\bstyle=/.test(attrs);
      const hasAlt = /\balt=/.test(attrs);
      const extra =
        (hasLoading ? "" : ' loading="lazy"') +
        (hasDecoding ? "" : ' decoding="async"') +
        (hasReferrer ? "" : ' referrerpolicy="no-referrer"') +
        (hasAlt ? "" : ' alt=""') +
        (hasStyle ? "" : ' style="max-width:100%;height:auto"');
      return `<img${attrs}${extra}>`;
    })
    .replace(/<a\b([^>]*?)>/gi, (m, attrs) => {
      // Enforce rel="noopener noreferrer" when target="_blank"
      const hasTargetBlank = /\btarget\s*=\s*(["'])_blank\1/i.test(attrs) || /\btarget=_blank\b/i.test(attrs);
      if (!hasTargetBlank) return m;
      const relMatch = attrs.match(/\brel\s*=\s*(["'])(.*?)\1/i);
      if (!relMatch) {
        return `<a${attrs} rel="noopener noreferrer">`;
      }
      const relValue = relMatch[2] || "";
      const tokens = new Set(relValue.split(/\s+/).filter(Boolean));
      tokens.add("noopener");
      tokens.add("noreferrer");
      const newRelValue = Array.from(tokens).join(" ");
      return `<a${attrs.replace(relMatch[0], `rel="${newRelValue}"`)}>`;
    });

  // Wrap standalone images in <figure><img/><figcaption/></figure>
  function extractAttr(attrs: string, name: string): string | undefined {
    const m =
      attrs.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
    return m ? (m[2] || m[3] || m[4]) : undefined;
  }
  function wrapImg(attrs: string): string {
    const alt = extractAttr(attrs, "alt") || "";
    const title = extractAttr(attrs, "title") || "";
    const caption = (title || alt).trim();
    const imgTag = `<img${attrs} data-lightbox="1">`;
    const figcaption = caption ? `<figcaption class="mt-2 text-center text-sm text-muted-foreground">${caption}</figcaption>` : "";
    return `<figure class="my-6">${imgTag}${figcaption}</figure>`;
  }

  let out = withPerf;
  // <p><img ...></p>
  out = out.replace(/<p>\s*<img\b([^>]*?)>\s*<\/p>/gi, (_m, attrs) => wrapImg(attrs));
  // <p><a ...><img ...></a></p> -> drop anchor and wrap
  out = out.replace(/<p>\s*<a\b[^>]*>\s*<img\b([^>]*?)>\s*<\/a>\s*<\/p>/gi, (_m, attrs) => wrapImg(attrs));

  return out;
}

/**
 * Load Markdown blog posts from content/blog/*.md with YAML frontmatter.
 */
export function loadPostsFromMarkdown(): BlogPost[] {
  const contentDir = path.join(process.cwd(), "content", "blog");

  if (!fs.existsSync(contentDir)) {
    return [];
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.toLowerCase().endsWith(".md"));
  const posts: BlogPost[] = [];

  for (const file of files) {
    const fullPath = path.join(contentDir, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);

    const slugFromFile = file.replace(/\.md$/i, "");
    const dateMatch = slugFromFile.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    const publishAtFromName = dateMatch ? computePublishAtISO(dateMatch[1]) : undefined;

    const slug: string = (parsed.data.slug as string) || (dateMatch ? dateMatch[2] : slugFromFile);

    const locale = (parsed.data.locale as BlogLocale) || "fr";
    const title = (parsed.data.title as string) || slug;
    const summary = (parsed.data.summary as string) || undefined;
    const authorName = (parsed.data.authorName as string) || undefined;
    const authorUrl = (parsed.data.authorUrl as string) || undefined;
    const publishAt = (parsed.data.publishAt as string) || publishAtFromName || undefined;
    const published = parsed.data.published === true || false;
    const draft = parsed.data.draft === true || false;
    const tags = Array.isArray(parsed.data.tags) ? (parsed.data.tags as string[]) : undefined;

    const altLocalesRaw = parsed.data.altLocales as Partial<Record<BlogLocale, string>> | undefined;
    const altLocales =
      altLocalesRaw && typeof altLocalesRaw === "object" ? (altLocalesRaw as Partial<Record<BlogLocale, string>>) : undefined;

    // Basic sanitize schema: allow common tags/attributes used in blog content
    const sanitizeSchema = {
      tagNames: [
        "h1","h2","h3","h4","h5","h6",
        "p","br","hr","blockquote","strong","em","code","pre","ul","ol","li",
        "a","img","figure","figcaption","table","thead","tbody","tr","th","td",
        "span","div"
      ],
      attributes: {
        a: ["href","title","target","rel","id"],
        img: ["src","alt","title","loading","decoding","referrerpolicy","style"],
        code: ["className"],
        "*": ["id"]
      },
      protocols: {
        href: ["http","https","mailto","tel"],
        src: ["http","https","data"]
      },
      clobberPrefix: "user-",
    };

    const html = remark()
      .use(remarkParse)
      .use(remarkSlug)
      .use(remarkAutolinkHeadings, { behavior: "wrap" })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSanitize, sanitizeSchema as any)
      .use(rehypeStringify)
      .processSync(parsed.content)
      .toString();

    const enhanced = enhanceContentHtml(html);

    posts.push({
      slug,
      locale,
      title,
      summary,
      authorName,
      authorUrl,
      publishAt,
      published,
      draft,
      tags,
      contentHtml: enhanced,
      altLocales,
    });
  }

  return posts;
}

// Sanity source (used when BLOG_SOURCE=sanity)
export async function loadPostsFromSanity(): Promise<BlogPost[]> {
  const projectId = process.env.SANITY_PROJECT_ID || "afuqy886";
  const dataset = process.env.SANITY_DATASET || "production";
  const apiVersion = process.env.SANITY_API_VERSION || "2025-11-14";

  const client = createClient({ projectId, dataset, apiVersion, useCdn: true });

  const groq = `*[_type == "post"] | order(coalesce(publishAt, _updatedAt) desc){
    "slug": slug.current,
    locale,
    title,
    summary,
    publishAt,
    published,
    draft,
    tags,
    altLocales,
    body
  }`;

  const items = await client.fetch<any[]>(groq);

  const posts: BlogPost[] = items.map((it) => {
    // Convert Portable Text body -> HTML
    const html = toHTML(it.body || []);
    const enhanced = enhanceContentHtml(html);
    const publishAtISO: string | undefined = it.publishAt || undefined;

    return {
      slug: it.slug,
      locale: it.locale || "fr",
      title: it.title || it.slug,
      summary: it.summary || undefined,
      contentHtml: enhanced,
      tags: Array.isArray(it.tags) ? it.tags : undefined,
      authorName: undefined,
      authorUrl: undefined,
      publishAt: publishAtISO,
      published: it.published === true || false,
      draft: it.draft === true || false,
      altLocales: it.altLocales && typeof it.altLocales === "object" ? (it.altLocales as any) : undefined,
    };
  });

  return posts;
}

export function getAllPosts(): BlogPost[] {
  const source = (process.env.BLOG_SOURCE || "").trim().toLowerCase();
  if (source === "sanity") {
    // Note: pages that call getAllPosts() are not async. For simplicity and SSR determinism
    // we synchronously fall back to Markdown if SANITY is unavailable.
    // To enable Sanity fully, consider migrating pages to async and awaiting this call.
    // Quick approach: throw to indicate misconfiguration if requested.
    throw new Error("BLOG_SOURCE=sanity requires using the async loadPostsFromSanity() in pages.");
  }
  return loadPostsFromMarkdown();
}

// Helper for async callers
export async function getAllPostsAsync(): Promise<BlogPost[]> {
  const source = (process.env.BLOG_SOURCE || "").trim().toLowerCase();
  if (source === "sanity") {
    return await loadPostsFromSanity();
  }
  return Promise.resolve(loadPostsFromMarkdown());
}