
import { appleSiliconPatterns } from '../patterns/processorPatterns';

/**
 * Extracts and processes Apple Silicon processors
 */
export function extractAppleProcessor(text: string): string | null {
  if (!text) return null;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Apple M-series chips
  if (appleSiliconPatterns.appleChip.test(normalizedText)) {
    // Match full Apple M-series patterns
    const match = normalizedText.match(/\b(?:apple\s*)?m([123])(?:\s+(pro|max|ultra))?\s*(?:chip)?\b/i);
    if (match) {
      const variant = match[2] ? ` ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}` : '';
      return `Apple M${match[1]}${variant} chip`;
    }
  }
  
  // Check for MacBook with M-series
  if (appleSiliconPatterns.macbookM.test(normalizedText)) {
    const match = normalizedText.match(/\bmacbook.*m([123])(?:\s+(pro|max|ultra))?\b/i);
    if (match) {
      const variant = match[2] ? ` ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}` : '';
      return `Apple M${match[1]}${variant} chip`;
    }
  }
  
  // Check for M-series without Apple prefix but not in RAM/memory context
  if (appleSiliconPatterns.mSeries.test(normalizedText) && 
      !normalizedText.includes('ram') && 
      !normalizedText.includes('memory')) {
    const match = normalizedText.match(/\bm([123])(?:\s+(pro|max|ultra))?\b/i);
    if (match) {
      const variant = match[2] ? ` ${match[2].charAt(0).toUpperCase() + match[2].slice(1)}` : '';
      return `Apple M${match[1]}${variant} chip`;
    }
  }
  
  // Special case for "Apple" in MacBook context
  if (normalizedText.includes('apple') && 
      (normalizedText.includes('macbook') || normalizedText.includes('mac book'))) {
    if (normalizedText.includes('m1')) {
      return 'Apple M1 chip';
    } else if (normalizedText.includes('m2')) {
      return 'Apple M2 chip';
    } else if (normalizedText.includes('m3')) {
      return 'Apple M3 chip';
    }
  }
  
  return null;
}
