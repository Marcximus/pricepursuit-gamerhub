
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Setting document content type to XML");

      // Replace the entire HTML document with XML content
      document.documentElement.innerHTML = '';
      
      // Set XML MIME type with a meta tag
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'text/xml; charset=utf-8');
      document.head.appendChild(meta);

      // Create a pre element to display the XML content with proper formatting
      const pre = document.createElement('pre');
      pre.textContent = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;
      document.body.appendChild(pre);

      // Add styling to make it readable
      const style = document.createElement('style');
      style.textContent = `
        body { 
          margin: 0;
          padding: 20px;
          background: #f0f0f0;
          font-family: monospace;
        }
        pre {
          background: white;
          padding: 20px;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: auto;
          white-space: pre-wrap;
        }
      `;
      document.head.appendChild(style);
      
      console.log("XmlRenderer: XML content rendered successfully");
    }
  }, [xmlContent]);

  // For XML routes, we'll completely replace the document content
  return null;
}
