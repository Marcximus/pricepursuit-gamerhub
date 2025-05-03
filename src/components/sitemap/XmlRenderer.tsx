
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.endsWith('.xml') && xmlContent) {
      // For debugging
      console.log("XmlRenderer: Rendering XML content", { xmlContent });
      
      // Prevent normal React rendering and output raw XML
      document.open('text/xml');
      document.write(`<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`);
      document.close();
      
      // Set content type using meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
    }
  }, [xmlContent]);

  // Return null as we're handling the rendering directly
  return null;
}
