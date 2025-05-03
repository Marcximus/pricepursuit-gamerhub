
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname.endsWith('.xml') && xmlContent) {
      // Clear existing HTML content
      document.body.innerHTML = '';
      document.head.innerHTML = '';
      
      // Set content type using meta tag
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
      
      // Write the XML directly to the document
      document.write('<?xml version="1.0" encoding="UTF-8"?>');
      document.write(xmlContent);
      document.close();
    }
  }, [xmlContent]);

  return null;
}
