
/**
 * Normalize NVIDIA graphics card information
 */
import { GRAPHICS_PATTERNS } from './constants';

export const normalizeNvidiaGraphics = (normalizedString: string): string | null => {
  const productLower = normalizedString.toLowerCase();
  
  if (!GRAPHICS_PATTERNS.NVIDIA.PREFIX.test(productLower) && 
      !GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES.test(productLower) && 
      !GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES_SHORT.test(productLower) && 
      !GRAPHICS_PATTERNS.NVIDIA.GTX_SERIES.test(productLower) &&
      !GRAPHICS_PATTERNS.NVIDIA.MX_SERIES.test(productLower)) {
    return null;
  }
  
  // Extract VRAM information if present
  let vramInfo = '';
  const vramMatch = normalizedString.match(/(\d+)\s*GB(?:\s+GDDR\d+)?/i);
  if (vramMatch) {
    vramInfo = ` ${vramMatch[0]}`;
  }
  
  // Check for Max-Q variant
  const hasMaxQ = GRAPHICS_PATTERNS.NVIDIA.MAX_Q.test(normalizedString);
  
  // Standardize RTX series with 4-digit model numbers
  const rtxMatch = normalizedString.match(GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES);
  if (rtxMatch) {
    let gpuModel = rtxMatch[1].toUpperCase().replace(/\s+/g, ' ');
    
    // Create standardized RTX naming
    return `NVIDIA RTX ${gpuModel}${hasMaxQ ? ' Max-Q' : ''}${vramInfo}`;
  }
  
  // Handle RTX series with shortened model numbers (e.g., RTX 30 60 -> RTX 3060)
  const rtxShortMatch = normalizedString.match(GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES_SHORT);
  if (rtxShortMatch) {
    let gpuSeries = rtxShortMatch[1];
    let gpuModel = rtxShortMatch[2];
    
    // Create standardized RTX naming with combined model number
    return `NVIDIA RTX ${gpuSeries}${gpuModel}${hasMaxQ ? ' Max-Q' : ''}${vramInfo}`;
  }
  
  // Standardize GTX series
  const gtxMatch = normalizedString.match(GRAPHICS_PATTERNS.NVIDIA.GTX_SERIES);
  if (gtxMatch) {
    let gpuModel = gtxMatch[1].toUpperCase().replace(/\s+/g, ' ');
    
    // Create standardized GTX naming
    return `NVIDIA GTX ${gpuModel}${hasMaxQ ? ' Max-Q' : ''}${vramInfo}`;
  }
  
  // Standardize MX series (entry-level dedicated)
  const mxMatch = normalizedString.match(GRAPHICS_PATTERNS.NVIDIA.MX_SERIES);
  if (mxMatch) {
    let gpuModel = mxMatch[1].toUpperCase().replace(/\s+/g, ' ');
    
    // Create standardized MX naming
    return `NVIDIA MX ${gpuModel}${vramInfo}`;
  }
  
  // Handle generic NVIDIA mentions with additional cleaning
  let result = normalizedString
    .replace(/nvidia\s+nvidia/i, 'NVIDIA') // Remove duplicated NVIDIA
    .replace(/nvidia\s+geforce\s+rtx\s*/i, 'NVIDIA RTX ')
    .replace(/nvidia\s+geforce\s+gtx\s*/i, 'NVIDIA GTX ')
    .replace(/geforce\s+rtx\s*/i, 'NVIDIA RTX ')
    .replace(/geforce\s+gtx\s*/i, 'NVIDIA GTX ')
    .replace(/\brtx\s+(\d{4})/i, 'NVIDIA RTX $1')
    .replace(/\bgtx\s+(\d{3,4})/i, 'NVIDIA GTX $1');
    
  // If we still just have "NVIDIA" without model, try to be more specific
  if (/^nvidia$/i.test(result)) {
    return 'NVIDIA Graphics';
  }
  
  return result;
};
