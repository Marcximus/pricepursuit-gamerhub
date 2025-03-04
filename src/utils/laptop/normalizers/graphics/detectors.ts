
/**
 * Functions for detecting and categorizing different types of GPUs
 */

/**
 * Detect if the GPU is integrated or dedicated
 */
export const isIntegratedGraphics = (graphics: string): boolean => {
  if (!graphics) return false;
  
  const normalized = graphics.toLowerCase();
  
  // Known integrated graphics
  if (normalized.includes('intel') && 
     (normalized.includes('uhd') || 
      normalized.includes('hd graphics') || 
      normalized.includes('iris'))) {
    return true;
  }
  
  if (normalized.includes('amd') && 
     (normalized.includes('radeon graphics') && 
     !normalized.includes('radeon rx'))) {
    return true;
  }
  
  // Vega 3/5/6/7/8 are typically integrated in APUs
  if (normalized.includes('vega') && 
      /vega\s+[3-8]\b/i.test(normalized)) {
    return true;
  }
  
  if (normalized.includes('apple m')) {
    return true;
  }
  
  // Explicitly mentions integrated
  if (/integrated/i.test(graphics)) {
    return true;
  }
  
  return false;
};

/**
 * Detect if the GPU is a high-performance model
 */
export const isHighPerformanceGraphics = (graphics: string): boolean => {
  if (!graphics) return false;
  
  const normalized = graphics.toLowerCase();
  
  // NVIDIA high-performance GPUs
  if (normalized.includes('rtx 40')) return true; // 40 series is high performance
  if (normalized.includes('rtx 30') && 
      (normalized.includes('3070') || normalized.includes('3080') || normalized.includes('3090'))) {
    return true;
  }
  if (normalized.includes('rtx 20') && 
      (normalized.includes('2070') || normalized.includes('2080') || normalized.includes('2090'))) {
    return true;
  }
  if (normalized.includes('gtx') && 
      (normalized.includes('1070') || normalized.includes('1080'))) {
    return true;
  }
  
  // AMD high-performance GPUs
  if (normalized.includes('radeon rx 7') && 
      (normalized.includes('7700') || normalized.includes('7800') || normalized.includes('7900'))) {
    return true;
  }
  if (normalized.includes('radeon rx 6') && 
      (normalized.includes('6700') || normalized.includes('6800') || normalized.includes('6900'))) {
    return true;
  }
  if (normalized.includes('radeon rx 5') && 
      (normalized.includes('5700') || normalized.includes('5800') || normalized.includes('5900'))) {
    return true;
  }
  
  // Intel discrete graphics
  if (normalized.includes('intel arc') && 
      (normalized.includes('a7') || normalized.includes('a770') || normalized.includes('a750'))) {
    return true;
  }
  
  // Apple higher-end variants
  if (normalized.includes('apple m') && 
      (normalized.includes('pro') || normalized.includes('max') || normalized.includes('ultra'))) {
    return true;
  }
  
  // VRAM indicators
  if ((normalized.includes('nvidia') || normalized.includes('radeon rx')) && 
      /\b(?:8|10|12|16|24)\s*gb\b/i.test(normalized)) {
    return true;
  }
  
  return false;
};
