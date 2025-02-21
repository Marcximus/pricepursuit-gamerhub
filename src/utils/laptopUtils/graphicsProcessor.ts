
export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    return graphics;
  }
  
  // Look for graphics in the title (more specific patterns first)
  const graphicsPatterns = [
    /\b(?:NVIDIA GeForce RTX \d{4}(?:\s*Ti)?|NVIDIA GeForce GTX \d{3,4}(?:\s*Ti)?)\b/i,
    /\b(?:Intel (?:UHD|Iris Xe|Iris Plus) Graphics(?:\s*\d*)?|AMD Radeon(?:\s*\w*\d*)?)\b/i,
    /\bRTX\s*(\d{4})(?:\s*Ti)?\b/i,
    /\bGTX\s*(\d{3,4})(?:\s*Ti)?\b/i,
    /\b(?:Intel|AMD)\s+(?:Graphics|GPU)\b/i,
  ];
  
  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      let gpu = match[0];
      if (gpu.startsWith('RTX')) {
        gpu = 'NVIDIA GeForce ' + gpu;
      } else if (gpu.startsWith('GTX')) {
        gpu = 'NVIDIA GeForce ' + gpu;
      }
      return gpu.trim();
    }
  }
  
  // Default integrated graphics for Intel processors if no dedicated GPU is found
  if (title.includes('Intel')) {
    return 'Intel UHD Graphics';
  }
  
  return undefined;
};

