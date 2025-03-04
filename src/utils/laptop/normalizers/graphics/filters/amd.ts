
import { extractModelNumber } from './common';

/**
 * AMD-specific filter value extraction
 */
export const getAmdFilterValue = (normalized: string): string | null => {
  // AMD Radeon RX Series
  if (/radeon\s*rx\s*7\d00/i.test(normalized)) {
    const model = extractModelNumber(normalized, /radeon\s*rx\s*(7\d00)/i);
    if (model) return `AMD Radeon RX ${model}`;
  }
  
  if (/radeon\s*rx\s*6\d00/i.test(normalized)) {
    const model = extractModelNumber(normalized, /radeon\s*rx\s*(6\d00)/i);
    if (model) return `AMD Radeon RX ${model}`;
  }
  
  if (/radeon\s*rx\s*5\d00/i.test(normalized)) {
    const model = extractModelNumber(normalized, /radeon\s*rx\s*(5\d00)/i);
    if (model) return `AMD Radeon RX ${model}`;
  }
  
  // AMD Vega Series
  if (/vega/i.test(normalized)) {
    return 'AMD Radeon Vega';
  }
  
  // Generic AMD
  if (normalized.includes('amd') || normalized.includes('radeon')) {
    return 'AMD Radeon Graphics';
  }
  
  return null;
};
