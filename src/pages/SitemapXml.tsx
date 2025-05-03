
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://laptophunter.com";

function escapeXML(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
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
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [showXml, setShowXml] = useState(false);
  const [xmlContent, setXmlContent] = useState("");
  
  useEffect(() => {
    // Generate the sitemap entries
    const sitemapEntries: SitemapEntry[] = [];

    // Static routes
    for (const path of staticRoutes) {
      sitemapEntries.push({
        url: `${BASE_URL}${path}`,
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
        url: `${BASE_URL}/blog/${category}`,
        priority: "0.7",
        changefreq: "weekly"
      });
    }

    // Blog posts (published only)
    (posts ?? []).filter(p => p.published).forEach(post => {
      const lastModDate = post.updated_at || post.created_at || new Date();
      // Convert Date object to ISO string format and extract the date part
      const formattedDate = typeof lastModDate === 'string' 
        ? lastModDate.slice(0, 10) 
        : lastModDate.toISOString().slice(0, 10);
      
      sitemapEntries.push({
        url: `${BASE_URL}/blog/${escapeXML(post.category)}/post/${escapeXML(post.slug)}`,
        lastmod: formattedDate,
        changefreq: "weekly",
        priority: "0.6"
      });
    });

    setEntries(sitemapEntries);
    setXmlContent(generateSitemapXml(posts));
  }, [posts]);

  const downloadXml = () => {
    const xmlBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>${xmlContent}`], {type: 'text/xml'});
    const url = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If the URL is accessed directly as /sitemap.xml, return raw XML
  useEffect(() => {
    const path = window.location.pathname;
    if (path.endsWith('.xml') && xmlContent) {
      document.body.innerHTML = '';
      document.head.innerHTML = '';
      
      // Set content type using meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
      
      // Write the XML directly to the document
      document.open('text/xml');
      const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';
      document.write(xmlDeclaration + xmlContent);
      document.close();
    }
  }, [xmlContent]);

  if (window.location.pathname.endsWith('.xml')) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-center w-full">XML Sitemap</h1>
          <Button onClick={downloadXml} variant="outline">Download XML</Button>
        </div>
        
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">URL</th>
                  <th className="text-left p-4">Last Modified</th>
                  <th className="text-left p-4">Change Frequency</th>
                  <th className="text-left p-4">Priority</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 border-t">
                      <a href={entry.url} className="text-blue-600 hover:underline truncate block max-w-md">
                        {entry.url}
                      </a>
                    </td>
                    <td className="p-4 border-t">{entry.lastmod || "-"}</td>
                    <td className="p-4 border-t">{entry.changefreq || "-"}</td>
                    <td className="p-4 border-t">{entry.priority || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
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
    const lastModDate = post.updated_at || post.created_at || new Date();
    // Convert Date object to ISO string format and extract the date part
    const formattedDate = typeof lastModDate === 'string'
      ? lastModDate.slice(0, 10)
      : lastModDate.toISOString().slice(0, 10);

    urls.push(
      `<url>
        <loc>${BASE_URL}/blog/${escapeXML(post.category)}/post/${escapeXML(post.slug)}</loc>
        <lastmod>${formattedDate}</lastmod>
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
