
/**
 * Normalizes storage strings for consistent display and grouping
 */
import { getStorageValue } from '../parsers/storageParser';

export const normalizeStorage = (storage: string): string => {
  if (!storage) return '';
  
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Log normalizing process for debugging
  console.log(`Normalizing storage: "${storage}" -> ${gbValue} GB`);
  
  // Add sanity check for unrealistic storage values (laptops typically don't have 100+ TB storage)
  // This catches errors like "512 TB SSD" which should be "512 GB SSD"
  if (storage.toLowerCase().includes('tb') && gbValue > 100000) {
    console.warn(`Unrealistic storage value detected: "${storage}" (${gbValue} GB). Likely a typo in TB/GB.`);
    
    // Try to correct obviously wrong "TB" values that should be "GB"
    const correctedValue = gbValue / 1024; // Convert back to the original number before TB multiplication
    if (correctedValue >= 128 && correctedValue <= 2048) {
      console.log(`Auto-correcting storage from ${gbValue} GB to ${correctedValue} GB (TB → GB conversion)`);
      return normalizeStorage(storage.replace(/TB/i, 'GB'));
    }
    
    return '';
  }
  
  // Filter out invalid or unrealistic storage values
  if (gbValue <= 0) {
    return '';
  }
  
  // Ensure 100 GB+ is included by lowering the threshold
  // Modern laptops typically start at 128 GB, which should be captured
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
  } else if (gbValue >= 100) {
    // This captures values from 100 to 199
    return '100 GB+';
  } else if (gbValue >= 80) {
    // Lower threshold to catch potential legacy/older laptop storage values
    // between 80-99 GB that might be rounded to 100 GB in marketing
    return '100 GB+';
  }
  
  // For very low values, we'll filter them out as they're likely errors
  return '';
};
