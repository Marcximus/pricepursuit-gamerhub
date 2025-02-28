
import { parseValueWithUnit } from './commonMatchers';

/**
 * Parses storage value from string to number in GB
 */
export const parseStorageValue = (value: string | null | undefined): number => {
  if (!value) return 0;
  const parsed = parseValueWithUnit(value);
  if (!parsed) return 0;
  
  const { value: numValue, unit } = parsed;
  
  switch (unit) {
    case 'tb': return numValue * 1024;
    case 'mb': return numValue / 1024;
    case 'gb': return numValue;
    default: return 0;
  }
};

/**
 * Checks if a storage filter value matches a product storage value
 */
export const matchesStorageFilter = (filterValue: string, productValue: string): boolean => {
  const productStorageGB = parseStorageValue(productValue);
  const filterStorageGB = parseStorageValue(filterValue);
  
  // Enforce realistic storage values and stricter matching
  if (productStorageGB < 128 || filterStorageGB < 128) return false;
  
  // More precise matching for storage sizes (within 0.5GB)
  return Math.abs(productStorageGB - filterStorageGB) < 0.5;
};
