
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

// Extended blog posts list with real content from the existing sitemap
const sampleBlogPosts = [
  { slug: "top-10-best-dell-laptops", category: "Top10", updated_at: "2024-01-15" },
  { slug: "top-10-best-microsoft-laptops", category: "Top10", updated_at: "2024-01-10" },
  { slug: "top-10-best-acer-laptops", category: "Top10", updated_at: "2024-01-08" },
  { slug: "top-10-best-alienware-laptops", category: "Top10", updated_at: "2024-01-06" },
  { slug: "top-10-best-hp-laptops", category: "Top10", updated_at: "2024-01-04" },
  { slug: "top-10-best-msi-laptops", category: "Top10", updated_at: "2024-01-02" },
  { slug: "top-10-best-lenovo-laptops", category: "Top10", updated_at: "2024-01-01" },
  { slug: "the-complete-guide-to-laptop-screens", category: "How-To", updated_at: "2024-01-15" },
  { slug: "ultimate-guide-to-laptop-gpu", category: "How-To", updated_at: "2024-01-14" },
  { slug: "the-ultimate-guide-to-laptop-storage", category: "How-To", updated_at: "2024-01-13" },
  { slug: "the-complete-guide-to-the-laptop-cpu", category: "How-To", updated_at: "2024-01-12" },
  { slug: "everything-about-laptop-ram", category: "How-To", updated_at: "2024-01-11" }
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

  // Return XML with declaration at the absolute start - NO leading whitespace or newlines
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
}

// Generate and write the sitemap
const sitemapContent = generateSitemapXML();
const publicPath = join(process.cwd(), 'public', 'sitemap.xml');

try {
  // Write with explicit encoding and no BOM
  writeFileSync(publicPath, sitemapContent, { encoding: 'utf8' });
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  console.log(`📄 Sitemap contains ${sitemapContent.split('<url>').length - 1} URLs`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
}
