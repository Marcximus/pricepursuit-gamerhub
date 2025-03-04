
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
    RX_SERIES: /\bradeon\s*(?:rx\s*)?(\d{3,4}(?:\s*xt)?)\b/i,
    VEGA_SERIES: /\bvega\s*(\d+)\b/i
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
  
  // Process AMD graphics with enhanced Vega series detection
  else if (GRAPHICS_PATTERNS.AMD.PREFIX.test(normalized) || 
          GRAPHICS_PATTERNS.AMD.RX_SERIES.test(normalized) ||
          GRAPHICS_PATTERNS.AMD.VEGA_SERIES.test(normalized)) {
    
    // Handle RX series
    const rxMatch = normalized.match(GRAPHICS_PATTERNS.AMD.RX_SERIES);
    if (rxMatch) {
      return `AMD Radeon RX ${rxMatch[1].toUpperCase()}`;
    }
    
    // Handle Vega series
    const vegaMatch = normalized.match(GRAPHICS_PATTERNS.AMD.VEGA_SERIES);
    if (vegaMatch) {
      return `AMD Radeon Vega ${vegaMatch[1]}`;
    }
    
    // Standardize other AMD graphics
    normalized = normalized
      .replace(/amd\s+radeon\s+graphics/i, 'AMD Radeon Graphics')
      .replace(/radeon\s+graphics/i, 'AMD Radeon Graphics')
      .replace(/\bradeon\s+rx\s+/i, 'AMD Radeon RX ')
      .replace(/\bradeon\s+vega\s+/i, 'AMD Radeon Vega ')
      .replace(/\bradeon\s+/i, 'AMD Radeon ');
    
    // Ensure AMD prefix is present
    if (!normalized.toLowerCase().includes('amd')) {
      normalized = `AMD ${normalized}`;
    }
    
    // Add "Graphics" suffix if missing
    if (!normalized.toLowerCase().includes('graphics') && 
        !normalized.toLowerCase().includes('vega') && 
        !normalized.toLowerCase().includes('rx')) {
      normalized += ' Graphics';
    }
    
    return normalized;
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
  
  // NVIDIA discrete GPU categories - enhanced with specific model detection
  // RTX 40 series (most recent)
  if (normalized.includes('rtx 40')) {
    // Check for specific models
    if (normalized.includes('4090')) return 'NVIDIA RTX 4090';
    if (normalized.includes('4080')) return 'NVIDIA RTX 4080';
    if (normalized.includes('4070')) return 'NVIDIA RTX 4070';
    if (normalized.includes('4060')) return 'NVIDIA RTX 4060';
    if (normalized.includes('4050')) return 'NVIDIA RTX 4050';
    return 'NVIDIA RTX 40 Series';
  }
  
  // RTX 30 series
  if (normalized.includes('rtx 30')) {
    // Check for specific models
    if (normalized.includes('3090')) return 'NVIDIA RTX 3090';
    if (normalized.includes('3080')) return 'NVIDIA RTX 3080';
    if (normalized.includes('3070')) return 'NVIDIA RTX 3070';
    if (normalized.includes('3060')) return 'NVIDIA RTX 3060';
    if (normalized.includes('3050')) return 'NVIDIA RTX 3050';
    return 'NVIDIA RTX 30 Series';
  }
  
  // RTX 20 series
  if (normalized.includes('rtx 20')) {
    // Check for specific models
    if (normalized.includes('2080')) return 'NVIDIA RTX 2080';
    if (normalized.includes('2070')) return 'NVIDIA RTX 2070';
    if (normalized.includes('2060')) return 'NVIDIA RTX 2060';
    return 'NVIDIA RTX 20 Series';
  }
  
  // Generic RTX
  if (normalized.includes('rtx')) {
    // Check for specific models not caught by series checks
    const rtxModelMatch = normalized.match(/rtx\s*(\d{4})/i);
    if (rtxModelMatch) {
      return `NVIDIA RTX ${rtxModelMatch[1]}`;
    }
    return 'NVIDIA RTX';
  }
  
  // GTX 16 series
  if (normalized.includes('gtx 16')) {
    // Check for specific models
    if (normalized.includes('1660')) return 'NVIDIA GTX 1660';
    if (normalized.includes('1650')) return 'NVIDIA GTX 1650';
    return 'NVIDIA GTX 16 Series';
  }
  
  // GTX 10 series
  if (normalized.includes('gtx 10')) {
    // Check for specific models
    if (normalized.includes('1080')) return 'NVIDIA GTX 1080';
    if (normalized.includes('1070')) return 'NVIDIA GTX 1070';
    if (normalized.includes('1060')) return 'NVIDIA GTX 1060';
    if (normalized.includes('1050')) return 'NVIDIA GTX 1050';
    return 'NVIDIA GTX 10 Series';
  }
  
  // Generic GTX
  if (normalized.includes('gtx')) {
    // Check for specific models not caught by series checks
    const gtxModelMatch = normalized.match(/gtx\s*(\d{3,4})/i);
    if (gtxModelMatch) {
      return `NVIDIA GTX ${gtxModelMatch[1]}`;
    }
    return 'NVIDIA GTX';
  }
  
  // AMD discrete GPU categories - enhanced with specific model detection
  // Radeon RX 7000 series
  if (normalized.includes('radeon rx 7')) {
    // Check for specific models
    if (normalized.includes('7900')) return 'AMD Radeon RX 7900';
    if (normalized.includes('7800')) return 'AMD Radeon RX 7800';
    if (normalized.includes('7700')) return 'AMD Radeon RX 7700';
    if (normalized.includes('7600')) return 'AMD Radeon RX 7600';
    return 'AMD Radeon RX 7000 Series';
  }
  
  // Radeon RX 6000 series
  if (normalized.includes('radeon rx 6')) {
    // Check for specific models
    if (normalized.includes('6900')) return 'AMD Radeon RX 6900';
    if (normalized.includes('6800')) return 'AMD Radeon RX 6800';
    if (normalized.includes('6700')) return 'AMD Radeon RX 6700';
    if (normalized.includes('6600')) return 'AMD Radeon RX 6600';
    if (normalized.includes('6500')) return 'AMD Radeon RX 6500';
    return 'AMD Radeon RX 6000 Series';
  }
  
  // Older RX series
  if (normalized.includes('radeon rx')) {
    // Check for specific models not caught by series checks
    const rxModelMatch = normalized.match(/rx\s*(\d{3,4})/i);
    if (rxModelMatch) {
      return `AMD Radeon RX ${rxModelMatch[1]}`;
    }
    return 'AMD Radeon RX';
  }
  
  // Vega series with specific model detection
  if (normalized.includes('vega')) {
    const vegaModelMatch = normalized.match(/vega\s*(\d+)/i);
    if (vegaModelMatch) {
      return `AMD Radeon Vega ${vegaModelMatch[1]}`;
    }
    return 'AMD Radeon Vega';
  }
  
  // Generic Radeon
  if (normalized.includes('radeon')) {
    return 'AMD Radeon Graphics';
  }
  
  // Intel integrated/discrete graphics categories
  if (normalized.includes('arc')) {
    // Check for specific Arc models
    const arcModelMatch = normalized.match(/arc\s*([a-z]\d{2,3})/i);
    if (arcModelMatch) {
      return `Intel Arc ${arcModelMatch[1].toUpperCase()}`;
    }
    return 'Intel Arc';
  }
  
  if (normalized.includes('iris xe')) return 'Intel Iris Xe Graphics';
  if (normalized.includes('iris')) return 'Intel Iris Graphics';
  if (normalized.includes('uhd')) return 'Intel UHD Graphics';
  if (normalized.includes('hd graphics')) return 'Intel HD Graphics';
  
  // Apple integrated graphics
  if (normalized.includes('m3')) {
    if (normalized.includes('pro')) return 'Apple M3 Pro GPU';
    if (normalized.includes('max')) return 'Apple M3 Max GPU';
    if (normalized.includes('ultra')) return 'Apple M3 Ultra GPU';
    return 'Apple M3 GPU';
  }
  
  if (normalized.includes('m2')) {
    if (normalized.includes('pro')) return 'Apple M2 Pro GPU';
    if (normalized.includes('max')) return 'Apple M2 Max GPU';
    if (normalized.includes('ultra')) return 'Apple M2 Ultra GPU';
    return 'Apple M2 GPU';
  }
  
  if (normalized.includes('m1')) {
    if (normalized.includes('pro')) return 'Apple M1 Pro GPU';
    if (normalized.includes('max')) return 'Apple M1 Max GPU';
    if (normalized.includes('ultra')) return 'Apple M1 Ultra GPU';
    return 'Apple M1 GPU';
  }
  
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
  
  // AMD Vega integrated
  if (normalized.includes('vega') && !normalized.includes('radeon rx')) {
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
  
  // NVIDIA high-performance GPUs - with specific model detection
  if (normalized.includes('rtx')) {
    // RTX 40/30 series are high performance by default
    if (normalized.includes('40') || normalized.includes('30')) {
      return true;
    }
    
    // High-end 20 series
    if (normalized.includes('2080') || normalized.includes('2070')) {
      return true;
    }
    
    return false; // Other RTX models are mid-range
  }
  
  // High-end GTX models
  if (normalized.includes('gtx') && 
      (normalized.includes('1080') || normalized.includes('1070'))) {
    return true;
  }
  
  // AMD high-performance GPUs - with specific model detection
  if (normalized.includes('radeon rx')) {
    // High-end 6000/7000 series
    if (normalized.includes('7900') || normalized.includes('7800') || 
        normalized.includes('6900') || normalized.includes('6800')) {
      return true;
    }
    
    return false; // Other RX models are mid-range
  }
  
  // Intel discrete graphics - only high-end Arc models
  if (normalized.includes('intel arc')) {
    // A770/A750 are high performance
    if (normalized.includes('a770') || normalized.includes('a750')) {
      return true;
    }
    
    return false; // Other Arc models are mid-range
  }
  
  // Apple higher-end variants - only Pro/Max/Ultra are high performance
  if (normalized.includes('apple m') && 
      (normalized.includes('pro') || normalized.includes('max') || normalized.includes('ultra'))) {
    return true;
  }
  
  return false;
};
