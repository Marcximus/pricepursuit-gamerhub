
import { parseValueWithUnit } from './commonMatchers';

/**
 * Parses RAM value from string to number in GB
 */
export const parseRamValue = (value: string | null | undefined): number => {
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
 * Checks if a RAM filter value matches a product RAM value
 */
export const matchesRamFilter = (filterValue: string, productValue: string): boolean => {
  const productRamGB = parseRamValue(productValue);
  const filterRamGB = parseRamValue(filterValue);
  
  // Enforce realistic RAM values and stricter matching
  if (productRamGB < 2 || filterRamGB < 2) return false;
  
  // Exact match with minimal tolerance (0.1 GB)
  return Math.abs(productRamGB - filterRamGB) < 0.1;
};
