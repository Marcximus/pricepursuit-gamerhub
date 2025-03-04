
/**
 * Utility functions for detecting and categorizing different types of GPUs
 */

/**
 * Determine if a GPU is likely dedicated rather than integrated
 */
export const isDedicatedGPU = (graphics: string | undefined): boolean => {
  if (!graphics) return false;
  
  const normalizedGraphics = graphics.toLowerCase();
  
  // NVIDIA GPUs are always dedicated
  if (normalizedGraphics.includes('nvidia') || 
      normalizedGraphics.includes('geforce') || 
      normalizedGraphics.includes('rtx') || 
      normalizedGraphics.includes('gtx')) {
    return true;
  }
  
  // AMD dedicated GPUs have RX in the name or are Vega discrete models
  if (normalizedGraphics.includes('radeon rx') ||
      (normalizedGraphics.includes('vega') && !normalizedGraphics.includes('vega 3'))) {
    return true;
  }
  
  // Intel Arc is dedicated
  if (normalizedGraphics.includes('intel arc')) {
    return true;
  }
  
  // Explicitly mentions dedicated or discrete
  if (normalizedGraphics.includes('dedicated') || normalizedGraphics.includes('discrete')) {
    return true;
  }
  
  // Check for memory mention which indicates dedicated
  if (/\b\d+\s*gb/i.test(normalizedGraphics) && normalizedGraphics.includes('graphics')) {
    return true;
  }
  
  return false;
};
