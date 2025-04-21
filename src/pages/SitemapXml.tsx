
import { useEffect } from "react";
import { useBlog } from "@/contexts/blog";
import { Helmet } from "react-helmet-async";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://laptophunter.com";

function escapeXML(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const staticRoutes = [
  "/",
  "/about",
  "/compare",
  "/recommend",
  "/blog",
  "/admin"
];

export default function SitemapXml() {
  const { posts } = useBlog();

  useEffect(() => {
    // This prevents React from rendering HTML. We respond as plain XML.
    const xml = generateSitemapXml(posts);
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    window.location.replace(url);

    // Clean up blob URL on unmount
    return () => URL.revokeObjectURL(url);
  }, [posts]);

  // Fallback: Also render XML as text for bots/non-js
  return (
    <>
      <Helmet>
        <title>Sitemap laptophunter.com</title>
        <meta name="robots" content="noindex, follow" />
        <meta httpEquiv="Content-Type" content="application/xml; charset=utf-8" />
      </Helmet>
      <pre style={{whiteSpace:"pre-wrap", wordWrap:"break-word"}}>
        {generateSitemapXml(posts)}
      </pre>
    </>
  );
}

function generateSitemapXml(posts: any[]) {
  const urls: string[] = [];

  // Static routes
  for (const path of staticRoutes) {
    urls.push(
      `<url>
        <loc>${BASE_URL}${path}</loc>
        <priority>0.8</priority>
      </url>`
    );
  }

  // Blog categories
  const categories = [
    "Top10", "Review", "Comparison", "How-To"
  ];

  for (const category of categories) {
    urls.push(
      `<url>
        <loc>${BASE_URL}/blog/${category}</loc>
        <priority>0.7</priority>
      </url>`
    );
  }

  // Blog posts (published only)
  (posts ?? []).filter(p => p.published).forEach(post => {
    urls.push(
      `<url>
        <loc>${BASE_URL}/blog/${escapeXML(post.category)}/post/${escapeXML(post.slug)}</loc>
        <lastmod>${(post.updated_at || post.created_at || new Date()).slice(0,10)}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
      </url>`
    );
  });

  // You could add more URLs here (e.g. laptops or desktop/monitor etc routes).

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
