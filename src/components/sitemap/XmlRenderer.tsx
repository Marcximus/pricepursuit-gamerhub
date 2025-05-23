
import { useEffect, useState } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  const [xmlUrl, setXmlUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Creating XML blob URL");
      
      // Create a blob with the XML content
      const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`], {type: 'text/xml'});
      const url = URL.createObjectURL(blob);
      setXmlUrl(url);
      
      // Clean up when component unmounts
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [xmlContent]);

  // If we're on the XML route and have content, render a specialized XML view
  if (window.location.pathname.endsWith('.xml') && xmlUrl) {
    return (
      <div style={{ 
        position: "fixed", 
        top: 0, 
        left: 0, 
        width: "100%", 
        height: "100%", 
        margin: 0,
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <iframe 
          src={xmlUrl}
          style={{
            flex: 1,
            border: "none",
            width: "100%",
            height: "100%"
          }}
          title="Sitemap XML"
        />
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#f0f0f0",
          padding: "10px",
          borderRadius: "4px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}>
          <a
            href={xmlUrl}
            download="sitemap.xml"
            style={{
              color: "#0066cc",
              textDecoration: "none",
              fontFamily: "system-ui, sans-serif",
              fontWeight: "bold"
            }}
          >
            Download sitemap.xml
          </a>
        </div>
      </div>
    );
  }

  // For non-XML routes or when no content is available yet
  return null;
}
