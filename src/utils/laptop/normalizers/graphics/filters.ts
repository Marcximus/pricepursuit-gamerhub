
/**
 * Functions for creating and matching against simplified filter categories
 */

/**
 * Get a simplified version of the graphics card for filtering purposes
 * This creates broader categories for effective filtering
 */
export const getGraphicsFilterValue = (graphics: string): string => {
  const normalized = graphics.toLowerCase();
  if (!normalized) return '';
  
  // NVIDIA RTX Series - Group by model number
  if (/\brtx\s*40\d0/i.test(normalized)) {
    const model = normalized.match(/\brtx\s*(40\d0)/i);
    if (model) return `NVIDIA RTX ${model[1]}`;
  }
  
  if (/\brtx\s*30\d0/i.test(normalized)) {
    const model = normalized.match(/\brtx\s*(30\d0)/i);
    if (model) return `NVIDIA RTX ${model[1]}`;
  }
  
  if (/\brtx\s*20\d0/i.test(normalized)) {
    const model = normalized.match(/\brtx\s*(20\d0)/i);
    if (model) return `NVIDIA RTX ${model[1]}`;
  }
  
  // NVIDIA GTX Series
  if (/\bgtx\s*16\d0/i.test(normalized)) {
    const model = normalized.match(/\bgtx\s*(16\d0)/i);
    if (model) return `NVIDIA GTX ${model[1]}`;
  }
  
  if (/\bgtx\s*10\d0/i.test(normalized)) {
    const model = normalized.match(/\bgtx\s*(10\d0)/i);
    if (model) return `NVIDIA GTX ${model[1]}`;
  }
  
  // NVIDIA MX Series
  if (/\bmx\s*\d{3}/i.test(normalized)) {
    const model = normalized.match(/\bmx\s*(\d{3})/i);
    if (model) return `NVIDIA MX ${model[1]}`;
  }
  
  // AMD Radeon RX Series
  if (/radeon\s*rx\s*7\d00/i.test(normalized)) {
    const model = normalized.match(/radeon\s*rx\s*(7\d00)/i);
    if (model) return `AMD Radeon RX ${model[1]}`;
  }
  
  if (/radeon\s*rx\s*6\d00/i.test(normalized)) {
    const model = normalized.match(/radeon\s*rx\s*(6\d00)/i);
    if (model) return `AMD Radeon RX ${model[1]}`;
  }
  
  if (/radeon\s*rx\s*5\d00/i.test(normalized)) {
    const model = normalized.match(/radeon\s*rx\s*(5\d00)/i);
    if (model) return `AMD Radeon RX ${model[1]}`;
  }
  
  // AMD Vega Series
  if (/vega/i.test(normalized)) {
    return 'AMD Radeon Vega';
  }
  
  // Intel Graphics
  if (/\barc\s*a(\d+)/i.test(normalized)) {
    const model = normalized.match(/\barc\s*a(\d+)/i);
    if (model) return `Intel Arc A${model[1]}`;
  }
  
  if (/iris\s*xe/i.test(normalized)) {
    return 'Intel Iris Xe Graphics';
  }
  
  if (/iris/i.test(normalized)) {
    return 'Intel Iris Graphics';
  }
  
  if (/uhd/i.test(normalized)) {
    return 'Intel UHD Graphics';
  }
  
  if (/hd\s*graphics/i.test(normalized)) {
    return 'Intel HD Graphics';
  }
  
  // Apple Silicon
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
  
  // Generic categories
  if (normalized.includes('nvidia') && normalized.includes('rtx')) {
    return 'NVIDIA RTX Graphics';
  }
  
  if (normalized.includes('nvidia') && normalized.includes('gtx')) {
    return 'NVIDIA GTX Graphics';
  }
  
  if (normalized.includes('nvidia')) {
    return 'NVIDIA Graphics';
  }
  
  if (normalized.includes('amd') || normalized.includes('radeon')) {
    return 'AMD Radeon Graphics';
  }
  
  if (normalized.includes('intel')) {
    return 'Intel Graphics';
  }
  
  if (normalized.includes('apple')) {
    return 'Apple Graphics';
  }
  
  if (normalized.includes('integrated')) {
    return 'Integrated Graphics';
  }
  
  if (normalized.includes('dedicated')) {
    return 'Dedicated Graphics';
  }
  
  // Return the original normalized value if no pattern matches
  return normalized;
};
