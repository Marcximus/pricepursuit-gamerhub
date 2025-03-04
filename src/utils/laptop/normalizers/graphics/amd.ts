
/**
 * Normalize AMD graphics card information
 */
import { GRAPHICS_PATTERNS } from './constants';

export const normalizeAmdGraphics = (normalizedString: string): string | null => {
  const productLower = normalizedString.toLowerCase();
  
  if (!GRAPHICS_PATTERNS.AMD.PREFIX.test(productLower) && 
      !GRAPHICS_PATTERNS.AMD.RX_SERIES.test(productLower) &&
      !GRAPHICS_PATTERNS.AMD.VEGA_SERIES.test(productLower)) {
    return null;
  }

  // Extract VRAM information if present
  let vramInfo = '';
  const vramMatch = normalizedString.match(/(\d+)\s*GB(?:\s+GDDR\d+)?/i);
  if (vramMatch) {
    vramInfo = ` ${vramMatch[0]}`;
  }
  
  // Handle Vega series
  const vegaMatch = normalizedString.match(GRAPHICS_PATTERNS.AMD.VEGA_SERIES);
  if (vegaMatch) {
    const vegaModel = vegaMatch[1] ? vegaMatch[1] : '';
    return `AMD Radeon Vega${vegaModel ? ' ' + vegaModel : ''}${vramInfo} Graphics`;
  }
  
  // Standardize RX series
  const rxMatch = normalizedString.match(GRAPHICS_PATTERNS.AMD.RX_SERIES);
  if (rxMatch) {
    let rxModel = rxMatch[1].toUpperCase();
    
    // Detect series by model number length
    if (rxModel.length === 4) {
      // Modern series (e.g., 5700, 6800)
      return `AMD Radeon RX ${rxModel}${vramInfo}`;
    } else {
      // Older series (e.g., 580, 570)
      return `AMD Radeon RX ${rxModel}${vramInfo}`;
    }
  }
  
  // Standardize other AMD graphics
  let result = normalizedString
    .replace(/amd\s+radeon\s+graphics/i, 'AMD Radeon Graphics')
    .replace(/radeon\s+graphics/i, 'AMD Radeon Graphics')
    .replace(/\bradeon\s+rx\s+/i, 'AMD Radeon RX ')
    .replace(/\bradeon\s+/i, 'AMD Radeon ');
  
  // Ensure AMD prefix is present
  if (!result.toLowerCase().includes('amd')) {
    result = `AMD ${result}`;
  }
  
  // Add "Graphics" suffix if missing
  if (!result.toLowerCase().includes('graphics')) {
    result += ' Graphics';
  }
  
  return result;
};
