
// Helper functions for sitemap generation

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export function escapeXML(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const staticRoutes = [
  "/",
  "/about",
  "/compare",
  "/recommend",
  "/blog",
  "/admin"
];

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return date.slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function generateSitemapEntries(posts: any[], baseUrl: string): SitemapEntry[] {
  const sitemapEntries: SitemapEntry[] = [];

  // Static routes
  for (const path of staticRoutes) {
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      priority: path === "/" ? "1.0" : "0.8",
      changefreq: path === "/" || path === "/blog" ? "daily" : "weekly"
    });
  }

  // Blog categories
  const categories = [
    "Top10", "Review", "Comparison", "How-To"
  ];

  for (const category of categories) {
    sitemapEntries.push({
      url: `${baseUrl}/blog/${category}`,
      priority: "0.7",
      changefreq: "weekly"
    });
  }

  // Blog posts (published only)
  (posts ?? []).filter(p => p.published).forEach(post => {
    const lastModDate = post.updated_at || post.created_at || new Date();
    const formattedDate = formatDate(lastModDate);
    
    sitemapEntries.push({
      url: `${baseUrl}/blog/${escapeXML(post.category)}/post/${escapeXML(post.slug)}`,
      lastmod: formattedDate,
      changefreq: "weekly",
      priority: "0.6"
    });
  });

  return sitemapEntries;
}

export function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls: string[] = entries.map(entry => {
    const tags = [
      `<loc>${entry.url}</loc>`,
      entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '',
      entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : '',
      entry.priority ? `<priority>${entry.priority}</priority>` : ''
    ].filter(Boolean).join('\n        ');
    
    return `<url>
        ${tags}
      </url>`;
  });

  return `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
