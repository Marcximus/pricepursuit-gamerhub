
/**
 * Normalizes graphics card strings for consistent display and filtering
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
  
  // Reject single brand names that don't include GPU info
  const justBrandPattern = /^(Apple|Asus|Dell|HP|Lenovo|MSI|Acer|Samsung|Microsoft)$/i;
  if (justBrandPattern.test(normalized)) {
    return '';
  }
  
  // Filter out invalid or nonsensical graphics card descriptions
  if (normalized.length < 3 || 
      normalized.includes('32-core') ||
      normalized === 'integrated' ||
      normalized === 'dedicated' ||
      normalized.includes('undefined') ||
      normalized.includes('N/A')) {
    return '';
  }
  
  // Split by known delimiters that often separate graphics info from other specs
  if (normalized.includes('Brand:') || 
      normalized.includes('Screen Size:') || 
      normalized.includes('Type:') ||
      normalized.includes('Memory:')) {
    // Keep only the part before these common delimiter phrases
    const parts = normalized.split(/Brand:|Screen Size:|Type:|Memory:|RAM|Hard Drive:/i);
    normalized = parts[0].trim();
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
    .replace(/nvidia\s+nvidia/i, 'NVIDIA') // Remove duplicated NVIDIA
    .replace(/nvidia\s+geforce\s+rtx\s*/i, 'NVIDIA RTX ')
    .replace(/nvidia\s+geforce\s+gtx\s*/i, 'NVIDIA GTX ')
    .replace(/geforce\s+rtx\s*/i, 'NVIDIA RTX ')
    .replace(/geforce\s+gtx\s*/i, 'NVIDIA GTX ')
    .replace(/nvidia\s+rtx\s*/i, 'NVIDIA RTX ')
    .replace(/nvidia\s+gtx\s*/i, 'NVIDIA GTX ')
    .replace(/\brtx\s+(\d{4})/i, 'NVIDIA RTX $1')
    .replace(/\bgtx\s+(\d{4})/i, 'NVIDIA GTX $1');
    
  // Standardize Intel naming
  normalized = normalized
    .replace(/intel\s+iris\s+xe\s+graphics/i, 'Intel Iris Xe Graphics')
    .replace(/intel\s+iris\s+graphics/i, 'Intel Iris Graphics')
    .replace(/intel\s+uhd\s+graphics/i, 'Intel UHD Graphics')
    .replace(/intel\s+hd\s+graphics/i, 'Intel HD Graphics')
    .replace(/\bIris\s+Xe\b/i, 'Intel Iris Xe Graphics')
    .replace(/\bUHD\s+Graphics\b/i, 'Intel UHD Graphics')
    .replace(/\bintel\s+arc\s+([a-z]\d{2,3})\b/i, 'Intel Arc $1');
    
  // Standardize AMD naming
  normalized = normalized
    .replace(/amd\s+radeon\s+graphics/i, 'AMD Radeon Graphics')
    .replace(/radeon\s+graphics/i, 'AMD Radeon Graphics')
    .replace(/\bradeon\s+rx\s+/i, 'AMD Radeon RX ')
    .replace(/\bradeon\s+/i, 'AMD Radeon ');
    
  // Apple naming
  normalized = normalized
    .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?(\s+gpu)?/i, 'Apple M$1$2 GPU')
    .replace(/m(\d)(\s+(pro|max|ultra))?\s+gpu/i, 'Apple M$1$2 GPU')
    .replace(/m(\d)(\s+(pro|max|ultra))?/i, 'Apple M$1$2 GPU');
    
  // Make sure spaces are normalized
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Get a simplified version of the graphics card for filtering purposes
 */
export const getGraphicsFilterValue = (graphics: string): string => {
  const normalized = normalizeGraphics(graphics).toLowerCase();
  
  // Reject overly long strings that likely contain mixed information
  if (normalized.length > 40) {
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
  
  // AMD discrete GPU categories
  if (normalized.includes('radeon rx 7')) return 'AMD Radeon RX 7000 Series';
  if (normalized.includes('radeon rx 6')) return 'AMD Radeon RX 6000 Series';
  if (normalized.includes('radeon rx')) return 'AMD Radeon RX';
  if (normalized.includes('radeon')) return 'AMD Radeon Graphics';
  
  // Intel integrated graphics categories
  if (normalized.includes('iris xe')) return 'Intel Iris Xe Graphics';
  if (normalized.includes('iris')) return 'Intel Iris Graphics';
  if (normalized.includes('uhd')) return 'Intel UHD Graphics';
  if (normalized.includes('hd graphics')) return 'Intel HD Graphics';
  if (normalized.includes('arc')) return 'Intel Arc';
  
  // Apple integrated graphics
  if (normalized.includes('m3')) return 'Apple M3 GPU';
  if (normalized.includes('m2')) return 'Apple M2 GPU';
  if (normalized.includes('m1')) return 'Apple M1 GPU';
  
  return normalized;
};
