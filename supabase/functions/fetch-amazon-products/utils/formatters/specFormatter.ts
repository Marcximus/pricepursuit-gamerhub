
/**
 * Formats product specifications into a standardized format
 */

import { extractFeatures } from './featureFormatter.ts';

/**
 * Format product specifications into a standardized string format
 * @param product The product data
 * @returns A formatted specification string
 */
export function formatSpecs(product: any): string {
  const features = extractFeatures(product);
  return features.join(' | ');
}
