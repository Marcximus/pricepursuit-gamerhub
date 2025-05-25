
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
        const xml = generateSitemapXml(sitemapEntries);
        
        // Completely replace the document with raw XML
        document.open();
        document.write(xml);
        document.close();
        
        console.log("XML sitemap served successfully", { 
          entriesCount: sitemapEntries.length 
        });
        
      } catch (error) {
        console.error("Error serving XML sitemap:", error);
        document.open();
        document.write('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
        document.close();
      }
    }
  }, [posts]);

  // Return null since we're completely replacing the document content
  return null;
}
