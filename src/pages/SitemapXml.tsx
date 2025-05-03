
import { useEffect } from "react";
import { useBlog } from "@/contexts/blog";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();

  useEffect(() => {
    // Set the correct content type for XML
    const xmlString = generateSitemapXml(posts);
    
    // Create a download link for the XML
    const blob = new Blob([xmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sitemap.xml');
    link.click();
    
    // Clean up blob URL
    setTimeout(() => URL.revokeObjectURL(url), 100);

    // For users that don't download the file, display a message after a short delay
    setTimeout(() => {
      document.getElementById('sitemap-message')?.classList.remove('hidden');
    }, 1000);
  }, [posts]);

  return (
    <>
      <Helmet>
        <title>Sitemap - LaptopHunter.com</title>
        <meta name="robots" content="noindex, follow" />
        <meta httpEquiv="Content-Type" content="application/xml; charset=utf-8" />
      </Helmet>
      
      <div className="min-h-screen bg-slate-50 pt-16 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Sitemap Generator</h1>
        
        <div id="sitemap-message" className="hidden">
          <p className="mb-4 text-center">Your sitemap.xml file should be downloading automatically.</p>
          
          <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-3">How to use this sitemap:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Save the downloaded sitemap.xml file</li>
              <li>Upload it to your web server's root directory</li>
              <li>Submit the sitemap URL to search engines through their webmaster tools</li>
            </ol>
            
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For proper sitemap functionality in production, we recommend implementing server-side rendering or generating a static sitemap file during your build process.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <pre style={{position: 'absolute', left: '-9999px'}}>
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
