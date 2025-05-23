
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
  
  // Generate sitemap content immediately when posts are available
  useEffect(() => {
    const generateContent = () => {
      try {
        console.log("SitemapXml: Generating sitemap entries", { 
          postsAvailable: Boolean(posts), 
          postsCount: posts?.length || 0,
          route: window.location.pathname
        });
        
        // Generate the sitemap entries
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
    };
    
    // Always try to generate, even if posts array is empty - we'll at least get static routes
    generateContent();
  }, [posts]);
  
  // Debug effect to log when rendered in XML mode
  useEffect(() => {
    if (isXmlRoute) {
      console.log("SitemapXml: XML route detected", { 
        hasContent: Boolean(xmlContent),
        contentLength: xmlContent?.length || 0,
        hasPosts: Boolean(posts),
        postsLength: posts?.length || 0,
        url: window.location.href
      });
    }
  }, [isXmlRoute, xmlContent, posts]);

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
    console.log("SitemapXml: Rendering XML view", {
      hasContent: Boolean(xmlContent),
      contentLength: xmlContent?.length || 0 
    });
    
    // We always have at least static routes, so we should have content
    return <XmlRenderer xmlContent={xmlContent} />;
  }

  // Regular HTML view for /sitemap route
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">XML Sitemap</h1>
          <Button onClick={downloadXml} variant="outline">Download XML</Button>
        </div>
        
        <SitemapTable entries={entries} />
      </div>
    </div>
  );
}
