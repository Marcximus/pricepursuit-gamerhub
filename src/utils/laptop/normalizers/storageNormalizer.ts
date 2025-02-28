
import { getStorageValue } from '../valueParser';

/**
 * Normalizes storage strings for consistent display
 * Enhanced to handle a wider range of storage formats with improved validation
 */
export const normalizeStorage = (storage: string): string => {
  if (!storage) return '';
  
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Filter out invalid or unrealistic storage values for laptops
  // Minimum 128GB, maximum realistic size is 4TB (4096GB)
  if (gbValue < 128 || gbValue > 4096) {
    return '';
  }
  
  // Convert to TB if ≥ 1000 GB
  if (gbValue >= 1000) {
    const tbValue = gbValue / 1024;
    // Format TB value to fixed decimal places only if it has a decimal part
    return `${tbValue.toFixed(tbValue % 1 === 0 ? 0 : 1)} TB`;
  }
  
  // Return consistent GB format (no decimals)
  return `${Math.round(gbValue)} GB`;
};
