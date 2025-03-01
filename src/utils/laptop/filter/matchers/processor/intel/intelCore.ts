
import { matchesIntelCoreUltra } from './intelCoreUltra';
import { matchesIntelCoreWithGeneration } from './intelCoreI';
import { matchesIntelCeleron, matchesIntelPentium } from './intelBudget';

/**
 * Intel processor matcher (Core i-series, Core Ultra, Celeron, Pentium)
 */
export const matchesIntelProcessor = (
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean => {
  if (!productValue && !productTitle) return false;
  
  // Match Intel Core Ultra series
  if (filterValue.startsWith('Intel Core Ultra')) {
    return matchesIntelCoreUltra(filterValue, productValue, productTitle);
  }
  
  // Match Intel Core i-series with specific generation info
  if (filterValue.includes('Intel Core i') && filterValue.includes('Gen')) {
    return matchesIntelCoreWithGeneration(filterValue, productValue, productTitle);
  }
  
  // Match Intel Celeron
  if (filterValue === 'Intel Celeron') {
    return matchesIntelCeleron(productValue, productTitle);
  }
  
  // Match Intel Pentium
  if (filterValue === 'Intel Pentium') {
    return matchesIntelPentium(productValue, productTitle);
  }
  
  return false;
};
