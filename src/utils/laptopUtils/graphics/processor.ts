
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
  
  // If we couldn't use existing graphics info, extract from title
  return extractGraphicsFromTitle(title);
};

/**
 * Re-export the detection functions for backward compatibility
 */
export { isDedicatedGPU as isDedicatedGraphics } from './detectors';
