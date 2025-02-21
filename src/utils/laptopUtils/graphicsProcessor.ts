
export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    return graphics;
  }
  
  // Look for graphics in the title (more specific patterns first)
  const graphicsPatterns = [
    // Match specific AMD integrated graphics patterns first
    /\b(?:Radeon\s*RX\s*Vega\s*\d+)\s*Graphics\b/i,
    /\b(?:AMD\s*Radeon\s*RX\s*\d{3,4}M?)\b/i,
    
    // Match NVIDIA discrete graphics
    /\b(?:NVIDIA GeForce RTX \d{4}(?:\s*Ti)?|NVIDIA GeForce GTX \d{3,4}(?:\s*Ti)?)\b/i,
    
    // Match other common integrated graphics
    /\b(?:Intel (?:UHD|Iris Xe|Iris Plus) Graphics(?:\s*\d*)?)\b/i,
    
    // Match AMD integrated graphics (more general pattern)
    /\b(?:AMD Radeon(?:\s*\w*\d*)?)\s*Graphics?\b/i,
    
    // Match common shorthand for NVIDIA graphics
    /\bRTX\s*(\d{4})(?:\s*Ti)?\b/i,
    /\bGTX\s*(\d{3,4})(?:\s*Ti)?\b/i,
    
    // Generic patterns for Intel/AMD graphics
    /\b(?:Intel|AMD)\s+(?:Graphics|GPU)\b/i,
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      let gpu = match[0];
      // Clean up NVIDIA shorthand
      if (gpu.startsWith('RTX')) {
        gpu = 'NVIDIA GeForce ' + gpu;
      } else if (gpu.startsWith('GTX')) {
        gpu = 'NVIDIA GeForce ' + gpu;
      }
      
      // Clean up formatting
      gpu = gpu.replace(/\s+/g, ' ').trim();
      
      // Ensure "Graphics" suffix for AMD integrated GPUs if not present
      if (gpu.includes('Radeon') && !gpu.toLowerCase().includes('graphics')) {
        gpu += ' Graphics';
      }
      
      return gpu;
    }
  }
  
  // Default integrated graphics detection based on processor
  if (title.toLowerCase().includes('ryzen')) {
    const ryzenMatch = title.match(/Ryzen\s*\d/i);
    if (ryzenMatch) {
      return 'AMD Radeon Graphics'; // Generic AMD integrated graphics
    }
  } else if (title.includes('Intel')) {
    return 'Intel UHD Graphics';
  }
  
  // If no GPU is found, return undefined
  return undefined;
};

