
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

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "https://laptophunter.com";

export default function SitemapXml() {
  const { posts } = useBlog();
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [xmlContent, setXmlContent] = useState("");
  const isXmlRoute = typeof window !== "undefined" && window.location.pathname.endsWith('.xml');
  
  useEffect(() => {
    // Generate the sitemap entries
    const sitemapEntries = generateSitemapEntries(posts, BASE_URL);
    setEntries(sitemapEntries);
    
    // Generate the XML content
    const xml = generateSitemapXml(sitemapEntries);
    setXmlContent(xml);
    
    // If we're on the XML route, set the document title
    if (isXmlRoute) {
      document.title = "XML Sitemap";
    }
  }, [posts, isXmlRoute]);

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
  if (isXmlRoute) {
    return <XmlRenderer xmlContent={xmlContent} />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-center w-full">XML Sitemap</h1>
          <Button onClick={downloadXml} variant="outline">Download XML</Button>
        </div>
        
        <SitemapTable entries={entries} />
      </div>
    </div>
  );
}
