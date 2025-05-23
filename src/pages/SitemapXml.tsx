
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";
import { XmlRenderer } from "@/components/sitemap/XmlRenderer";
import { 
  SitemapEntry, 
  generateSitemapEntries, 
  generateSitemapXml 
} from "@/utils/sitemap";
import { Helmet } from "react-helmet-async";

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

  // If this is an XML route request, use XmlRenderer
  if (isXmlRoute) {
    return (
      <>
        <Helmet>
          <title>Sitemap XML</title>
          <meta http-equiv="Content-Type" content="text/xml; charset=utf-8" />
        </Helmet>
        <XmlRenderer xmlContent={xmlContent} />
      </>
    );
  }

  // Regular HTML view for non-xml routes
  return null; // This shouldn't actually be reached since the /sitemap.xml route is handled above
}
