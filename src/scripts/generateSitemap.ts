
import { writeFileSync } from 'fs';
import { join } from 'path';

// Static sitemap generation script
const BASE_URL = "https://laptophunter.us";

const staticRoutes = [
  "/",
  "/about", 
  "/compare",
  "/recommend",
  "/blog"
];

const blogCategories = [
  "Top10",
  "Review", 
  "Comparison",
  "How-To"
];

// Sample blog posts - in a real implementation, you'd fetch these from your database
const sampleBlogPosts = [
  { slug: "best-dell-laptops", category: "Top10", updated_at: "2024-01-15" },
  { slug: "best-microsoft-laptops", category: "Top10", updated_at: "2024-01-10" },
  { slug: "laptop-buying-guide", category: "How-To", updated_at: "2024-01-05" },
  { slug: "gaming-vs-business-laptops", category: "Comparison", updated_at: "2024-01-01" }
];

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function generateSitemapXML(): string {
  const urls: string[] = [];

  // Add static routes
  staticRoutes.forEach(route => {
    const priority = route === "/" ? "1.0" : "0.8";
    const changefreq = route === "/" || route === "/blog" ? "daily" : "weekly";
    
    urls.push(`  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  });

  // Add blog categories
  blogCategories.forEach(category => {
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${category}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });

  // Add blog posts
  sampleBlogPosts.forEach(post => {
    const lastmod = post.updated_at;
    
    urls.push(`  <url>
    <loc>${BASE_URL}/blog/${escapeXML(post.category)}/post/${escapeXML(post.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// Generate and write the sitemap
const sitemapContent = generateSitemapXML();
const publicPath = join(process.cwd(), 'public', 'sitemap.xml');

try {
  writeFileSync(publicPath, sitemapContent, 'utf8');
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
}
