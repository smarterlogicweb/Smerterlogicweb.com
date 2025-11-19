import Link from "next/link";
import { notFound } from "next/navigation";
import { getScheduledPostBySlugBurst, formatDate, getPublishedPostsBurst } from "@/lib/blog";
import { getAllPostsAsync } from "@/lib/blog-source";
import { RecommendedArticles } from "@/components/site/recommended-articles";
import { RelatedCities } from "@/components/site/related-cities";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CitationBox } from "@/components/site/citation-box";
import { TableOfContents } from "@/components/site/table-of-contents";
import { BlogLightboxBinder } from "@/components/site/blog-lightbox-binder";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const all = await getAllPostsAsync();
  const result = getScheduledPostBySlugBurst(all, params.slug, "fr");
  if (!result || !result.isPublished) {
    return {
      title: "Article non disponible",
      robots: { index: false, follow: false },
    };
  }
  const { post } = result;

  // Compute proper EN alternate slug and include only if counterpart exists:
  // 1) prefer explicit mapping from frontmatter (altLocales.en) if an EN post with that slug exists
  // 2) else, use same slug if an EN post exists with the same slug
  const explicitEn = post.altLocales?.en;
  const enByMapping = explicitEn ? all.find((p) => p.locale === "en" && p.slug === explicitEn) : undefined;
  const enSameSlug = all.find((p) => p.locale === "en" && p.slug === post.slug);
  const enAlt = enByMapping || enSameSlug;

  const languages: Record<string, string> = { "fr-FR": `/blog/${post.slug}` };
  if (enAlt) {
    languages["en-US"] = `/en/blog/${enAlt.slug}`;
  }

  return {
    title: post.title,
    description: post.summary ?? post.title,
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary ?? post.title,
      publishedTime: post.publishAt.toISOString(),
    },
  };
}

export default async function BlogPostFR({ params }: { params: { slug: string } }) {
  const all = await getAllPostsAsync();
  const result = getScheduledPostBySlugBurst(all, params.slug, "fr");
  if (!result) notFound();

  const { post, isPublished } = result;
  if (!isPublished) {
    // Hide unreleased posts from public/SEO
    notFound();
  }

  const authorName = post.authorName || "Sonia";
  const authorUrl = post.authorUrl || undefined;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://smarterlogicweb.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://smarterlogicweb.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://smarterlogicweb.com/blog/${post.slug}` },
    ],
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary ?? post.title,
    datePublished: post.publishAt.toISOString(),
    dateModified: post.publishAt.toISOString(),
    mainEntityOfPage: `https://smarterlogicweb.com/blog/${post.slug}`,
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "smarterlogicweb",
      url: "https://smarterlogicweb.com",
    },
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

  // Option A: normalize — replace any <h1> in content with <h2> to guarantee a single H1 (the template title)
  const normalizedContentHtml = post.contentHtml.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, "<h2$1>$2</h2>");
  // Prev/Next navigation among published FR posts
  const publishedFr = getPublishedPostsBurst(all, "fr");
  const idx = publishedFr.findIndex((p) => p.slug === post.slug);
  const prev = idx > 0 ? publishedFr[idx - 1] : null;
  const next = idx >= 0 && idx < publishedFr.length - 1 ? publishedFr[idx + 1] : null;

  return (
    <section className="relative">
      {/* Ambient brand gradient background, subtle and non-intrusive */}
      <div aria-hidden className="hero-gradient-animated absolute inset-0 -z-10" />

      <article className="mx-auto w-full max-w-5xl px-6 py-10">
        {/* JSON-LD BreadcrumbList */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {/* JSON-LD BlogPosting */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />

        <header className="mb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Par {authorUrl ? <Link href={authorUrl} className="hover:underline">{authorName}</Link> : authorName}
          </p>
          <time className="mt-0.5 block text-sm text-muted-foreground" dateTime={post.publishAt.toISOString()}>
            Publié le {formatDate(post.publishAt, "fr")}
          </time>

          {/* Visible breadcrumbs */}
          <Breadcrumbs
            className="mt-2"
            items={[
              { label: "Accueil", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.title },
            ]}
          />
        </header>

        <div className="grid gap-6 md:grid-cols-12">
          <aside className="order-last md:order-none md:col-span-4 lg:col-span-3">
            <TableOfContents contentHtml={normalizedContentHtml} rootId="article-content" locale="fr" />
          </aside>

          <div className="md:col-span-8 lg:col-span-9">
            <BlogLightboxBinder rootId="article-content" ariaLabel="Lightbox images d'article" />

            <div
              id="article-content"
              className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary prose-a:underline-offset-2 prose-img:rounded-lg prose-img:shadow-sm"
              dangerouslySetInnerHTML={{ __html: normalizedContentHtml }}
            />

            <RelatedCities contentHtml={normalizedContentHtml} locale="fr" />

            <RecommendedArticles currentSlug={post.slug} locale="fr" />

            <CitationBox articleSlug={post.slug} locale="fr" />

            <nav aria-label="Navigation de l’article" className="mt-8 flex items-center justify-between border-t pt-4">
              <div>
                {prev ? (
                  <Link href={`/blog/${prev.slug}`} className="text-muted-foreground hover:text-foreground hover:underline">← {prev.title}</Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div>
                {next ? (
                  <Link href={`/blog/${next.slug}`} className="text-muted-foreground hover:text-foreground hover:underline">{next.title} →</Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
            </nav>
            <footer className="mt-4">
              <Link href="/blog" className="text-primary hover:underline">
                ← Retour aux articles
              </Link>
            </footer>
          </div>
        </div>
      </article>
    </section>
  );
}