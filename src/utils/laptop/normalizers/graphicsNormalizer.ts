
import { getGraphicsValue } from '../hardwareScoring';

/**
 * Normalizes graphics card strings for consistent display
 */
export const normalizeGraphics = (graphics: string): string => {
  if (!graphics) return '';
  
  // Clean up common inconsistencies
  let normalized = graphics
    .replace(/\s+/g, ' ')
    .replace(/Graphics\s+Card:?/i, '')
    .replace(/Integrated\s+Graphics:?/i, '')
    .replace(/GPU:?/i, '')
    .trim();
  
  // Filter out invalid or nonsensical graphics card descriptions
  if (normalized.length < 3 || 
      normalized.includes('32-core') ||
      normalized === 'integrated' ||
      normalized === 'dedicated' ||
      normalized.includes('undefined') ||
      normalized.includes('N/A')) {
    return '';
  }
  
  // Remove other component specs that got mixed in with the graphics card
  normalized = normalized
    .replace(/(\d+\s*GB\s*(RAM|Memory|DDR\d*))/i, '')
    .replace(/(\d+\s*(GB|TB)\s*(SSD|HDD|Storage))/i, '')
    .replace(/(\d+(\.\d+)?\s*inch)/i, '')
    .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  // Standardize NVIDIA naming
  normalized = normalized
    .replace(/nvidia\s+geforce\s+rtx?/i, 'NVIDIA RTX')
    .replace(/nvidia\s+geforce\s+gtx?/i, 'NVIDIA GTX')
    .replace(/nvidia\s+rtx?/i, 'NVIDIA RTX')
    .replace(/nvidia\s+gtx?/i, 'NVIDIA GTX')
    .replace(/geforce\s+rtx?/i, 'NVIDIA RTX')
    .replace(/geforce\s+gtx?/i, 'NVIDIA GTX');
    
  // Standardize Intel naming
  normalized = normalized
    .replace(/intel(\s+iris)?(\s+xe)?\s+graphics/i, 'Intel Iris Xe Graphics')
    .replace(/intel\s+uhd\s+graphics/i, 'Intel UHD Graphics')
    .replace(/intel\s+hd\s+graphics/i, 'Intel HD Graphics');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+radeon/i, 'AMD Radeon')
    .replace(/radeon/i, 'AMD Radeon');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m1/i, 'Apple M1')
    .replace(/apple\s+m2/i, 'Apple M2')
    .replace(/apple\s+m3/i, 'Apple M3')
    .replace(/m1\s+gpu/i, 'Apple M1')
    .replace(/m2\s+gpu/i, 'Apple M2')
    .replace(/m3\s+gpu/i, 'Apple M3');
    
  return normalized;
};
