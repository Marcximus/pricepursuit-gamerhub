
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Setting document content type to XML");
      
      // Create a new document with the proper content type
      document.open('text/xml');
      
      // Write the XML declaration and content
      document.write('<?xml version="1.0" encoding="UTF-8"?>\n');
      document.write(xmlContent);
      document.close();
      
      // Set the content type explicitly
      document.contentType = 'text/xml';
      
      // Also add a meta tag for browsers that support it
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
      
      console.log("XmlRenderer: XML content rendered successfully");
    }
  }, [xmlContent]);

  // No visible UI is needed
  return null;
}
