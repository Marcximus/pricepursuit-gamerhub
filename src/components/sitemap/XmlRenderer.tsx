
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Setting document content type to XML");
      
      // Add a meta tag for content type
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Type';
      meta.content = 'text/xml; charset=utf-8';
      document.head.appendChild(meta);
      
      // Clear the document and write XML content
      document.open('text/xml');
      document.write('<?xml version="1.0" encoding="UTF-8"?>\n');
      document.write(xmlContent);
      document.close();
      
      // Add XML styling to make it readable in browser
      const style = document.createElement('style');
      style.textContent = `
        html {
          white-space: pre;
          font-family: monospace;
          font-size: 14px;
        }
      `;
      document.head.appendChild(style);
      
      console.log("XmlRenderer: XML content rendered successfully");
    }
  }, [xmlContent]);

  // No visible UI is needed
  return null;
}
