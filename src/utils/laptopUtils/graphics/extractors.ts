
import { normalizeGraphics } from "@/utils/laptop/normalizers/graphicsNormalizer";
import { 
  nvidiaPatterns, 
  amdPatterns, 
  intelPatterns, 
  applePatterns 
} from "./patterns";

/**
 * Extracts graphics card information from a product title using enhanced pattern matching
 * Uses a series of increasingly specific patterns to catch different GPU formats
 */
export const extractGraphicsFromTitle = (title: string): string | undefined => {
  if (!title || typeof title !== 'string') return undefined;
  
  // Try to match against all patterns, starting with NVIDIA (most common dedicated GPUs)
  for (const pattern of [...nvidiaPatterns, ...amdPatterns, ...intelPatterns, ...applePatterns]) {
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
  
  // Special pattern for mentions of "dedicated graphics" with a number
  const dedicatedMatch = title.match(/\b(?:Dedicated|Discrete)\s+(?:\d+\s*GB)?\s*Graphics\b/i);
  if (dedicatedMatch) {
    return "Dedicated Graphics";
  }
  
  // Secondary extraction from other parts of the title (after "with", "featuring", etc.)
  const titleSegments = title.split(/\s+with\s+|\s+featuring\s+|\s+includes\s+|\s+and\s+/i);
  if (titleSegments.length > 1) {
    // Check segments after the first for GPU mentions
    for (let i = 1; i < titleSegments.length; i++) {
      const segment = titleSegments[i];
      
      // Check for GPU-related keywords in this segment
      if (segment.match(/\b(?:GPU|Graphics|RTX|GTX|RX|Radeon|Vega|Intel|AMD|NVIDIA)\b/i)) {
        // Apply our patterns to just this segment
        for (const pattern of [...nvidiaPatterns, ...amdPatterns, ...intelPatterns]) {
          const segmentMatch = segment.match(pattern);
          if (segmentMatch) {
            const gpu = segmentMatch[0].trim();
            const normalizedGpu = normalizeGraphics(gpu);
            if (normalizedGpu) {
              return normalizedGpu;
            }
            return gpu;
          }
        }
      }
    }
  }
  
  // Default GPU detection based on processor mentioned in title
  return detectDefaultGPUFromProcessor(title);
};

/**
 * Detects the default GPU based on processor information in the title
 */
const detectDefaultGPUFromProcessor = (title: string): string | undefined => {
  const titleLower = title.toLowerCase();
  
  // Ryzen processors typically have AMD integrated graphics
  if (titleLower.includes('ryzen') && 
      !titleLower.includes('nvidia') && 
      !titleLower.includes('rtx') && 
      !titleLower.includes('gtx')) {
    // Try to determine specific AMD integrated graphics based on Ryzen generation
    if (titleLower.includes('ryzen 7') || titleLower.includes('ryzen 9')) {
      return 'AMD Radeon Graphics';
    } else if (titleLower.includes('ryzen 5')) {
      return 'AMD Radeon Graphics';
    } else if (titleLower.includes('ryzen 3')) {
      return 'AMD Radeon Vega 3 Graphics';
    } else {
      return 'AMD Radeon Graphics';
    }
  } 
  
  // Enhanced AMD R5/R7 pattern detection for GPUs
  if (titleLower.match(/\bamd\s+r[3579]/i) && 
      !titleLower.includes('nvidia') && 
      !titleLower.includes('rtx') && 
      !titleLower.includes('gtx')) {
    return 'AMD Radeon Graphics';
  }
  
  // Enhanced AMD pattern with trademark symbols
  if (titleLower.match(/\bamd(?:®|\s+®)?\s+ryzen(?:™|\s+™)?/i) && 
      !titleLower.includes('nvidia') && 
      !titleLower.includes('rtx') && 
      !titleLower.includes('gtx')) {
    return 'AMD Radeon Graphics';
  }
  
  // Intel processors typically have Intel integrated graphics
  if (titleLower.includes('intel') && 
      !titleLower.includes('nvidia') && 
      !titleLower.includes('rtx') && 
      !titleLower.includes('gtx')) {
    
    // Try to determine which Intel graphics based on processor generation
    if (titleLower.includes('12th gen') || 
        titleLower.includes('13th gen') ||
        titleLower.includes('14th gen')) {
      return 'Intel Iris Xe Graphics';
    } else if (titleLower.includes('11th gen') || 
               titleLower.includes('1135g') || 
               titleLower.includes('1165g')) {
      return 'Intel Iris Xe Graphics';
    } else if (titleLower.includes('10th gen') || 
               titleLower.includes('1035g') || 
               titleLower.includes('1065g')) {
      return 'Intel Iris Plus Graphics';
    } else {
      return 'Intel UHD Graphics';
    }
  } 
  
  // Apple Silicon detection
  if ((titleLower.includes('m1') || titleLower.includes('m2') || titleLower.includes('m3')) && 
      titleLower.includes('apple')) {
    if (titleLower.includes('m3')) {
      if (titleLower.includes('pro')) return 'Apple M3 Pro GPU';
      if (titleLower.includes('max')) return 'Apple M3 Max GPU';
      if (titleLower.includes('ultra')) return 'Apple M3 Ultra GPU';
      return 'Apple M3 GPU';
    }
    if (titleLower.includes('m2')) {
      if (titleLower.includes('pro')) return 'Apple M2 Pro GPU';
      if (titleLower.includes('max')) return 'Apple M2 Max GPU';
      if (titleLower.includes('ultra')) return 'Apple M2 Ultra GPU';
      return 'Apple M2 GPU';
    }
    if (titleLower.includes('pro')) return 'Apple M1 Pro GPU';
    if (titleLower.includes('max')) return 'Apple M1 Max GPU';
    if (titleLower.includes('ultra')) return 'Apple M1 Ultra GPU';
    return 'Apple M1 GPU';
  }
  
  // If no GPU information could be extracted
  return undefined;
};
