
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";
import { 
  generateSitemapEntries, 
  generateSitemapXml 
} from "@/utils/sitemap";

const BASE_URL = "https://laptophunter.us";

export default function SitemapXml() {
  const { posts } = useBlog();
  const [xmlContent, setXmlContent] = useState<string>('');
  
  useEffect(() => {
    try {
      // Generate the sitemap entries and XML
      const sitemapEntries = generateSitemapEntries(posts || [], BASE_URL);
      const xml = generateSitemapXml(sitemapEntries);
      setXmlContent(xml);
      
      console.log("XML sitemap generated successfully", { 
        entriesCount: sitemapEntries.length 
      });
    } catch (error) {
      console.error("Error generating XML sitemap:", error);
      setXmlContent('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
    }
  }, [posts]);

  // Render raw XML content
  if (xmlContent) {
    return (
      <pre 
        style={{ 
          margin: 0, 
          padding: 0, 
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          overflow: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: xmlContent }}
      />
    );
  }

  // Show loading while generating
  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      backgroundColor: '#f5f5f5'
    }}>
      <p>Generating XML sitemap...</p>
    </div>
  );
}
