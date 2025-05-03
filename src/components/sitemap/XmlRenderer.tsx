
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.endsWith('.xml') && xmlContent) {
      // For debugging
      console.log("XmlRenderer: Rendering XML content", { xmlContent });
      
      // Clear existing HTML content
      document.body.innerHTML = '';
      document.head.innerHTML = '';
      
      // Set content type using meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
      
      // Use document.write for raw XML output
      document.open('text/xml');
      document.write(`<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`);
      document.close();
    }
  }, [xmlContent]);

  // Return null as we're handling the rendering directly
  return null;
}
