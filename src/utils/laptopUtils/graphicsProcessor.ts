
/**
 * Processes and normalizes graphics card information
 */
export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    // Clean up existing graphics string to remove unrelated specs
    const cleanedGraphics = graphics
      .replace(/(\d+\s*GB\s*(RAM|Memory|DDR\d*))/i, '')
      .replace(/(\d+\s*(GB|TB)\s*(SSD|HDD|Storage))/i, '')
      .replace(/(\d+(\.\d+)?\s*inch)/i, '')
      .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (cleanedGraphics.length > 3 && 
        cleanedGraphics !== 'Graphics' && 
        cleanedGraphics !== 'GPU' && 
        !cleanedGraphics.includes('32-core')) {
      // Clean up common inconsistencies in GPU naming
      let processedGraphics = cleanedGraphics
        .replace(/\bGPU\b/i, '') // Remove standalone "GPU" word
        .replace(/\s+/g, ' ')    // Normalize spaces
        .trim();
      
      // Add "Graphics" suffix for AMD integrated GPUs if not present
      if (processedGraphics.includes('Radeon') && !processedGraphics.toLowerCase().includes('graphics')) {
        processedGraphics += ' Graphics';
      }
      
      // Add NVIDIA prefix if missing for RTX/GTX cards
      if ((processedGraphics.match(/^(RTX|GTX)/) || processedGraphics.includes('GeForce')) && !processedGraphics.includes('NVIDIA')) {
        processedGraphics = 'NVIDIA ' + processedGraphics;
      }

      // Special handling for Intel graphics to standardize naming
      if (processedGraphics.toLowerCase().includes('intel') && 
          (processedGraphics.includes('UHD') || 
           processedGraphics.includes('Iris') || 
           processedGraphics.includes('HD'))) {
        processedGraphics = processedGraphics.replace(/Intel\s+(UHD|Iris Xe|HD)\s*Graphics?/i, 'Intel $1 Graphics');
      }
      
      return processedGraphics;
    }
  }
  
  // Look for graphics in the title (more specific patterns first)
  const graphicsPatterns = [
    // NVIDIA RTX/GTX Cards (including mobile variants)
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s*\d{3,4}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // AMD Graphics (discrete and integrated)
    /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*\d{3,4}[A-Z]*(?:\s*XT)?\s*(?:Graphics)?\b/i,
    /\b(?:AMD\s+)?Radeon(?:\s+Graphics)?\b/i,
    
    // Intel Graphics
    /\b(?:Intel\s+)?(?:UHD|Iris\s+Xe|Iris\s+Plus|HD)\s*Graphics(?:\s*\d*)?\b/i,
    
    // Generic patterns (as fallback)
    /\b(?:NVIDIA|AMD|Intel)\s+(?:Graphics|GPU)\b/i,
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      let gpu = match[0].trim();
      
      // Standardize NVIDIA naming
      if (gpu.match(/^(?:GeForce\s+)?(?:RTX|GTX)/i)) {
        gpu = `NVIDIA ${gpu.replace(/^GeForce\s+/i, '')}`;
      }
      
      // Standardize AMD naming
      if (gpu.includes('Radeon') && !gpu.toLowerCase().includes('graphics')) {
        gpu += ' Graphics';
      }
      
      // Standardize Intel naming
      if (gpu.toLowerCase().includes('intel')) {
        gpu = gpu.replace(/Intel\s+(UHD|Iris Xe|HD)\s*Graphics?/i, 'Intel $1 Graphics');
      }
      
      // Ensure the processor doesn't contain RAM or storage specs
      if (!/\d+\s*GB\s*(RAM|Memory|SSD|Storage)/i.test(gpu)) {
        return gpu;
      }
    }
  }
  
  // Default integrated graphics detection based on processor
  if (title.toLowerCase().includes('ryzen') && !title.toLowerCase().includes('nvidia') && !title.toLowerCase().includes('rtx') && !title.toLowerCase().includes('gtx')) {
    return 'AMD Radeon Graphics';
  } else if (title.includes('Intel') && !title.toLowerCase().includes('nvidia') && !title.toLowerCase().includes('rtx') && !title.toLowerCase().includes('gtx')) {
    return 'Intel UHD Graphics';
  } else if ((title.includes('M1') || title.includes('M2') || title.includes('M3')) && title.toLowerCase().includes('apple')) {
    return title.includes('M1') ? 'Apple M1 GPU' : 
           title.includes('M2') ? 'Apple M2 GPU' : 'Apple M3 GPU';
  }
  
  return undefined;
};
