
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
    if ((cleanedGraphics.match(/^(RTX|GTX)/) || cleanedGraphics.includes('GeForce')) && !cleanedGraphics.includes('NVIDIA')) {
      cleanedGraphics = 'NVIDIA ' + cleanedGraphics;
    }

    // Special handling for Intel graphics to standardize naming
    if (cleanedGraphics.toLowerCase().includes('intel') && 
        (cleanedGraphics.includes('UHD') || 
         cleanedGraphics.includes('Iris') || 
         cleanedGraphics.includes('HD'))) {
      cleanedGraphics = cleanedGraphics.replace(/Intel\s+(UHD|Iris Xe|HD)\s*Graphics?/i, 'Intel $1 Graphics');
    }
    
    console.log('Processed existing graphics:', { original: graphics, cleaned: cleanedGraphics });
    return cleanedGraphics;
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
        gpu = `NVIDIA GeForce ${gpu.replace(/^GeForce\s+/i, '')}`;
      }
      
      // Standardize AMD naming
      if (gpu.includes('Radeon') && !gpu.toLowerCase().includes('graphics')) {
        gpu += ' Graphics';
      }
      
      // Standardize Intel naming
      if (gpu.toLowerCase().includes('intel')) {
        gpu = gpu.replace(/Intel\s+(UHD|Iris Xe|HD)\s*Graphics?/i, 'Intel $1 Graphics');
      }
      
      console.log('Extracted graphics from title:', { title, gpu });
      return gpu;
    }
  }
  
  // Default integrated graphics detection based on processor
  if (title.toLowerCase().includes('ryzen')) {
    console.log('Detected AMD integrated graphics from Ryzen processor:', title);
    return 'AMD Radeon Graphics';
  } else if (title.includes('Intel')) {
    console.log('Detected Intel integrated graphics:', title);
    return 'Intel UHD Graphics';
  }
  
  // If no GPU is found, return undefined
  console.log('No graphics found for:', title);
  return undefined;
};
