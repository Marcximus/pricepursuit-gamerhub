
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";

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
  const [xmlContent, setXmlContent] = useState("");
  
  useEffect(() => {
    // Generate the sitemap XML content
    setXmlContent(generateSitemapXml(posts));
  }, [posts]);

  useEffect(() => {
    if (xmlContent && typeof document !== 'undefined') {
      // Remove any existing content
      document.body.innerHTML = '';
      document.head.innerHTML = '';
      
      // Set content type for proper XML rendering
      document.contentType = 'text/xml';
      
      // Write the XML directly to the document
      const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
      document.write(xmlDeclaration + xmlContent);
    }
  }, [xmlContent]);

  return null;
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

  return `
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}
