
import { normalizeGraphics } from "@/utils/laptop/normalizers/graphicsNormalizer";
import { extractGraphicsFromTitle } from "./extractors";
import { isDedicatedGPU } from "./detectors";

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
  
  // Check for Intel HD Graphics in the title
  const intelHdMatch = title.match(/Intel\s+(?:HD|UHD)\s+Graphics(?:\s+\d+)?/i);
  if (intelHdMatch) {
    return intelHdMatch[0];
  }
  
  // Check for Intel N-series processors which typically have integrated HD Graphics
  const intelNSeriesMatch = title.match(/Intel\s+(?:Celeron\s+)?N\d{4}/i);
  if (intelNSeriesMatch) {
    // For Intel N-series processors, they typically have Intel HD Graphics
    return 'Intel HD Graphics';
  }
  
  // If we couldn't use existing graphics info, extract from title
  return extractGraphicsFromTitle(title);
};

/**
 * Re-export the detection functions for backward compatibility
 */
export { isDedicatedGPU as isDedicatedGraphics } from './detectors';
