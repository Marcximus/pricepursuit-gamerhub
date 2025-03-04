
// Re-export all comparison functions from the new categorized files
export * from './comparisons';

/**
 * Determine the status of a comparison between two values
 */
export const getComparisonStatus = (
  leftValue: string, 
  rightValue: string, 
  compareFunction?: (a: string, b: string) => 'better' | 'worse' | 'equal' | 'unknown'
): { leftStatus: 'better' | 'worse' | 'equal' | 'unknown', rightStatus: 'better' | 'worse' | 'equal' | 'unknown' } => {
  // Default to equal if no compare function provided
  let leftStatus: 'better' | 'worse' | 'equal' | 'unknown' = 'equal';
  let rightStatus: 'better' | 'worse' | 'equal' | 'unknown' = 'equal';
  
  if (compareFunction) {
    const result = compareFunction(leftValue, rightValue);
    leftStatus = result;
    rightStatus = result === 'better' ? 'worse' : result === 'worse' ? 'better' : result;
  }
  
  return { leftStatus, rightStatus };
};
