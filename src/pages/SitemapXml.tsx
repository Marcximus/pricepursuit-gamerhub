
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
  
  useEffect(() => {
    // Wait for posts to load
    if (!posts) return;
    
    console.log("SitemapXml: Posts loaded", { postsCount: posts.length });
    
    try {
      // Generate the sitemap entries
      const sitemapEntries = generateSitemapEntries(posts, BASE_URL);
      setEntries(sitemapEntries);
      
      // Generate the XML content
      const xml = generateSitemapXml(sitemapEntries);
      setXmlContent(xml);
      
      if (isXmlRoute) {
        console.log("XML route detected, sitemap data prepared", { 
          entriesCount: sitemapEntries.length,
          xmlLength: xml.length,
          xmlContentSample: xml.substring(0, 100) + '...'
        });
      }
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

  // If the URL is accessed directly as /sitemap.xml, return raw XML
  if (isXmlRoute) {
    console.log("XML route detected, rendering XML with XmlRenderer");
    // Make sure we have content before rendering
    if (!xmlContent && posts && posts.length > 0) {
      // Force generate content if not already done
      const sitemapEntries = generateSitemapEntries(posts, BASE_URL);
      const xml = generateSitemapXml(sitemapEntries);
      setXmlContent(xml);
    }
    return <XmlRenderer xmlContent={xmlContent} />;
  }

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
