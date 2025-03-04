
export const formatGraphics = (graphics?: string, title?: string): string => {
  if (!graphics || graphics === 'Not Specified' || graphics === 'N/A') {
    // Try to extract from title if graphics is missing
    if (title) {
      const nvidiaMatch = title.match(/NVIDIA\s+(?:GeForce\s+)?(?:RTX|GTX)\s+\d{4}/i);
      if (nvidiaMatch) return nvidiaMatch[0];
      
      const intelMatch = title.match(/Intel\s+(?:Iris\s+Xe|UHD|HD)\s+Graphics/i);
      if (intelMatch) return intelMatch[0];
      
      const amdMatch = title.match(/AMD\s+Radeon(?:\s+RX\s+\d{3,4})?/i);
      if (amdMatch) return amdMatch[0];
    }
    return 'Not Specified';
  }
  
  return graphics;
};
