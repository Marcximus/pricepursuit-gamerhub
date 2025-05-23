
import { useEffect } from "react";

interface XmlRendererProps {
  xmlContent: string;
}

export function XmlRenderer({ xmlContent }: XmlRendererProps) {
  useEffect(() => {
    if (window.location.pathname.endsWith('.xml') && xmlContent) {
      console.log("XmlRenderer: Setting document content type to XML");
      
      // Create a blob and download it automatically
      // This is a workaround since we can't directly set content type in client-side React
      const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`], {type: 'text/xml'});
      const url = URL.createObjectURL(blob);
      
      // Create an iframe to display the XML content
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.src = url;
      
      // Clear the body and append the iframe
      document.body.innerHTML = '';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.appendChild(iframe);
      
      // Add a download button
      const downloadContainer = document.createElement('div');
      downloadContainer.style.position = 'fixed';
      downloadContainer.style.bottom = '20px';
      downloadContainer.style.right = '20px';
      downloadContainer.style.background = '#f0f0f0';
      downloadContainer.style.padding = '10px';
      downloadContainer.style.borderRadius = '4px';
      downloadContainer.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'sitemap.xml';
      downloadLink.textContent = 'Download sitemap.xml';
      downloadLink.style.color = '#0066cc';
      downloadLink.style.textDecoration = 'none';
      downloadLink.style.fontFamily = 'system-ui, sans-serif';
      downloadLink.style.fontWeight = 'bold';
      
      downloadContainer.appendChild(downloadLink);
      document.body.appendChild(downloadContainer);
      
      console.log("XmlRenderer: XML content rendered successfully");
      
      // Clean up when component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [xmlContent]);

  // For XML routes, we return null so React doesn't render anything
  return null;
}
