
// Known brand names with proper capitalization
const KNOWN_BRANDS = {
  'apple': 'Apple',
  'lenovo': 'Lenovo',
  'hp': 'HP',
  'dell': 'Dell',
  'asus': 'ASUS',
  'acer': 'Acer',
  'msi': 'MSI',
  'samsung': 'Samsung',
  'microsoft': 'Microsoft',
  'lg': 'LG',
  'razer': 'Razer',
  'toshiba': 'Toshiba',
  'gigabyte': 'Gigabyte',
  'huawei': 'Huawei',
  'xiaomi': 'Xiaomi',
  'fujitsu': 'Fujitsu',
  'alienware': 'Alienware'
};

export const getProcessorValue = (processor: string): number => {
  if (!processor) return 0;
  
  const normalizedProcessor = processor.toLowerCase();
  let score = 0;
  
  // CPU series and generation scores
  if (normalizedProcessor.includes('intel')) {
    // Intel Core i-series processors
    if (normalizedProcessor.includes('i9')) score += 9000;
    else if (normalizedProcessor.includes('i7')) score += 7000;
    else if (normalizedProcessor.includes('i5')) score += 5000;
    else if (normalizedProcessor.includes('i3')) score += 3000;
    else if (normalizedProcessor.includes('celeron')) score += 1000;
    else if (normalizedProcessor.includes('pentium')) score += 2000;
    
    // Intel generations
    for (let gen = 3; gen <= 15; gen++) {
      if (normalizedProcessor.includes(`${gen}th gen`) || 
          normalizedProcessor.includes(`-${gen}`) ||
          normalizedProcessor.includes(` ${gen}`) ||
          normalizedProcessor.match(new RegExp(`\\bi${gen}\\b`))) {
        score += gen * 100;
      }
    }
    
    // Intel model number (higher is generally better)
    const modelMatch = normalizedProcessor.match(/i[3579]-(\d{4})/i);
    if (modelMatch) {
      score += parseInt(modelMatch[1].substring(0, 2)) * 20;
    }
  } else if (normalizedProcessor.includes('amd') || normalizedProcessor.includes('ryzen')) {
    if (normalizedProcessor.includes('ryzen 9')) score += 9000;
    else if (normalizedProcessor.includes('ryzen 7')) score += 7000;
    else if (normalizedProcessor.includes('ryzen 5')) score += 5000;
    else if (normalizedProcessor.includes('ryzen 3')) score += 3000;
    
    // AMD generations
    const genMatch = normalizedProcessor.match(/ryzen\s+\d\s+(\d{4})/i);
    if (genMatch) {
      score += parseInt(genMatch[1]) * 0.1;
    }
  } else if (normalizedProcessor.includes('apple') || normalizedProcessor.includes('m1') || normalizedProcessor.includes('m2') || normalizedProcessor.includes('m3')) {
    // Base score for being Apple
    score += 7000;
    
    // Apple M-series generation
    if (normalizedProcessor.includes('m3')) score += 3000;
    else if (normalizedProcessor.includes('m2')) score += 2000;
    else if (normalizedProcessor.includes('m1')) score += 1000;
    
    // Apple variant
    if (normalizedProcessor.includes('ultra')) score += 300;
    else if (normalizedProcessor.includes('max')) score += 200;
    else if (normalizedProcessor.includes('pro')) score += 100;
  }
  
  return score;
};

export const getGraphicsValue = (graphics: string): number => {
  if (!graphics) return 0;
  
  const normalizedGraphics = graphics.toLowerCase();
  let score = 0;
  
  // NVIDIA discrete GPUs
  if (normalizedGraphics.includes('nvidia') || normalizedGraphics.includes('geforce') || 
      normalizedGraphics.includes('rtx') || normalizedGraphics.includes('gtx')) {
    
    if (normalizedGraphics.includes('rtx')) {
      score += 10000;
      if (normalizedGraphics.includes('rtx 40')) score += 40000;
      else if (normalizedGraphics.includes('rtx 30')) score += 30000;
      else if (normalizedGraphics.includes('rtx 20')) score += 20000;
      else score += 15000;
    } else if (normalizedGraphics.includes('gtx')) {
      score += 5000;
      if (normalizedGraphics.includes('gtx 16')) score += 16000;
      else if (normalizedGraphics.includes('gtx 10')) score += 10000;
      else score += 5000;
    }
    
    if (normalizedGraphics.includes('ti')) score += 1000;
  } else if (normalizedGraphics.includes('amd') || normalizedGraphics.includes('radeon')) {
    if (normalizedGraphics.includes('rx')) score += 8000;
    else score += 3000;
    
    if (normalizedGraphics.includes('rx 7')) score += 7000;
    else if (normalizedGraphics.includes('rx 6')) score += 6000;
    else if (normalizedGraphics.includes('rx 5')) score += 5000;
  } else if (normalizedGraphics.includes('intel')) {
    if (normalizedGraphics.includes('arc')) score += 6000;
    else if (normalizedGraphics.includes('iris xe')) score += 2000;
    else if (normalizedGraphics.includes('iris plus')) score += 1800;
    else if (normalizedGraphics.includes('iris')) score += 1500;
    else if (normalizedGraphics.includes('uhd')) score += 1000;
    else if (normalizedGraphics.includes('hd')) score += 500;
    else score += 100;
  } else if (normalizedGraphics.includes('apple') || normalizedGraphics.includes('m1') || 
             normalizedGraphics.includes('m2') || normalizedGraphics.includes('m3')) {
    score += 5000;
    
    if (normalizedGraphics.includes('m3')) score += 3000;
    else if (normalizedGraphics.includes('m2')) score += 2000;
    else if (normalizedGraphics.includes('m1')) score += 1000;
    
    if (normalizedGraphics.includes('ultra')) score += 300;
    else if (normalizedGraphics.includes('max')) score += 200;
    else if (normalizedGraphics.includes('pro')) score += 100;
  } else if (normalizedGraphics.includes('integrated')) {
    score += 50;
  }
  
  const modelNumber = normalizedGraphics.match(/\b(\d{4})\b/);
  if (modelNumber) {
    score += parseInt(modelNumber[1]);
  }
  
  return score;
};

export { KNOWN_BRANDS };
