/**
 * Advanced module for normalizing and standardizing graphics card information
 * This improves filtering accuracy and display consistency
 */

// Common brand and GPU family patterns 
const GRAPHICS_PATTERNS = {
  NVIDIA: {
    PREFIX: /\b(?:nvidia|geforce)\b/i,
    RTX_SERIES: /\brtx\s*(\d{4}(?:\s*ti|\s*super)?)\b/i,
    GTX_SERIES: /\bgtx\s*(\d{3,4}(?:\s*ti|\s*super)?)\b/i,
    MAX_Q: /\bmax-?q\b/i
  },
  AMD: {
    PREFIX: /\b(?:amd|radeon)\b/i,
    RX_SERIES: /\bradeon\s*(?:rx\s*)?(\d{3,4}(?:\s*xt)?)\b/i
  },
  INTEL: {
    PREFIX: /\bintel\b/i,
    ARC_SERIES: /\barc\s*([a-z]\d{2,3})\b/i,
    IRIS_XE: /\biris\s*xe\b/i,
    IRIS: /\biris\b/i,
    UHD: /\buhd\b/i,
    HD: /\bhd\s*graphics\b/i
  },
  APPLE: {
    PREFIX: /\b(?:apple|m[123])\b/i,
    M_SERIES: /\bm([123])(?:\s*(pro|max|ultra))?\b/i
  }
};

// Invalid or too generic values to be rejected
const INVALID_GRAPHICS = [
  /^integrated$/i,
  /^dedicated$/i,
  /^gpu$/i,
  /^graphics$/i,
  /^graphics\s+card$/i,
  /^video\s+card$/i,
  /^32-core$/i,
  /^undefined$/i,
  /^n\/a$/i
];

// Brand names that shouldn't be used as standalone GPU identifiers
const STANDALONE_BRANDS = [
  /^apple$/i,
  /^asus$/i,
  /^dell$/i,
  /^hp$/i,
  /^lenovo$/i,
  /^msi$/i,
  /^acer$/i,
  /^samsung$/i,
  /^microsoft$/i,
  /^toshiba$/i,
  /^lg$/i,
  /^huawei$/i,
  /^razer$/i,
  /^alienware$/i
];

/**
 * Normalizes graphics card strings for consistent display and filtering
 */
