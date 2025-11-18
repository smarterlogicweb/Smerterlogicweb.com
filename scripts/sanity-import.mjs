/**
 * Import Markdown posts from content/blog/*.md into Sanity as "post" documents.
 * Preserves metadata (slug, locale, title, summary, publishAt, published, draft, tags, altLocales).
 * Body is imported as a single code block (markdown) for manual polishing in Studio.
 *
 * Usage:
 *   node scripts/sanity-import.mjs
 *
 * Requires env:
 *   SANITY_PROJECT_ID, SANITY_DATASET (production), SANITY_API_VERSION (e.g., 2025-11-14)
 *   SANITY_TOKEN (Editor token) — create a token in Sanity with write permissions.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { createClient } from "@sanity/client";

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(`[import] ${msg}`);
}

const projectId = process.env.SANITY_PROJECT_ID || "afuqy886";
const dataset = process.env.SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2025-11-14";
const token = process.env.SANITY_TOKEN || "";

if (!token) {
  throw new Error("SANITY_TOKEN is required for import.");
}

const client = createClient({ projectId, dataset, apiVersion, token });

function toSanityId(slug, locale) {
  return `post.${locale}.${slug}`;
}

function loadMarkdownFiles() {
  const contentDir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(contentDir)) return [];
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.toLowerCase().endsWith(".md"))
    .map((f) => path.join(contentDir, f));
}

async function upsertPost(doc) {
  const id = toSanityId(doc.slug, doc.locale || "fr");
  const payload = {
    _id: id,
    _type: "post",
    title: doc.title,
    slug: { current: doc.slug },
    locale: doc.locale || "fr",
    summary: doc.summary || undefined,
    publishAt: doc.publishAt || undefined,
    published: doc.published === true || false,
    draft: doc.draft === true || false,
    tags: Array.isArray(doc.tags) ? doc.tags : undefined,
    altLocales: doc.altLocales || undefined,
    body: [
      {
        _type: "code",
        language: "markdown",
        code: doc.content,
      },
    ],
  };
  await client.createOrReplace(payload);
}

async function main() {
  const files = loadMarkdownFiles();
  log(`Found ${files.length} markdown files`);
  let imported = 0;

  for (const fullPath of files) {
    const raw = fs.readFileSync(fullPath, "utf8");
    const parsed = matter(raw);

    const file = path.basename(fullPath);
    const slugFromFile = file.replace(/\.md$/i, "");
    const dateMatch = slugFromFile.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);

    const slug = (parsed.data.slug || (dateMatch ? dateMatch[2] : slugFromFile)).trim();
    const locale = (parsed.data.locale || "fr").trim();
    const title = parsed.data.title || slug;
    const summary = parsed.data.summary || undefined;
    const publishAt = parsed.data.publishAt || undefined;
    const published = parsed.data.published === true || false;
    const draft = parsed.data.draft === true || false;
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags : undefined;
    const altLocales = parsed.data.altLocales && typeof parsed.data.altLocales === "object" ? parsed.data.altLocales : undefined;

    const doc = {
      slug,
      locale,
      title,
      summary,
      publishAt,
      published,
      draft,
      tags,
      altLocales,
      content: parsed.content,
    };

    await upsertPost(doc);
    imported += 1;
    log(`Imported ${locale}/${slug}`);
  }

  log(`Done. Imported ${imported} posts into Sanity.`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});