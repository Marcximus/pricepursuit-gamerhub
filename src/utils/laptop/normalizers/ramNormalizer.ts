
import { getRamValue } from '../parsers/ramParser';

/**
 * Normalizes RAM strings for consistent display
 */
export const normalizeRam = (ram: string): string => {
  if (!ram) return '';
  
  // Check if this is actually RAM and not storage or GPU memory
  // RAM typically has specific keywords alongside it
  const isActuallyRam = /ram|memory|ddr/i.test(ram);
  if (!isActuallyRam) {
    // Additional check: standalone GB values are likely not RAM
    // unless they match common RAM sizes
    const gbValue = getRamValue(ram);
    const commonRamSizes = [4, 8, 12, 16, 24, 32, 64, 96, 128];
    if (!commonRamSizes.includes(gbValue)) {
      return '';
    }
  }
  
  const gbValue = getRamValue(ram);
  
  // Filter out unrealistic RAM values for laptops
  if (gbValue < 2 || gbValue > 128) return '';
  
  // Format as integer if it's a whole number, otherwise show decimal
  const formattedGB = Number.isInteger(gbValue) ? gbValue.toString() : gbValue.toFixed(1);
  return `${formattedGB} GB`;
};
