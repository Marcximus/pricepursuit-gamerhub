
/**
 * Generic graphics filter value extraction
 */
export const getGenericFilterValue = (normalized: string): string | null => {
  if (normalized.includes('integrated')) {
    return 'Integrated Graphics';
  }
  
  if (normalized.includes('dedicated')) {
    return 'Dedicated Graphics';
  }
  
  return normalized;
};
