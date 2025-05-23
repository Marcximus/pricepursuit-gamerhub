
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Setting document content type to XML");
      
      // Create a pre-formatted text display for the XML
      const displayElement = document.createElement('pre');
      displayElement.textContent = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;
      displayElement.style.margin = '0';
      displayElement.style.padding = '20px';
      displayElement.style.background = 'white';
      displayElement.style.fontFamily = 'monospace';
      displayElement.style.whiteSpace = 'pre-wrap';
      displayElement.style.overflow = 'auto';
      
      // Clear the existing body content
      document.body.innerHTML = '';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.background = '#f0f0f0';
      
      // Set proper XML content type with meta tag
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Type');
      meta.setAttribute('content', 'text/xml; charset=utf-8');
      document.head.appendChild(meta);
      
      // Add content to body
      document.body.appendChild(displayElement);
      
      // Also provide the content as a downloadable link
      const downloadContainer = document.createElement('div');
      downloadContainer.style.padding = '10px 20px';
      downloadContainer.style.background = '#f0f0f0';
      downloadContainer.style.borderTop = '1px solid #ddd';
      
      const downloadLink = document.createElement('a');
      const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`], {type: 'text/xml'});
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'sitemap.xml';
      downloadLink.textContent = 'Download sitemap.xml';
      downloadLink.style.color = '#0066cc';
      downloadLink.style.textDecoration = 'none';
      downloadLink.style.fontFamily = 'system-ui, sans-serif';
      downloadLink.style.fontWeight = 'bold';
      
      downloadContainer.appendChild(downloadLink);
      document.body.appendChild(downloadContainer);
      
      // Try to set content disposition header through meta tag (this is a best effort)
      const contentDisposition = document.createElement('meta');
      contentDisposition.setAttribute('http-equiv', 'Content-Disposition');
      contentDisposition.setAttribute('content', 'inline; filename=sitemap.xml');
      document.head.appendChild(contentDisposition);
      
      console.log("XmlRenderer: XML content rendered successfully");
    }
  }, [xmlContent]);

  // For XML routes, we'll completely replace the document content
  return null;
}
