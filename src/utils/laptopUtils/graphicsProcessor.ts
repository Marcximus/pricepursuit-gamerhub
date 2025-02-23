
export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    // Clean up common inconsistencies in GPU naming
    let cleanedGraphics = graphics
      .replace(/\bGPU\b/i, '') // Remove standalone "GPU" word
      .replace(/\s+/g, ' ')    // Normalize spaces
      .trim();
    
    // Add "Graphics" suffix for AMD integrated GPUs if not present
    if (cleanedGraphics.includes('Radeon') && !cleanedGraphics.toLowerCase().includes('graphics')) {
      cleanedGraphics += ' Graphics';
    }
    
    // Add NVIDIA prefix if missing for RTX/GTX cards
    if (cleanedGraphics.match(/^(RTX|GTX)/)) {
      cleanedGraphics = 'NVIDIA GeForce ' + cleanedGraphics;
    }
    
    return cleanedGraphics;
  }
  
  // Look for graphics in the title (more specific patterns first)
  const graphicsPatterns = [
    // NVIDIA RTX/GTX Cards (including mobile variants)
    /\b(?:NVIDIA GeForce RTX \d{4}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?)\b/i,
    /\b(?:NVIDIA GeForce GTX \d{3,4}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?)\b/i,
    /\bRTX\s*(\d{4})(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    /\bGTX\s*(\d{3,4})(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // AMD Graphics (discrete and integrated)
    /\b(?:AMD Radeon RX \d{3,4}[A-Z]*(?:\s*XT)?)\b/i,
    /\b(?:Radeon RX \d{3,4}[A-Z]*(?:\s*XT)?)\b/i,
    /\b(?:AMD Radeon(?:\s*\w*\d*)?)\s*Graphics?\b/i,
    /\b(?:Radeon\s*RX\s*Vega\s*\d+)\s*Graphics\b/i,
    
    // Intel Graphics
    /\b(?:Intel (?:UHD|Iris Xe|Iris Plus) Graphics(?:\s*\d*)?)\b/i,
    /\b(?:Intel Iris Xe MAX)\b/i,
    
    // Generic patterns
    /\b(?:NVIDIA|AMD|Intel)\s+(?:Graphics|GPU)\b/i,
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
      
      // Add "Graphics" suffix for AMD integrated GPUs if not present
      if (gpu.includes('Radeon') && !gpu.toLowerCase().includes('graphics')) {
        gpu += ' Graphics';
      }
      
      return gpu;
    }
  }
  
  // Default integrated graphics detection based on processor
  if (title.toLowerCase().includes('ryzen')) {
    return 'AMD Radeon Graphics';
  } else if (title.includes('Intel')) {
    return 'Intel UHD Graphics';
  }
  
  // If no GPU is found, return undefined
  return undefined;
};
