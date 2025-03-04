
/**
 * Advanced module for processing and extracting graphics card information from product titles and descriptions
 */

import { normalizeGraphics } from "../laptop/normalizers/graphicsNormalizer";

/**
 * Processes and normalizes graphics card information from product data
 * @param graphics Existing graphics string if available
 * @param title Product title to extract graphics from if not available
 * @returns Normalized graphics card string
 */
export const processGraphics = (graphics: string | undefined, title: string): string | undefined => {
  // First try to use and clean existing graphics information
  if (graphics && typeof graphics === 'string' && !graphics.includes('undefined')) {
    // Normalize the existing graphics info
    const normalizedGraphics = normalizeGraphics(graphics);
    
    // If we got a valid result from normalization, return it
    if (normalizedGraphics && normalizedGraphics.length > 3) {
      return normalizedGraphics;
    }
  }
  
  // If we couldn't use existing graphics info, extract from title
  return extractGraphicsFromTitle(title);
};

/**
 * Extracts graphics card information from a product title using enhanced pattern matching
 * Uses a series of increasingly general patterns to catch different GPU formats
 */
const extractGraphicsFromTitle = (title: string): string | undefined => {
  if (!title || typeof title !== 'string') return undefined;
  
  // NVIDIA GPU patterns (from specific to general)
  const nvidiaPatterns = [
    // RTX 40-series with variant detection (most recent)
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*40\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // RTX 30-series with variant detection 
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*30\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // RTX 20-series with variant detection
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?RTX\s*20\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // GTX 16-series with variant detection
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*16\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // GTX 10-series with variant detection
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*10\d{2}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // Older GTX series
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s*\d{3,4}(?:\s*Ti)?(?:\s*Super)?(?:\s*Max-Q)?\b/i,
    
    // Generic RTX/GTX with number pattern
    /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s*\d{3,4}\b/i,
    
    // Very generic NVIDIA GeForce mention (try to avoid this if possible)
    /\bNVIDIA\s+GeForce\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor)[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?\b/i,
    
    // Last resort - any NVIDIA mention (fallback, avoid if possible)
    /\bNVIDIA\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor)[A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)?\b/i
  ];
  
  // AMD GPU patterns - enhanced for more specific detection
  const amdPatterns = [
    // RX 7000 series with variant detection
    /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*7\d{3}[A-Z]*(?:\s*XT)?\b/i,
    
    // RX 6000 series with variant detection
    /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*6\d{3}[A-Z]*(?:\s*XT)?\b/i,
    
    // RX 5000 series with variant detection
    /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*5\d{3}[A-Z]*(?:\s*XT)?\b/i,
    
    // Older RX series (500, 400, etc.)
    /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*[45678]\d{2}[A-Z]*(?:\s*XT)?\b/i,
    
    // Vega series with number
    /\b(?:AMD\s+)?Radeon(?:\s+Vega)?\s*Vega\s*\d+\b/i,
    
    // Generic RX series
    /\b(?:AMD\s+)?Radeon\s+RX\s*\d{3,4}[A-Z]*(?:\s*XT)?\b/i,
    
    // Generic Vega
    /\b(?:AMD\s+)?Radeon\s+Vega\s*\d*\b/i,
    
    // Generic Radeon (likely integrated)
    /\b(?:AMD\s+)?Radeon\s+Graphics\b/i,
    
    // Last resort - any AMD graphics mention (fallback)
    /\bAMD\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor|ryzen)[A-Za-z0-9]+(?:\s+Graphics)?\b/i
  ];
  
  // Intel GPU patterns - enhanced for Arc and Xe detection
  const intelPatterns = [
    // Intel Arc series (discrete) with model detection
    /\b(?:Intel\s+)?Arc\s+[A-Z]\d{2,3}\b/i,
    
    // Iris Xe with memory variant
    /\b(?:Intel\s+)?Iris\s+Xe\s*Graphics(?:\s*MAX)?(?:\s*\d*GB)?\b/i,
    
    // Iris Xe (integrated but better)
    /\b(?:Intel\s+)?Iris\s+Xe\s*Graphics(?:\s*\d*)?\b/i,
    
    // Iris Plus/Pro (integrated)
    /\b(?:Intel\s+)?Iris\s+(?:Plus|Pro)\s*Graphics(?:\s*\d*)?\b/i,
    
    // UHD Graphics with generation number
    /\b(?:Intel\s+)?UHD\s*Graphics\s*(?:for\s+\d+th\s+Gen\s*)?(?:\d*)?\b/i,
    
    // HD Graphics with generation number
    /\b(?:Intel\s+)?HD\s*Graphics\s*(?:\d*)?\b/i,
    
    // Generic Intel graphics mention (fallback)
    /\bIntel\s+(?!CPU|RAM|SSD|HDD|GB|TB|processor|core|celeron|pentium)[A-Za-z0-9]+\s+Graphics\b/i
  ];
  
  // Apple silicon GPU patterns - enhanced for variant detection
  const applePatterns = [
    // M3 series with variant detection
    /\b(?:Apple\s+)?M3\s+(?:Pro|Max|Ultra)(?:\s+with\s+\d+-core\s+GPU)?\b/i,
    
    // M3 with core count
    /\b(?:Apple\s+)?M3(?:\s+with\s+\d+-core\s+GPU)?\b/i,
    
    // M2 series with variant detection
    /\b(?:Apple\s+)?M2\s+(?:Pro|Max|Ultra)(?:\s+with\s+\d+-core\s+GPU)?\b/i,
    
    // M2 with core count
    /\b(?:Apple\s+)?M2(?:\s+with\s+\d+-core\s+GPU)?\b/i,
    
    // M1 series with variant detection
    /\b(?:Apple\s+)?M1\s+(?:Pro|Max|Ultra)(?:\s+with\s+\d+-core\s+GPU)?\b/i,
    
    // M1 with core count
    /\b(?:Apple\s+)?M1(?:\s+with\s+\d+-core\s+GPU)?\b/i,
    
    // Generic M-series reference
    /\b(?:Apple\s+)?M[123](?:\s+(?:Pro|Max|Ultra))?\s*(?:GPU|Graphics)?\b/i
  ];
  
  // Try to match against all patterns, prioritizing NVIDIA (most common discrete GPUs)
  // Then AMD, then Intel, then Apple
  const allPatterns = [...nvidiaPatterns, ...amdPatterns, ...intelPatterns, ...applePatterns];
  
  for (const pattern of allPatterns) {
    const match = title.match(pattern);
    if (match) {
      const gpu = match[0].trim();
      
      // Apply normalization to standardize the extracted value
      const normalizedGpu = normalizeGraphics(gpu);
      if (normalizedGpu) {
        return normalizedGpu;
      }
      
      // If normalization failed, return the raw match
      return gpu;
    }
  }
  
  // Default integrated graphics detection based on processor mentioned in title
  if (title.toLowerCase().includes('ryzen') && 
      !title.toLowerCase().includes('nvidia') && 
      !title.toLowerCase().includes('rtx') && 
      !title.toLowerCase().includes('gtx')) {
    return 'AMD Radeon Graphics';
  } 
  
  if (title.toLowerCase().includes('intel') && 
      !title.toLowerCase().includes('nvidia') && 
      !title.toLowerCase().includes('rtx') && 
      !title.toLowerCase().includes('gtx')) {
    
    // Try to determine which Intel graphics based on processor generation
    if (title.toLowerCase().includes('12th gen') || 
        title.toLowerCase().includes('13th gen') ||
        title.toLowerCase().includes('11th gen') || 
        title.toLowerCase().includes('1135g') || 
        title.toLowerCase().includes('1165g')) {
      return 'Intel Iris Xe Graphics';
    } else if (title.toLowerCase().includes('10th gen') || 
               title.toLowerCase().includes('1035g') || 
               title.toLowerCase().includes('1065g')) {
      return 'Intel Iris Plus Graphics';
    } else {
      return 'Intel UHD Graphics';
    }
  } 
  
  if ((title.includes('M1') || title.includes('M2') || title.includes('M3')) && 
      title.toLowerCase().includes('apple')) {
    if (title.includes('M3')) return 'Apple M3 GPU';
    if (title.includes('M2')) return 'Apple M2 GPU';
    return 'Apple M1 GPU';
  }
  
  // If no GPU information could be extracted
  return undefined;
};

/**
 * Determine if a GPU is likely dedicated rather than integrated
 */
export const isDedicatedGraphics = (graphics: string | undefined): boolean => {
  if (!graphics) return false;
  
  const normalizedGraphics = graphics.toLowerCase();
  
  // NVIDIA GPUs are always dedicated
  if (normalizedGraphics.includes('nvidia') || 
      normalizedGraphics.includes('geforce') || 
      normalizedGraphics.includes('rtx') || 
      normalizedGraphics.includes('gtx')) {
    return true;
  }
  
  // AMD dedicated GPUs have RX in the name
  if (normalizedGraphics.includes('radeon rx')) {
    return true;
  }
  
  // Intel Arc is dedicated
  if (normalizedGraphics.includes('intel arc')) {
    return true;
  }
  
  // Explicitly mentions dedicated
  if (normalizedGraphics.includes('dedicated')) {
    return true;
  }
  
  return false;
};
