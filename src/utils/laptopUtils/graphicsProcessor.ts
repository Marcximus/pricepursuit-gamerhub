
export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    return graphics;
  }
  
  const graphicsPatterns = [
    /\b(NVIDIA GeForce RTX \d{4}(?:\s*Ti)?|NVIDIA GeForce GTX \d{3,4}(?:\s*Ti)?)\b/i,
    /\b(Intel (UHD|Iris Xe|Iris Plus) Graphics|AMD Radeon)\b/i,
    /\bRTX\s*(\d{4})(?:\s*Ti)?\b/i,
    /\bGTX\s*(\d{3,4})(?:\s*Ti)?\b/i
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
  
  if (title.includes('Intel')) {
    return 'Intel UHD Graphics';
  }
  
  return undefined;
};
