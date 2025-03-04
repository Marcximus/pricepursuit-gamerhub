
/**
 * Advanced module for normalizing and standardizing graphics card information
 * This improves filtering accuracy and display consistency
 */

// Common brand and GPU family patterns 
const GRAPHICS_PATTERNS = {
  NVIDIA: {
    PREFIX: /\b(?:nvidia|geforce)\b/i,
    RTX_SERIES: /\brtx\s*(\d{4}(?:\s*ti|\s*super)?)\b/i,
    RTX_SERIES_SHORT: /\brtx\s*(\d{1,2})(\d{2})(?:\s*ti|\s*super)?\b/i,
    GTX_SERIES: /\bgtx\s*(\d{3,4}(?:\s*ti|\s*super)?)\b/i,
    MAX_Q: /\bmax-?q\b/i,
    MX_SERIES: /\bmx\s*(\d{3}(?:\s*ti)?)\b/i
  },
  AMD: {
    PREFIX: /\b(?:amd|radeon)\b/i,
    RX_SERIES: /\bradeon\s*(?:rx\s*)?(\d{3,4}(?:\s*xt)?)\b/i,
    VEGA_SERIES: /\bvega\s*(\d*)\b/i
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
  
  // Check for "with dedicated graphics" pattern and try to be more specific
  if (/with\s+(?:dedicated|discrete)\s+graphics/i.test(normalized)) {
    // Extract any memory mention that might indicate the GPU model
    const memMatch = normalized.match(/(\d+)\s*GB\s+(?:dedicated|discrete)/i);
    if (memMatch) {
      return `Dedicated ${memMatch[1]}GB Graphics`;
    }
    return 'Dedicated Graphics';
  }
  
  // Process NVIDIA graphics
  if (GRAPHICS_PATTERNS.NVIDIA.PREFIX.test(normalized) || 
      GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES.test(normalized) || 
      GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES_SHORT.test(normalized) || 
      GRAPHICS_PATTERNS.NVIDIA.GTX_SERIES.test(normalized) ||
      GRAPHICS_PATTERNS.NVIDIA.MX_SERIES.test(normalized)) {
    
    // Extract VRAM information if present
    let vramInfo = '';
    const vramMatch = normalized.match(/(\d+)\s*GB(?:\s+GDDR\d+)?/i);
    if (vramMatch) {
      vramInfo = ` ${vramMatch[0]}`;
    }
    
    // Check for Max-Q variant
    const hasMaxQ = GRAPHICS_PATTERNS.NVIDIA.MAX_Q.test(normalized);
    
    // Standardize RTX series with 4-digit model numbers
    const rtxMatch = normalized.match(GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES);
    if (rtxMatch) {
      let gpuModel = rtxMatch[1].toUpperCase().replace(/\s+/g, ' ');
      
      // Create standardized RTX naming
      normalized = `NVIDIA RTX ${gpuModel}${hasMaxQ ? ' Max-Q' : ''}${vramInfo}`;
      return normalized;
    }
    
    // Handle RTX series with shortened model numbers (e.g., RTX 30 60 -> RTX 3060)
    const rtxShortMatch = normalized.match(GRAPHICS_PATTERNS.NVIDIA.RTX_SERIES_SHORT);
    if (rtxShortMatch) {
      let gpuSeries = rtxShortMatch[1];
      let gpuModel = rtxShortMatch[2];
      
      // Create standardized RTX naming with combined model number
      normalized = `NVIDIA RTX ${gpuSeries}${gpuModel}${hasMaxQ ? ' Max-Q' : ''}${vramInfo}`;
      return normalized;
    }
    
    // Standardize GTX series
    const gtxMatch = normalized.match(GRAPHICS_PATTERNS.NVIDIA.GTX_SERIES);
    if (gtxMatch) {
      let gpuModel = gtxMatch[1].toUpperCase().replace(/\s+/g, ' ');
      
      // Create standardized GTX naming
      normalized = `NVIDIA GTX ${gpuModel}${hasMaxQ ? ' Max-Q' : ''}${vramInfo}`;
      return normalized;
    }
    
    // Standardize MX series (entry-level dedicated)
    const mxMatch = normalized.match(GRAPHICS_PATTERNS.NVIDIA.MX_SERIES);
    if (mxMatch) {
      let gpuModel = mxMatch[1].toUpperCase().replace(/\s+/g, ' ');
      
      // Create standardized MX naming
      normalized = `NVIDIA MX ${gpuModel}${vramInfo}`;
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
      .replace(/\bgtx\s+(\d{3,4})/i, 'NVIDIA GTX $1');
      
    // If we still just have "NVIDIA" without model, try to be more specific
    if (/^nvidia$/i.test(normalized)) {
      return 'NVIDIA Graphics';
    }
  }
  
  // Process AMD graphics
  else if (GRAPHICS_PATTERNS.AMD.PREFIX.test(normalized) || 
          GRAPHICS_PATTERNS.AMD.RX_SERIES.test(normalized) ||
          GRAPHICS_PATTERNS.AMD.VEGA_SERIES.test(normalized)) {
    
    // Extract VRAM information if present
    let vramInfo = '';
    const vramMatch = normalized.match(/(\d+)\s*GB(?:\s+GDDR\d+)?/i);
    if (vramMatch) {
      vramInfo = ` ${vramMatch[0]}`;
    }
    
    // Handle Vega series
    const vegaMatch = normalized.match(GRAPHICS_PATTERNS.AMD.VEGA_SERIES);
    if (vegaMatch) {
      const vegaModel = vegaMatch[1] ? vegaMatch[1] : '';
      return `AMD Radeon Vega${vegaModel ? ' ' + vegaModel : ''}${vramInfo} Graphics`;
    }
    
    // Standardize RX series
    const rxMatch = normalized.match(GRAPHICS_PATTERNS.AMD.RX_SERIES);
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
    
    // Try to extract generation numbers
    let genNumber = '';
    const genMatch = normalized.match(/\b(\d{3,4})\b/);
    if (genMatch) {
      genNumber = ` ${genMatch[1]}`;
    }
    
    // Standardize other Intel graphics
    normalized = normalized
      .replace(/intel\s+iris\s+xe\s+graphics/i, `Intel Iris Xe${genNumber} Graphics`)
      .replace(/intel\s+iris\s+graphics/i, `Intel Iris${genNumber} Graphics`)
      .replace(/intel\s+uhd\s+graphics/i, `Intel UHD${genNumber} Graphics`)
      .replace(/intel\s+hd\s+graphics/i, `Intel HD${genNumber} Graphics`)
      .replace(/\bIris\s+Xe\b/i, `Intel Iris Xe${genNumber} Graphics`)
      .replace(/\bUHD\s+Graphics\b/i, `Intel UHD${genNumber} Graphics`)
      .replace(/\bHD\s+Graphics\b/i, `Intel HD${genNumber} Graphics`);
    
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
      
      // Try to extract core count
      let coreCount = '';
      const coreMatch = normalized.match(/(\d+)[\s-]core/i);
      if (coreMatch) {
        coreCount = ` with ${coreMatch[1]}-core`;
      }
      
      return `Apple M${mVersion}${mVariant}${coreCount} GPU`;
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
  
  // Vega 3/5/6/7/8 are typically integrated in APUs
  if (normalized.includes('vega') && 
      /vega\s+[3-8]\b/i.test(normalized)) {
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
  if (normalized.includes('rtx 40')) return true; // 40 series is high performance
  if (normalized.includes('rtx 30') && 
      (normalized.includes('3070') || normalized.includes('3080') || normalized.includes('3090'))) {
    return true;
  }
  if (normalized.includes('rtx 20') && 
      (normalized.includes('2070') || normalized.includes('2080') || normalized.includes('2090'))) {
    return true;
  }
  if (normalized.includes('gtx') && 
      (normalized.includes('1070') || normalized.includes('1080'))) {
    return true;
  }
  
  // AMD high-performance GPUs
  if (normalized.includes('radeon rx 7') && 
      (normalized.includes('7700') || normalized.includes('7800') || normalized.includes('7900'))) {
    return true;
  }
  if (normalized.includes('radeon rx 6') && 
      (normalized.includes('6700') || normalized.includes('6800') || normalized.includes('6900'))) {
    return true;
  }
  if (normalized.includes('radeon rx 5') && 
      (normalized.includes('5700') || normalized.includes('5800') || normalized.includes('5900'))) {
    return true;
  }
  
  // Intel discrete graphics
  if (normalized.includes('intel arc') && 
      (normalized.includes('a7') || normalized.includes('a770') || normalized.includes('a750'))) {
    return true;
  }
  
  // Apple higher-end variants
  if (normalized.includes('apple m') && 
      (normalized.includes('pro') || normalized.includes('max') || normalized.includes('ultra'))) {
    return true;
  }
  
  // VRAM indicators
  if ((normalized.includes('nvidia') || normalized.includes('radeon rx')) && 
      /\b(?:8|10|12|16|24)\s*gb\b/i.test(normalized)) {
    return true;
  }
  
  return false;
};
