
/**
 * Normalizes processor strings for consistent display
 */
export const normalizeProcessor = (processor: string): string => {
  if (!processor) return '';
  
  const normalizedProcessor = processor.toLowerCase();
  
  // Intel processors
  const intel = normalizedProcessor.match(/(?:intel\s+)?(?:core\s+)?(i[3579])[\s-](\d{4,5}[a-z]*)/i);
  if (intel) {
    const generation = intel[2][0]; // First digit of model number is generation
    return `Intel Core ${intel[1].toUpperCase()}-${intel[2]} (${generation}th Gen)`;
  }
  
  // AMD Ryzen processors
  const amd = normalizedProcessor.match(/(?:amd\s+)?ryzen\s+([3579])\s+(\d{4}[a-z]*)/i);
  if (amd) {
    return `AMD Ryzen ${amd[1]} ${amd[2]}`;
  }
  
  // Apple M-series processors
  const apple = normalizedProcessor.match(/(?:apple\s+)?(m[123])(?:\s+(pro|max|ultra))?/i);
  if (apple) {
    return `Apple ${apple[1].toUpperCase()}${apple[2] ? ' ' + apple[2].charAt(0).toUpperCase() + apple[2].slice(1) : ''} Chip`;
  }
  
  // If no specific format matched but contains keywords, standardize capitalization
  if (normalizedProcessor.includes('intel')) {
    return processor.replace(/intel/i, 'Intel').replace(/core/i, 'Core');
  }
  
  if (normalizedProcessor.includes('amd')) {
    return processor.replace(/amd/i, 'AMD').replace(/ryzen/i, 'Ryzen');
  }
  
  if (normalizedProcessor.includes('apple')) {
    return processor.replace(/apple/i, 'Apple');
  }
  
  return processor;
};

/**
 * Normalizes graphics card strings for consistent display
 */
export const normalizeGraphics = (graphics: string): string => {
  if (!graphics) return '';
  
  const normalizedGraphics = graphics.toLowerCase();
  
  // Skip extremely vague descriptions
  if (normalizedGraphics === 'integrated' || 
      normalizedGraphics === 'integrated graphics' ||
      normalizedGraphics === 'graphics') {
    return '';
  }
  
  // NVIDIA GPUs
  const nvidia = normalizedGraphics.match(/(?:nvidia\s+)?(?:geforce\s+)?(rtx|gtx)\s*(\d{4}|\d{3})(?:\s*(ti|super|max-q))?/i);
  if (nvidia) {
    const [_, series, model, variant] = nvidia;
    return `NVIDIA ${series.toUpperCase()} ${model}${variant ? ' ' + variant.charAt(0).toUpperCase() + variant.slice(1) : ''}`;
  }
  
  // AMD GPUs
  const amd = normalizedGraphics.match(/(?:amd\s+)?radeon(?:\s+(rx)\s*(\d{4}|\d{3}))?/i);
  if (amd) {
    if (amd[1] && amd[2]) {
      return `AMD Radeon ${amd[1].toUpperCase()} ${amd[2]}`;
    }
    return "AMD Radeon Graphics";
  }
  
  // Intel Graphics
  const intel = normalizedGraphics.match(/intel\s+(iris\s+xe|iris|uhd|hd)(?:\s+graphics)?/i);
  if (intel) {
    let intelModel = intel[1].toLowerCase();
    if (intelModel === 'iris xe') return 'Intel Iris Xe Graphics';
    if (intelModel === 'iris') return 'Intel Iris Graphics';
    if (intelModel === 'uhd') return 'Intel UHD Graphics';
    if (intelModel === 'hd') return 'Intel HD Graphics';
    return `Intel ${intel[1]} Graphics`;
  }
  
  // Apple Graphics
  if (normalizedGraphics.includes('apple') && 
      (normalizedGraphics.includes('m1') || normalizedGraphics.includes('m2') || normalizedGraphics.includes('m3'))) {
    
    if (normalizedGraphics.includes('m3')) {
      return normalizedGraphics.includes('pro') ? 'Apple M3 Pro GPU' : 
             normalizedGraphics.includes('max') ? 'Apple M3 Max GPU' : 'Apple M3 GPU';
    } else if (normalizedGraphics.includes('m2')) {
      return normalizedGraphics.includes('pro') ? 'Apple M2 Pro GPU' : 
             normalizedGraphics.includes('max') ? 'Apple M2 Max GPU' : 'Apple M2 GPU';
    } else {
      return normalizedGraphics.includes('pro') ? 'Apple M1 Pro GPU' : 
             normalizedGraphics.includes('max') ? 'Apple M1 Max GPU' : 'Apple M1 GPU';
    }
  }
  
  // Clean up if still has the word "graphics" missing
  if (!normalizedGraphics.includes('graphics') && 
      !normalizedGraphics.includes('gpu') &&
      normalizedGraphics !== '') {
    return graphics + ' Graphics';
  }
  
  return graphics;
};
