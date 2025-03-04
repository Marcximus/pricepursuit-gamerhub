
/**
 * Core normalization function for graphics cards
 */
import { INVALID_GRAPHICS, STANDALONE_BRANDS } from './constants';
import { cleanGraphicsString, extractGraphicsFromMixedSpecs } from './utils';
import { normalizeNvidiaGraphics } from './nvidia';
import { normalizeAmdGraphics } from './amd';
import { normalizeIntelGraphics } from './intel';
import { normalizeAppleGraphics } from './apple';

/**
 * Normalizes graphics card strings for consistent display and filtering
 */
export const normalizeGraphics = (graphics: string): string => {
  if (!graphics) return '';
  
  // Clean up common inconsistencies
  let normalized = cleanGraphicsString(graphics);
  
  // Skip processing if input is too short or invalid
  if (normalized.length < 3) return '';
  
  // Reject standalone brand names or invalid entries
  if (STANDALONE_BRANDS.some(pattern => pattern.test(normalized)) || 
      INVALID_GRAPHICS.some(pattern => pattern.test(normalized))) {
    return '';
  }
  
  // Extract just the graphics card info if mixed with other specs
  normalized = extractGraphicsFromMixedSpecs(normalized);
  
  // Check for "with dedicated graphics" pattern and try to be more specific
  if (/with\s+(?:dedicated|discrete)\s+graphics/i.test(normalized)) {
    // Extract any memory mention that might indicate the GPU model
    const memMatch = normalized.match(/(\d+)\s*GB\s+(?:dedicated|discrete)/i);
    if (memMatch) {
      return `Dedicated ${memMatch[1]}GB Graphics`;
    }
    return 'Dedicated Graphics';
  }
  
  // Try each brand-specific normalizer in sequence
  const nvidiaNormalized = normalizeNvidiaGraphics(normalized);
  if (nvidiaNormalized) return nvidiaNormalized;
  
  const amdNormalized = normalizeAmdGraphics(normalized);
  if (amdNormalized) return amdNormalized;
  
  const intelNormalized = normalizeIntelGraphics(normalized);
  if (intelNormalized) return intelNormalized;
  
  const appleNormalized = normalizeAppleGraphics(normalized);
  if (appleNormalized) return appleNormalized;
  
  // Make sure spaces are normalized for any other cases
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};
