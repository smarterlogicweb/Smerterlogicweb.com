import Link from "next/link";
import { notFound } from "next/navigation";
import { getScheduledPostBySlugBurst, formatDate } from "@/lib/blog";
import { getAllPostsAsync } from "@/lib/blog-source";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CitationBox } from "@/components/site/citation-box";
import { TableOfContents } from "@/components/site/table-of-contents";
import { BlogLightboxBinder } from "@/components/site/blog-lightbox-binder";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const all = await getAllPostsAsync();
  const result = getScheduledPostBySlugBurst(all, params.slug, "en");
  if (!result || !result.isPublished) {
    return {
      title: "Article unavailable",
      robots: { index: false, follow: false },
    };
  }
  const { post } = result;

  // Compute proper FR alternate slug and include only if counterpart exists:
  // 1) FR post with same slug
  // 2) FR post declaring altLocales.en === current EN slug
  const frSameSlug = all.find((p) => p.locale === "fr" && p.slug === post.slug);
  const frByMapping = all.find(
    (p) => p.locale === "fr" && typeof (p as any).altLocales === "object" && (p as any).altLocales?.en === post.slug
  );
  const frAlt = frSameSlug || frByMapping;

  const languages: Record<string, string> = { "en-US": `/en/blog/${post.slug}` };
  if (frAlt) {
    languages["fr-FR"] = `/blog/${frAlt.slug}`;
  }

  return {
    title: post.title,
    description: post.summary ?? post.title,
    alternates: {
      canonical: `/en/blog/${post.slug}`,
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

export default async function BlogPostEN({ params }: { params: { slug: string } }) {
  const all = await getAllPostsAsync();
  const result = getScheduledPostBySlugBurst(all, params.slug, "en");
  if (!result) notFound();

  const { post, isPublished } = result;
  if (!isPublished) {
    notFound();
  }

  const authorName = post.authorName || "Sonia";
  const authorUrl = post.authorUrl || undefined;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smarterlogicweb.com/en" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://smarterlogicweb.com/en/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://smarterlogicweb.com/en/blog/${post.slug}` },
    ],
  };

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary ?? post.title,
    datePublished: post.publishAt.toISOString(),
    dateModified: post.publishAt.toISOString(),
    mainEntityOfPage: `https://smarterlogicweb.com/en/blog/${post.slug}`,
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

  return (
    <section className="relative">
      {/* Ambient brand gradient background, subtle and non-intrusive */}
      <div aria-hidden className="hero-gradient-animated absolute inset-0 -z-10" />

      <article className="mx-auto w-full max-w-3xl px-6 py-10">
        {/* JSON-LD BreadcrumbList */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        {/* JSON-LD BlogPosting */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />

        <header className="mb-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            By {authorUrl ? <Link href={authorUrl} className="hover:underline">{authorName}</Link> : authorName}
          </p>
          <time className="mt-0.5 block text-sm text-muted-foreground" dateTime={post.publishAt.toISOString()}>
            Published on {formatDate(post.publishAt, "en")}
          </time>

          {/* Visible breadcrumbs */}
          <Breadcrumbs
            className="mt-2"
            items={[
              { label: "Home", href: "/en" },
              { label: "Blog", href: "/en/blog" },
              { label: post.title },
            ]}
          />
        </header>

        <TableOfContents contentHtml={post.contentHtml} rootId="article-content" locale="en" />
        <BlogLightboxBinder rootId="article-content" ariaLabel="Article images lightbox" />

        <div
          id="article-content"
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary prose-a:underline-offset-2 prose-img:rounded-lg prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <CitationBox articleSlug={post.slug} locale="en" />

        <footer className="mt-8">
          <Link href="/en/blog" className="text-primary hover:underline">
            ← Back to articles
          </Link>
        </footer>
      </article>
    </section>
  );
}