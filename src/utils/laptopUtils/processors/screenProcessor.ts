
/**
 * Functions for processing and normalizing screen-related information
 */

export const processScreenResolution = (resolution: string | undefined, title: string, description?: string): string | undefined => {
  if (resolution && typeof resolution === 'string' && !resolution.includes('undefined')) {
    return resolution;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for common resolution patterns
  const resolutionPatterns = [
    // Match specific resolution labels with numbers
    /\b(\d+x\d+|FHD\+?|QHD\+?|UHD\+?|4K|2K|1080p|720p)\b/i,
    
    // Match full resolution specifications
    /\b(\d+)\s*x\s*(\d+)\s*(?:resolution|pixels)?\b/i,
    
    // Match resolution types
    /\b(Full\s*HD|Quad\s*HD|Ultra\s*HD|HD\+|Full\s*HD\+|Retina)\b/i,
    
    // Match resolution with aspect ratio
    /\b(\d+x\d+|FHD\+?|QHD\+?|UHD\+?|4K)\s*\(\d+:\d+\)\b/i,
  ];
  
  for (const pattern of resolutionPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      let res = match[0];
      
      // Standardize resolution format
      res = res.replace(/full\s*hd/i, 'FHD')
               .replace(/quad\s*hd/i, 'QHD')
               .replace(/ultra\s*hd/i, 'UHD')
               .replace(/2k/i, 'QHD')
               .replace(/4k/i, 'UHD')
               .replace(/1080p/i, 'FHD')
               .replace(/720p/i, 'HD');
      
      // If we matched numbers, format them properly
      if (match[1] && match[2] && /\d+/.test(match[1]) && /\d+/.test(match[2])) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        
        // Validate that this looks like a real resolution
        if ((width > 1000 && width < 8000) && (height > 500 && height < 5000)) {
          return `${width}x${height}`;
        }
      }
      
      return res;
    }
  }
  
  // Try to infer resolution from common marketing terms
  if (textToSearch.match(/\bRetina\b/i)) {
    return 'Retina Display';
  }
  
  // Look for screen resolution in common formats
  const screenMatch = textToSearch.match(/\b(1920\s*[×x]\s*1080|2560\s*[×x]\s*1440|3840\s*[×x]\s*2160)\b/i);
  if (screenMatch) {
    const res = screenMatch[0].replace(/\s+/g, '').replace(/[×x]/i, 'x');
    if (res === '1920x1080') return 'FHD (1920x1080)';
    if (res === '2560x1440') return 'QHD (2560x1440)';
    if (res === '3840x2160') return 'UHD (3840x2160)';
    return res;
  }
  
  // If we have screen size but no resolution, try to infer common resolutions
  const sizeMatch = textToSearch.match(/\b1[0-9](\.[0-9])?\s*inch\b/i);
  if (sizeMatch) {
    if (textToSearch.match(/\bfhd\b/i)) return 'FHD (1920x1080)';
    if (textToSearch.match(/\bqhd\b/i)) return 'QHD (2560x1440)';
    if (textToSearch.match(/\buhd\b/i) || textToSearch.match(/\b4k\b/i)) return 'UHD (3840x2160)';
  }
  
  return undefined;
};

export const processRefreshRate = (title: string, description?: string): number | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for refresh rate patterns
  const refreshRatePatterns = [
    /\b(\d{2,3})\s*Hz\s*(?:refresh\s*rate)?\b/i,
    /\b(\d{2,3})Hz\b/i,
    /\brefresh\s*rate:?\s*(\d{2,3})(?:\s*Hz)?\b/i
  ];
  
  for (const pattern of refreshRatePatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const rate = parseInt(match[1], 10);
      // Validate that this is a realistic refresh rate for a laptop
      if (rate >= 60 && rate <= 360) {
        return rate;
      }
    }
  }
  
  return undefined;
};
