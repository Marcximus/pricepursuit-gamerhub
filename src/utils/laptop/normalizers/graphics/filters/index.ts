
import { getNvidiaFilterValue } from './nvidia';
import { getAmdFilterValue } from './amd';
import { getIntelFilterValue } from './intel';
import { getAppleFilterValue } from './apple';
import { getGenericFilterValue } from './generic';

/**
 * Get a simplified version of the graphics card for filtering purposes
 * This creates broader categories for effective filtering
 */
export const getGraphicsFilterValue = (graphics: string): string => {
  if (!graphics) return '';
  
  const normalized = graphics.toLowerCase();
  
  // Try each manufacturer's filter in order of likelihood
  return getNvidiaFilterValue(normalized) || 
         getAmdFilterValue(normalized) || 
         getIntelFilterValue(normalized) || 
         getAppleFilterValue(normalized) || 
         getGenericFilterValue(normalized) || 
         normalized;
};

// Re-export for backwards compatibility
export * from './common';
