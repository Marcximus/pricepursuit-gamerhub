
import { useEffect, useState } from "react";
import { useBlog } from "@/contexts/blog";
import { Button } from "@/components/ui/button";
import { SitemapTable } from "@/components/sitemap/SitemapTable";
import { 
  SitemapEntry, 
  generateSitemapEntries, 
  generateSitemapXml 
} from "@/utils/sitemap";
import { Helmet } from "react-helmet-async";
import Navigation from "@/components/Navigation";

// Use the same BASE_URL as in SitemapXml.tsx
const BASE_URL = "https://laptophunter.us";

export default function SitemapPage() {
  const { posts } = useBlog();
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [xmlContent, setXmlContent] = useState("");
  
  useEffect(() => {
    // Generate the sitemap entries
    const sitemapEntries = generateSitemapEntries(posts, BASE_URL);
    setEntries(sitemapEntries);
    
    // Generate the XML content
    const xml = generateSitemapXml(sitemapEntries);
    setXmlContent(xml);
  }, [posts]);

  const downloadXml = () => {
    // Don't add extra XML declaration - the content already has it
    const xmlBlob = new Blob([xmlContent], {type: 'text/xml'});
    const url = URL.createObjectURL(xmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Sitemap | Laptop Hunter</title>
        <meta name="description" content="View all pages on Laptop Hunter that are accessible to search engines." />
      </Helmet>
      
      <Navigation />
      
      <div className="container mx-auto py-8 mt-16">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">XML Sitemap</h1>
            <div className="flex space-x-4">
              <Button onClick={downloadXml} variant="outline">Download XML</Button>
              <Button variant="default" onClick={() => window.open(`${BASE_URL}/sitemap.xml`, '_blank')}>
                View Raw XML
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            This sitemap contains {entries.length} URLs that are available for crawling by search engines.
          </p>
          
          <SitemapTable entries={entries} />
        </div>
      </div>
    </>
  );
}
