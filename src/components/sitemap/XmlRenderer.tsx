
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      // For debugging
      console.log("XmlRenderer: Rendering XML content", { xmlContent });
      
      // Replace the HTML doctype with XML doctype
      const xmlDoctype = '<?xml version="1.0" encoding="UTF-8"?>';
      
      // Create a completely new document with XML content
      document.open('text/xml');
      document.write(xmlDoctype);
      document.write(xmlContent);
      document.close();
      
      // Set content type header using meta tag for good measure
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
    }
  }, [xmlContent]);

  // Return null as we're handling the rendering directly
  return null;
}
