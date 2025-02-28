
import { getScreenSizeValue } from '../valueParser';

/**
 * Normalizes screen size strings for consistent display
 */
export const normalizeScreenSize = (size: string): string => {
  if (!size) return '';
  
  // Extract the numeric value and standardize to inches
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    return `${match[1]}"`;
  }
  return size;
};
