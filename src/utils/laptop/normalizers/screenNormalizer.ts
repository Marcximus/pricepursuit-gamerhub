
import { getScreenSizeValue } from '../valueParser';

/**
 * Normalizes screen size strings for consistent display
 */
export const normalizeScreenSize = (size: string): string => {
  if (!size) return '';
  
  // Extract the numeric value and standardize to inches
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    const sizeValue = parseFloat(match[1]);
    // Filter out unrealistic laptop screen sizes (less than 10" or greater than 21")
    if (sizeValue < 10 || sizeValue > 21) {
      return '';
    }
    return `${sizeValue.toFixed(1)}"`;
  }
  return '';
};
