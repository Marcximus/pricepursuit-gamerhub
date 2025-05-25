
import { useEffect } from "react";
import { useBlog } from "@/contexts/blog";
import { 
  generateSitemapEntries, 
  generateSitemapXml 
} from "@/utils/sitemap";

const BASE_URL = "https://laptophunter.us";

export default function SitemapXml() {
  const { posts } = useBlog();
  
  useEffect(() => {
    // Only run if this is the XML route
    if (window.location.pathname.endsWith('.xml')) {
      try {
        // Generate the sitemap entries and XML
        const sitemapEntries = generateSitemapEntries(posts || [], BASE_URL);
        const xmlContent = generateSitemapXml(sitemapEntries);
        
        // Set document content type to XML
        document.contentType = 'text/xml';
        
        // Replace the entire document with XML content
        document.open();
        document.write(xmlContent);
        document.close();
        
      } catch (error) {
        console.error("Error serving XML sitemap:", error);
        document.open();
        document.write('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
        document.close();
      }
    }
  }, [posts]);

  // Return null since we're replacing the document content
  return null;
}
