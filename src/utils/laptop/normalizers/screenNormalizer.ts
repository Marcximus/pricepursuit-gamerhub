
import { getScreenSizeValue } from '../parsers/screenSizeParser';

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
    
    // Group into size categories
    if (sizeValue >= 18) return '18.0" +';
    if (sizeValue >= 17) return '17.0" +';
    if (sizeValue >= 16) return '16.0" +';
    if (sizeValue >= 15) return '15.0" +';
    if (sizeValue >= 14) return '14.0" +';
    if (sizeValue >= 13) return '13.0" +';
    if (sizeValue >= 12) return '12.0" +';
    if (sizeValue >= 11) return '11.0" +';
    if (sizeValue >= 10) return '10.0" +';
    
    return '';
  }
  return '';
};
