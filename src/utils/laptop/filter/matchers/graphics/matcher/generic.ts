
/**
 * Generic basic GPU matching for non-specific matches
 */
import { sharesBrandTerm, containsAllFilterWords } from '../core';

export const matchesGenericGPU = (
  filterLower: string,
  productLower: string
): boolean => {
  // Check for generic GPU terms
  if (filterLower === 'nvidia' && productLower.includes('nvidia')) {
    return true;
  }
  
  if (filterLower === 'amd' && productLower.includes('amd')) {
    return true;
  }
  
  if (filterLower === 'intel' && productLower.includes('intel')) {
    return true;
  }
  
  // If it shares a brand term and all filter words are in the product
  return sharesBrandTerm(filterLower, productLower) && 
         containsAllFilterWords(filterLower, productLower);
};
