
import { getStorageValue } from '../valueParser';

/**
 * Normalizes storage strings for consistent display
 */
export const normalizeStorage = (storage: string): string => {
  if (!storage) return '';
  
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Filter out invalid or unrealistic storage values (less than 128GB for modern laptops)
  if (gbValue < 128) {
    return '';
  }
  
  // Convert to TB if ≥ 1000 GB
  if (gbValue >= 1000) {
    const tbValue = gbValue / 1024;
    return `${tbValue.toFixed(tbValue % 1 === 0 ? 0 : 1)} TB`;
  }
  
  return `${Math.round(gbValue)} GB`;
};
