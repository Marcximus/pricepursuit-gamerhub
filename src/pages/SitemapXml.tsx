
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";
import { Button } from "@/components/ui/button";
import { SitemapTable } from "@/components/sitemap/SitemapTable";
import { XmlRenderer } from "@/components/sitemap/XmlRenderer";
import { 
  SitemapEntry, 
  generateSitemapEntries, 
  generateSitemapXml 
} from "@/utils/sitemap";

// Update BASE_URL to use the correct domain
const BASE_URL = "https://laptophunter.us";

export default function SitemapXml() {
  const { posts } = useBlog();
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [xmlContent, setXmlContent] = useState("");
  const isXmlRoute = window.location.pathname.endsWith('.xml');
  
  // Generate sitemap content immediately on component mount
  useEffect(() => {
    try {
      console.log("SitemapXml: Initializing sitemap generator", {
        route: window.location.pathname,
        isXmlRoute,
        postsAvailable: Boolean(posts),
        postsCount: posts?.length || 0
      });
      
      // Generate the sitemap entries (will include static routes even if no posts)
      const sitemapEntries = generateSitemapEntries(posts || [], BASE_URL);
      setEntries(sitemapEntries);
      
      // Generate the XML content
      const xml = generateSitemapXml(sitemapEntries);
      setXmlContent(xml);
      
      console.log("SitemapXml: Sitemap generated successfully", { 
        entriesCount: sitemapEntries.length,
        xmlLength: xml.length,
        xmlContentSample: xml.substring(0, 100) + '...'
      });
    } catch (error) {
      console.error("Error generating sitemap:", error);
    }
  }, [posts, isXmlRoute]);

  const downloadXml = () => {
    const xmlBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`], {type: 'text/xml'});
    const url = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If the URL is accessed directly as /sitemap.xml, return XML content
  if (isXmlRoute) {
    console.log("SitemapXml: Rendering in XML mode", {
      hasXmlContent: Boolean(xmlContent),
      contentLength: xmlContent?.length || 0,
      url: window.location.href
    });
    
    return <XmlRenderer xmlContent={xmlContent} />;
  }

  // Regular HTML view for /sitemap route
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">XML Sitemap</h1>
          <div className="space-x-4 flex">
            <Button onClick={downloadXml} variant="outline">Download XML</Button>
            <Button 
              variant="default" 
              onClick={() => window.open(`${BASE_URL}/sitemap.xml`, '_blank')}
            >
              View XML
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          This sitemap contains {entries.length} URLs that are available for crawling by search engines.
        </p>
        
        <SitemapTable entries={entries} />
      </div>
    </div>
  );
}
