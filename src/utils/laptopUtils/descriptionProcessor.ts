
/**
 * Functions for processing laptop descriptions
 */

export const processLaptopDescription = (
  description: string, 
  title: string, 
  specs: Record<string, any>
): Record<string, any> => {
  // Clone specs to avoid mutation
  const enhancedSpecs = { ...specs };
  
  // Try to fill in missing specifications from the description
  if (!enhancedSpecs.processor) {
    // Look for processor in description
    const processorMatch = description.match(/processor:?\s*([^,;.]+)/i);
    if (processorMatch && processorMatch[1].length > 5) {
      enhancedSpecs.processor = processorMatch[1].trim();
    }
  }
  
  if (!enhancedSpecs.ram) {
    // Look for RAM in description
    const ramMatch = description.match(/(?:RAM|memory):?\s*(\d+)\s*GB/i);
    if (ramMatch) {
      enhancedSpecs.ram = `${ramMatch[1]}GB`;
    }
  }
  
  if (!enhancedSpecs.storage) {
    // Look for storage in description
    const storageMatch = description.match(/(?:storage|SSD|hard\s*drive):?\s*(\d+)\s*(?:GB|TB)/i);
    if (storageMatch) {
      enhancedSpecs.storage = storageMatch[0].trim();
    }
  }
  
  if (!enhancedSpecs.screen_size) {
    // Look for screen size in description
    const screenMatch = description.match(/(\d+\.?\d?)\s*(?:inch|in|")\s*(?:display|screen)/i);
    if (screenMatch) {
      enhancedSpecs.screen_size = `${screenMatch[1]}"`;
    }
  }
  
  if (!enhancedSpecs.graphics) {
    // Look for graphics in description
    const graphicsMatch = description.match(/graphics:?\s*([^,;.]+)/i);
    if (graphicsMatch && graphicsMatch[1].length > 5) {
      enhancedSpecs.graphics = graphicsMatch[1].trim();
    }
  }
  
  return enhancedSpecs;
};

export const hasPremiumFeatures = (specs: Record<string, any>): boolean => {
  // Determine if the laptop has premium features based on specs
  if (specs.processor) {
    const proc = specs.processor.toLowerCase();
    if (proc.includes('i7') || proc.includes('i9') || 
        proc.includes('ryzen 7') || proc.includes('ryzen 9') || 
        proc.includes('m1 pro') || proc.includes('m1 max') ||
        proc.includes('m2 pro') || proc.includes('m2 max') ||
        proc.includes('m3 pro') || proc.includes('m3 max') ||
        proc.includes('core ultra') || proc.includes('threadripper')) {
      return true;
    }
  }
  
  if (specs.ram) {
    const ram = specs.ram.toLowerCase();
    // High RAM is a premium feature
    if (ram.includes('16gb') || ram.includes('32gb') || ram.includes('64gb')) {
      return true;
    }
  }
  
  if (specs.graphics) {
    const gpu = specs.graphics.toLowerCase();
    // Dedicated high-end GPUs indicate premium
    if (gpu.includes('rtx') || 
        gpu.includes('radeon rx') || 
        gpu.includes('quadro')) {
      return true;
    }
  }
  
  return false;
};

export const generateLaptopScore = (specs: Record<string, any>): number => {
  let score = 50; // Base score
  
  // Add points for processor
  if (specs.processor) {
    const proc = String(specs.processor).toLowerCase();
    if (proc.includes('i9') || proc.includes('ryzen 9') || 
        proc.includes('m3 max') || proc.includes('m2 max') || 
        proc.includes('m1 max') || proc.includes('threadripper') ||
        proc.includes('core ultra 9')) {
      score += 20;
    } else if (proc.includes('i7') || proc.includes('ryzen 7') || 
               proc.includes('m3 pro') || proc.includes('m2 pro') || 
               proc.includes('m1 pro') || proc.includes('core ultra 7')) {
      score += 15;
    } else if (proc.includes('i5') || proc.includes('ryzen 5') || 
               proc.includes('m3') || proc.includes('m2') || 
               proc.includes('m1') || proc.includes('core ultra 5')) {
      score += 10;
    } else if (proc.includes('i3') || proc.includes('ryzen 3')) {
      score += 5;
    }
  }
  
  // Add points for RAM
  if (specs.ram) {
    const ram = String(specs.ram).toLowerCase();
    if (ram.includes('64gb')) {
      score += 20;
    } else if (ram.includes('32gb')) {
      score += 15;
    } else if (ram.includes('16gb')) {
      score += 10;
    } else if (ram.includes('8gb')) {
      score += 5;
    }
  }
  
  // Add points for graphics
  if (specs.graphics) {
    const gpu = String(specs.graphics).toLowerCase();
    if (gpu.includes('rtx 40') || gpu.includes('radeon rx 7')) {
      score += 20;
    } else if (gpu.includes('rtx 30') || gpu.includes('radeon rx 6')) {
      score += 15;
    } else if (gpu.includes('rtx 20') || gpu.includes('gtx 16') || 
               gpu.includes('radeon rx 5')) {
      score += 10;
    } else if (gpu.includes('dedicated') || gpu.includes('gtx') || 
               gpu.includes('radeon')) {
      score += 5;
    }
  }
  
  // Add points for storage (only if it specifically mentions SSD)
  if (specs.storage) {
    const storage = String(specs.storage).toLowerCase();
    if (storage.includes('ssd')) {
      if (storage.includes('2tb') || storage.includes('2 tb')) {
        score += 15;
      } else if (storage.includes('1tb') || storage.includes('1 tb')) {
        score += 10;
      } else if (storage.includes('512gb') || storage.includes('512 gb')) {
        score += 5;
      }
    }
  }
  
  return Math.min(100, Math.max(0, score)); // Clamp score between 0 and 100
};
