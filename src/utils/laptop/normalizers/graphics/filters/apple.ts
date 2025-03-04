
/**
 * Apple-specific filter value extraction
 */
export const getAppleFilterValue = (normalized: string): string | null => {
  // Apple Silicon M3 series
  if (/m3\s*ultra/i.test(normalized)) {
    return 'Apple M3 Ultra GPU';
  }
  
  if (/m3\s*max/i.test(normalized)) {
    return 'Apple M3 Max GPU';
  }
  
  if (/m3\s*pro/i.test(normalized)) {
    return 'Apple M3 Pro GPU';
  }
  
  if (/m3/i.test(normalized)) {
    return 'Apple M3 GPU';
  }
  
  // Apple Silicon M2 series
  if (/m2\s*ultra/i.test(normalized)) {
    return 'Apple M2 Ultra GPU';
  }
  
  if (/m2\s*max/i.test(normalized)) {
    return 'Apple M2 Max GPU';
  }
  
  if (/m2\s*pro/i.test(normalized)) {
    return 'Apple M2 Pro GPU';
  }
  
  if (/m2/i.test(normalized)) {
    return 'Apple M2 GPU';
  }
  
  // Apple Silicon M1 series
  if (/m1\s*ultra/i.test(normalized)) {
    return 'Apple M1 Ultra GPU';
  }
  
  if (/m1\s*max/i.test(normalized)) {
    return 'Apple M1 Max GPU';
  }
  
  if (/m1\s*pro/i.test(normalized)) {
    return 'Apple M1 Pro GPU';
  }
  
  if (/m1/i.test(normalized)) {
    return 'Apple M1 GPU';
  }
  
  // Generic Apple
  if (normalized.includes('apple')) {
    return 'Apple Graphics';
  }
  
  return null;
};
