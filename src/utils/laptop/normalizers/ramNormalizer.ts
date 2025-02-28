
import { getRamValue } from '../valueParser';

/**
 * Normalizes RAM strings for consistent display
 */
export const normalizeRam = (ram: string): string => {
  if (!ram) return '';
  
  const gbValue = getRamValue(ram);
  // Filter out unrealistic RAM values (less than 2GB or greater than 128GB for laptops)
  if (gbValue < 2 || gbValue > 128) return '';
  
  // Format as integer if it's a whole number, otherwise show decimal
  const formattedGB = Number.isInteger(gbValue) ? gbValue.toString() : gbValue.toFixed(1);
  return `${formattedGB} GB`;
};