export const normalizeGraphics = (graphics: string): string => {
  if (!graphics) return '';
  
  // Clean up common inconsistencies
  let normalized = graphics
    .replace(/\s+/g, ' ')               // Normalize multiple spaces
    .replace(/graphics\s+card:?/i, '')  // Remove "Graphics Card:" prefix
    .replace(/integrated\s+graphics:?/i, '') // Remove "Integrated Graphics:" prefix
    .replace(/gpu:?/i, '')              // Remove "GPU:" prefix
    .replace(/video:?/i, '')            // Remove "Video:" prefix
    .trim();
  
  // Skip processing if input is too short or invalid
  if (normalized.length < 3) return '';
  
  // Reject standalone brand names or invalid entries
  if (STANDALONE_BRANDS.some(pattern => pattern.test(normalized)) || 
      INVALID_GRAPHICS.some(pattern => pattern.test(normalized))) {
    return '';
  }
  
  // Extract just the graphics card info if mixed with other specs
  if (normalized.includes('Brand:') || 
      normalized.includes('Screen Size:') || 
      normalized.includes('Type:') ||
      normalized.includes('Memory:') ||
      normalized.includes('Storage:')) {
    // Keep only the part before these common delimiter phrases
    const parts = normalized.split(/Brand:|Screen Size:|Type:|Memory:|RAM|Hard Drive|Storage:/i);
    normalized = parts[0].trim();
  }
  
  // Remove other component specs that often get mixed with graphics info
  normalized = normalized
    .replace(/(\d+)\s*GB\s*(?:RAM|Memory|DDR\d*)/i, '')
    .replace(/(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|Storage)/i, '')
    .replace(/(\d+(?:\.\d+)?)\s*inch/i, '')
    .replace(/\b(?:USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
    .replace(/\b(?:Touchscreen|Backlit|Keyboard)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Process NVIDIA graphics
  if (GRAPHICS_PATTERNS.NVIDIA.PREFIX.test(normalized) || 
      GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES.test(normalized) || 
      GRAPHICS_PATTERNS.NVIDIA.GTX_SERIES.test(normalized)) {
    
    // Standardize RTX series
    const rtxMatch = normalized.match(GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES);
    if (rtxMatch) {
      let gpuModel = rtxMatch[1].toUpperCase().replace(/\s+/g, ' ');
      const hasMaxQ = GRAPHICS_PATTERNS.NVIDIA.MAX_Q.test(normalized);
      
      // Create standardized RTX naming
      normalized = `NVIDIA RTX ${gpuModel}${hasMaxQ ? ' Max-Q' : ''}`;
      return normalized;
    }
    
    // Standardize GTX series
    const gtxMatch = normalized.match(GRAPHICS_PATTERNS.NVIDIA.GTX_SERIES);
    if (gtxMatch) {
      let gpuModel = gtxMatch[1].toUpperCase().replace(/\s+/g, ' ');
      const hasMaxQ = GRAPHICS_PATTERNS.NVIDIA.MAX_Q.test(normalized);
      
      // Create standardized GTX naming
      normalized = `NVIDIA GTX ${gpuModel}${hasMaxQ ? ' Max-Q' : ''}`;
      return normalized;
    }
    
    // Handle generic NVIDIA mentions with additional cleaning
    normalized = normalized
      .replace(/nvidia\s+nvidia/i, 'NVIDIA') // Remove duplicated NVIDIA
      .replace(/nvidia\s+geforce\s+rtx\s*/i, 'NVIDIA RTX ')
      .replace(/nvidia\s+geforce\s+gtx\s*/i, 'NVIDIA GTX ')
      .replace(/geforce\s+rtx\s*/i, 'NVIDIA RTX ')
      .replace(/geforce\s+gtx\s*/i, 'NVIDIA GTX ')
      .replace(/\brtx\s+(\d{4})/i, 'NVIDIA RTX $1')
      .replace(/\bgtx\s+(\d{4})/i, 'NVIDIA GTX $1');
  }
  
  // Process Intel graphics
  else if (GRAPHICS_PATTERNS.INTEL.PREFIX.test(normalized) || 
          GRAPHICS_PATTERNS.INTEL.IRIS_XE.test(normalized) || 
          GRAPHICS_PATTERNS.INTEL.UHD.test(normalized) || 
          GRAPHICS_PATTERNS.INTEL.HD.test(normalized)) {
    
    // Handle Arc series
    const arcMatch = normalized.match(GRAPHICS_PATTERNS.INTEL.ARC_SERIES);
    if (arcMatch) {
      return `Intel Arc ${arcMatch[1].toUpperCase()}`;
    }
    
    // Standardize other Intel graphics
    normalized = normalized
      .replace(/intel\s+iris\s+xe\s+graphics/i, 'Intel Iris Xe Graphics')
      .replace(/intel\s+iris\s+graphics/i, 'Intel Iris Graphics')
      .replace(/intel\s+uhd\s+graphics/i, 'Intel UHD Graphics')
      .replace(/intel\s+hd\s+graphics/i, 'Intel HD Graphics')
      .replace(/\bIris\s+Xe\b/i, 'Intel Iris Xe Graphics')
      .replace(/\bUHD\s+Graphics\b/i, 'Intel UHD Graphics')
      .replace(/\bHD\s+Graphics\b/i, 'Intel HD Graphics');
    
    // Ensure Intel prefix is present
    if (!normalized.toLowerCase().includes('intel')) {
      normalized = `Intel ${normalized}`;
    }
    
    // Add "Graphics" suffix if missing
    if (!normalized.toLowerCase().includes('graphics')) {
      normalized += ' Graphics';
    }
    
    return normalized;
  }
  
  // Process AMD graphics
  else if (GRAPHICS_PATTERNS.AMD.PREFIX.test(normalized) || 
          GRAPHICS_PATTERNS.AMD.RX_SERIES.test(normalized)) {
    
    // Standardize RX series
    const rxMatch = normalized.match(GRAPHICS_PATTERNS.AMD.RX_SERIES);
    if (rxMatch) {
      return `AMD Radeon RX ${rxMatch[1].toUpperCase()}`;
    }
    
    // Standardize other AMD graphics
    normalized = normalized
      .replace(/amd\s+radeon\s+graphics/i, 'AMD Radeon Graphics')
      .replace(/radeon\s+graphics/i, 'AMD Radeon Graphics')
      .replace(/\bradeon\s+rx\s+/i, 'AMD Radeon RX ')
      .replace(/\bradeon\s+/i, 'AMD Radeon ');
    
    // Ensure AMD prefix is present
    if (!normalized.toLowerCase().includes('amd')) {
      normalized = `AMD ${normalized}`;
    }
    
    // Add "Graphics" suffix if missing
    if (!normalized.toLowerCase().includes('graphics')) {
      normalized += ' Graphics';
    }
    
    return normalized;
  }
  
  // Process Apple graphics
  else if (GRAPHICS_PATTERNS.APPLE.PREFIX.test(normalized)) {
    const mSeriesMatch = normalized.match(GRAPHICS_PATTERNS.APPLE.M_SERIES);
    if (mSeriesMatch) {
      const mVersion = mSeriesMatch[1]; // 1, 2, or 3
      const mVariant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
      return `Apple M${mVersion}${mVariant} GPU`;
    }
    
    // More generic Apple GPU standardization
    normalized = normalized
      .replace(/apple\s+m(\d)(\s+(pro|max|ultra))?(\s+gpu)?/i, 'Apple M$1$2 GPU')
      .replace(/m(\d)(\s+(pro|max|ultra))?\s+gpu/i, 'Apple M$1$2 GPU');
    
    return normalized;
  }
  
  // Make sure spaces are normalized for any other cases
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Get a simplified version of the graphics card for filtering purposes
 * This creates broader categories for effective filtering
 */
export const getGraphicsFilterValue = (graphics: string): string => {
  const normalized = normalizeGraphics(graphics).toLowerCase();
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
  
  // AMD discrete GPU categories
  if (normalized.includes('radeon rx 7')) return 'AMD Radeon RX 7000 Series';
  if (normalized.includes('radeon rx 6')) return 'AMD Radeon RX 6000 Series';
  if (normalized.includes('radeon rx')) return 'AMD Radeon RX';
  if (normalized.includes('radeon')) return 'AMD Radeon Graphics';
  
  // Intel integrated/discrete graphics categories
  if (normalized.includes('arc')) return 'Intel Arc';
  if (normalized.includes('iris xe')) return 'Intel Iris Xe Graphics';
  if (normalized.includes('iris')) return 'Intel Iris Graphics';
  if (normalized.includes('uhd')) return 'Intel UHD Graphics';
  if (normalized.includes('hd graphics')) return 'Intel HD Graphics';
  
  // Apple integrated graphics
  if (normalized.includes('m3')) return 'Apple M3 GPU';
  if (normalized.includes('m2')) return 'Apple M2 GPU';
  if (normalized.includes('m1')) return 'Apple M1 GPU';
  
  return normalized;
};

/**
 * Detect if the GPU is integrated or dedicated
 */
export const isIntegratedGraphics = (graphics: string): boolean => {
  if (!graphics) return false;
  
  const normalized = normalizeGraphics(graphics).toLowerCase();
  
  // Known integrated graphics
  if (normalized.includes('intel') && 
     (normalized.includes('uhd') || 
      normalized.includes('hd graphics') || 
      normalized.includes('iris'))) {
    return true;
  }
  
  if (normalized.includes('amd') && 
     (normalized.includes('radeon graphics') && 
     !normalized.includes('radeon rx'))) {
    return true;
  }
  
  if (normalized.includes('apple m')) {
    return true;
  }
  
  // Explicitly mentions integrated
  if (/integrated/i.test(graphics)) {
    return true;
  }
  
  return false;
};

/**
 * Detect if the GPU is a high-performance model
 */
export const isHighPerformanceGraphics = (graphics: string): boolean => {
  if (!graphics) return false;
  
  const normalized = normalizeGraphics(graphics).toLowerCase();
  
  // NVIDIA high-performance GPUs
  if (normalized.includes('rtx') || 
      (normalized.includes('gtx') && (normalized.includes('1070') || normalized.includes('1080')))) {
    return true;
  }
  
  // AMD high-performance GPUs
  if (normalized.includes('radeon rx') && 
      (normalized.includes('6') || normalized.includes('7'))) {
    return true;
  }
  
  // Intel discrete graphics
  if (normalized.includes('intel arc')) {
    return true;
  }
  
  // Apple higher-end variants
  if (normalized.includes('apple m') && 
      (normalized.includes('pro') || normalized.includes('max') || normalized.includes('ultra'))) {
    return true;
  }
  
  return false;
};
