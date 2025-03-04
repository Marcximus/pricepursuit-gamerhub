
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
  
  // Reject overly long strings that likely contain mixed information
  if (normalized.length > 50) {
    // Try to extract just the main parts
    const parts = normalized.split(/\s+/);
    if (parts.length > 5) {
      // Take just the first 5 meaningful parts
      return parts.slice(0, 5).join(' ');
    }
  }
  
  // NVIDIA discrete GPU categories
  if (normalized.includes('rtx 40')) return 'NVIDIA RTX 40 Series';
  if (normalized.includes('rtx 30')) return 'NVIDIA RTX 30 Series';
  if (normalized.includes('rtx 20')) return 'NVIDIA RTX 20 Series';
  if (normalized.includes('rtx')) return 'NVIDIA RTX';
  if (normalized.includes('gtx 16')) return 'NVIDIA GTX 16 Series';
  if (normalized.includes('gtx 10')) return 'NVIDIA GTX 10 Series';
  if (normalized.includes('gtx')) return 'NVIDIA GTX';
  if (normalized.includes('mx')) return 'NVIDIA MX Series';
  
  // AMD discrete GPU categories
  if (normalized.includes('radeon rx 7')) return 'AMD Radeon RX 7000 Series';
  if (normalized.includes('radeon rx 6')) return 'AMD Radeon RX 6000 Series';
  if (normalized.includes('radeon rx 5')) return 'AMD Radeon RX 5000 Series';
  if (normalized.includes('radeon rx') && /rx\s*[45]\d\d/i.test(normalized)) return 'AMD Radeon RX 500/400 Series';
  if (normalized.includes('radeon rx')) return 'AMD Radeon RX';
  if (normalized.includes('vega')) return 'AMD Radeon Vega';
  if (normalized.includes('radeon')) return 'AMD Radeon Graphics';
  
  // Intel integrated/discrete graphics categories
  if (normalized.includes('arc')) return 'Intel Arc';
  if (normalized.includes('iris xe')) return 'Intel Iris Xe Graphics';
  if (normalized.includes('iris')) return 'Intel Iris Graphics';
  if (normalized.includes('uhd')) return 'Intel UHD Graphics';
  if (normalized.includes('hd graphics')) return 'Intel HD Graphics';
  
  // Apple integrated graphics
  if (normalized.includes('m3')) {
    if (normalized.includes('ultra')) return 'Apple M3 Ultra GPU';
    if (normalized.includes('max')) return 'Apple M3 Max GPU';
    if (normalized.includes('pro')) return 'Apple M3 Pro GPU';
    return 'Apple M3 GPU';
  }
  if (normalized.includes('m2')) {
    if (normalized.includes('ultra')) return 'Apple M2 Ultra GPU';
    if (normalized.includes('max')) return 'Apple M2 Max GPU';
    if (normalized.includes('pro')) return 'Apple M2 Pro GPU';
    return 'Apple M2 GPU';
  }
  if (normalized.includes('m1')) {
    if (normalized.includes('ultra')) return 'Apple M1 Ultra GPU';
    if (normalized.includes('max')) return 'Apple M1 Max GPU';
    if (normalized.includes('pro')) return 'Apple M1 Pro GPU';
    return 'Apple M1 GPU';
  }
  
  // Generic categories
  if (normalized.includes('dedicated') || normalized.includes('discrete')) {
    return 'Dedicated GPU';
  }
  
  return normalized;
};
