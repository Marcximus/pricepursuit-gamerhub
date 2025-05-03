
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      // For debugging
      console.log("XmlRenderer: Rendering XML content", { xmlContent });
      
      // Clear the document completely before writing XML
      document.documentElement.innerHTML = '';
      
      // Create a new XML document with proper content type
      document.write('<?xml version="1.0" encoding="UTF-8"?>');
      document.write(xmlContent);
      
      // Set content type header using meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
    }
  }, [xmlContent]);

  // Return null as we're handling the rendering directly
  return null;
}
