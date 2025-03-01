
import { getStorageValue } from '../valueParser';

/**
 * Normalizes storage strings for consistent display and grouping
 */
export const normalizeStorage = (storage: string): string => {
  if (!storage) return '';
  
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Filter out invalid or unrealistic storage values (less than 100GB for modern laptops)
  if (gbValue < 100) {
    return '';
  }
  
  // Standardize to specific storage groups
  if (gbValue >= 8192) {
    return '8TB+';
  } else if (gbValue >= 4096) {
    return '4TB+';
  } else if (gbValue >= 2048) {
    return '2TB+';
  } else if (gbValue >= 1024) {
    return '1TB+';
  } else if (gbValue >= 500) {
    return '500GB+';
  } else if (gbValue >= 200) {
    return '200GB+';
  } else {
    return '100GB+';
  }
};
