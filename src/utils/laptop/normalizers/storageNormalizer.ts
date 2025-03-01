
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
  
  // Standardize to specific storage groups with space between number and unit
  if (gbValue >= 8192) {
    return '8 TB+';
  } else if (gbValue >= 4096) {
    return '4 TB+';
  } else if (gbValue >= 2048) {
    return '2 TB+';
  } else if (gbValue >= 1024) {
    return '1 TB+';
  } else if (gbValue >= 500) {
    return '500 GB+';
  } else if (gbValue >= 200) {
    return '200 GB+';
  } else {
    return '100 GB+';
  }
};
