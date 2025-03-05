
/**
 * Calculates a numeric score for a processor based on its features and performance indicators
 */
export const getProcessorValue = (processor: string): number => {
  if (!processor) return 0;
  
  const normalizedProcessor = processor.toLowerCase();
  let score = 0;
  
  // Intel Core Ultra processors (newest Intel series)
  if (normalizedProcessor.includes('ultra')) {
    if (normalizedProcessor.includes('ultra 9')) score += 9500;
    else if (normalizedProcessor.includes('ultra 7')) score += 9000;
    else if (normalizedProcessor.includes('ultra 5')) score += 8500;
  }
  // CPU series and generation scores
  else if (normalizedProcessor.includes('intel')) {
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
