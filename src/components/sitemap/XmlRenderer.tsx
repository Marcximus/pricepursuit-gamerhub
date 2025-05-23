
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Rendering XML content", { xmlContent });
      
      // Clear the document and set the content type
      document.open('text/xml');
      document.write('<?xml version="1.0" encoding="UTF-8"?>');
      document.write(xmlContent);
      document.close();
      
      // Directly set the Content-Type header via meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
    }
  }, [xmlContent]);

  // Return null as we're handling the rendering directly
  return null;
}
