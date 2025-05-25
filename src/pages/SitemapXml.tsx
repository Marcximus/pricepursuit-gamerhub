
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";
import { 
  generateSitemapEntries, 
  generateSitemapXml 
} from "@/utils/sitemap";

const BASE_URL = "https://laptophunter.us";

export default function SitemapXml() {
  const { posts } = useBlog();
  const [xmlContent, setXmlContent] = useState<string>("");
  
  useEffect(() => {
    // Only run if this is the XML route
    if (window.location.pathname.endsWith('.xml')) {
      try {
        // Generate the sitemap entries and XML
        const sitemapEntries = generateSitemapEntries(posts || [], BASE_URL);
        const xml = generateSitemapXml(sitemapEntries);
        setXmlContent(xml);
        
        // Set the response headers properly
        const response = new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
          },
        });
        
        console.log("XML sitemap generated successfully", { 
          entriesCount: sitemapEntries.length 
        });
        
      } catch (error) {
        console.error("Error serving XML sitemap:", error);
        const errorXml = '<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>';
        setXmlContent(errorXml);
      }
    }
  }, [posts]);

  // For XML routes, render the raw XML content
  if (window.location.pathname.endsWith('.xml') && xmlContent) {
    return (
      <div 
        style={{ 
          fontFamily: 'monospace', 
          whiteSpace: 'pre-wrap',
          fontSize: '12px',
          margin: 0,
          padding: '10px'
        }}
        dangerouslySetInnerHTML={{ __html: xmlContent.replace(/</g, '&lt;').replace(/>/g, '&gt;') }}
      />
    );
  }

  // Return null for non-XML routes or while loading
  return null;
}
