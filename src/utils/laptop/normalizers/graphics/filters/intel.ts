
import { extractModelNumber } from './common';

/**
 * Intel-specific filter value extraction
 */
export const getIntelFilterValue = (normalized: string): string | null => {
  // Intel Arc discrete GPUs
  if (/\barc\s*a(\d+)/i.test(normalized)) {
    const model = extractModelNumber(normalized, /\barc\s*a(\d+)/i);
    if (model) return `Intel Arc A${model}`;
  }
  
  // Both Intel Iris Xe and regular Iris - combine into single category
  if (/iris\s*xe\s*graphics/i.test(normalized) || 
      /iris\s*graphics/i.test(normalized)) {
    return 'Intel Iris Graphics';
  }
  
  // Intel Iris Plus/Pro
  if (/iris\s*(plus|pro)/i.test(normalized)) {
    return 'Intel Iris Plus Graphics';
  }
  
  // Intel UHD Graphics with number
  if (/uhd\s*graphics\s*(\d+)/i.test(normalized)) {
    const model = extractModelNumber(normalized, /uhd\s*graphics\s*(\d+)/i);
    if (model) {
      if (model.match(/^6\d\d$/)) return 'Intel UHD Graphics 600 Series';
      if (model.match(/^7\d\d$/)) return 'Intel UHD Graphics 700 Series';
      return `Intel UHD Graphics ${model}`;
    }
    return 'Intel UHD Graphics';
  }
  
  // Intel HD Graphics with number
  if (/hd\s*graphics\s*(\d+)/i.test(normalized)) {
    const model = extractModelNumber(normalized, /hd\s*graphics\s*(\d+)/i);
    if (model) {
      if (model.match(/^5\d\d$/)) return 'Intel HD Graphics 500 Series';
      if (model.match(/^4\d\d$/)) return 'Intel HD Graphics 400 Series';
      if (model.match(/^3\d\d$/)) return 'Intel HD Graphics 300 Series';
      if (model.match(/^2\d\d$/)) return 'Intel HD Graphics 200 Series';
      return `Intel HD Graphics ${model}`;
    }
    return 'Intel HD Graphics';
  }
  
  // General Intel HD Graphics (without specific model)
  if (/hd\s*graphics/i.test(normalized)) {
    return 'Intel HD Graphics';
  }
  
  // Generic Intel
  if (normalized.includes('intel')) {
    return 'Intel Graphics';
  }
  
  return null;
};
