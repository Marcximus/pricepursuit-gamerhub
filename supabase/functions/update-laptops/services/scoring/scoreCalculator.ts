
/**
 * Calculate a processor score based on the extracted processor information
 */
export function calculateProcessorScore(processor: string): number {
  processor = processor.toLowerCase();
  
  // Intel Core Ultra (newest series)
  if (processor.includes('ultra 9')) {
    return 95;
  }
  if (processor.includes('ultra 7')) {
    return 93;
  }
  if (processor.includes('ultra 5')) {
    return 91;
  }
  // Intel Core i9
  if (processor.includes('i9')) {
    return 90;
  }
  // AMD Ryzen 9
  if (processor.includes('ryzen 9')) {
    return 88;
  }
  // Apple M3 variants
  if (processor.includes('m3 ultra')) {
    return 95;
  }
  if (processor.includes('m3 max')) {
    return 92;
  }
  if (processor.includes('m3 pro')) {
    return 88;
  }
  if (processor.includes('m3')) {
    return 85;
  }
  // Intel Core i7
  if (processor.includes('i7')) {
    return 80;
  }
  // AMD Ryzen 7
  if (processor.includes('ryzen 7')) {
    return 78;
  }
  // Apple M2 variants
  if (processor.includes('m2 max')) {
    return 85;
  }
  if (processor.includes('m2 pro')) {
    return 82;
  }
  if (processor.includes('m2')) {
    return 78;
  }
  // Intel Core i5
  if (processor.includes('i5')) {
    return 70;
  }
  // AMD Ryzen 5
  if (processor.includes('ryzen 5')) {
    return 68;
  }
  // Apple M1 variants
  if (processor.includes('m1')) {
    return 72;
  }
  // Intel Core i3
  if (processor.includes('i3')) {
    return 50;
  }
  // AMD Ryzen 3
  if (processor.includes('ryzen 3')) {
    return 48;
  }
  // Budget processors
  if (processor.includes('celeron') || processor.includes('pentium')) {
    return 30;
  }
  
  // Default for unknown processors
  return 40;
}

/**
 * Calculate a benchmark score based on various laptop specifications
 */
export function calculateBenchmarkScore(laptop: Record<string, any>): number {
  let score = 0;
  
  // Processor (0-35 points)
  if (laptop.processor_score) {
    score += laptop.processor_score * 0.35;
  } else if (laptop.processor) {
    score += calculateProcessorScore(laptop.processor) * 0.35;
  }
  
  // RAM (0-20 points)
  if (laptop.ram) {
    const ramMatch = laptop.ram.match(/(\d+)\s*GB/i);
    if (ramMatch) {
      const ramSize = parseInt(ramMatch[1], 10);
      if (ramSize >= 32) {
        score += 20;
      } else if (ramSize >= 16) {
        score += 15;
      } else if (ramSize >= 8) {
        score += 10;
      } else if (ramSize >= 4) {
        score += 5;
      }
    }
  }
  
  // Storage (0-15 points)
  if (laptop.storage) {
    // SSD type bonus
    if (/NVMe|PCIe/i.test(laptop.storage)) {
      score += 5;
    } else if (/SSD/i.test(laptop.storage)) {
      score += 3;
    }
    
    // Storage capacity
    const tbMatch = laptop.storage.match(/(\d+(?:\.\d+)?)\s*TB/i);
    const gbMatch = laptop.storage.match(/(\d+)\s*GB/i);
    
    if (tbMatch) {
      const tbSize = parseFloat(tbMatch[1]);
      if (tbSize >= 2) {
        score += 10;
      } else if (tbSize >= 1) {
        score += 8;
      } else {
        score += 6;
      }
    } else if (gbMatch) {
      const gbSize = parseInt(gbMatch[1], 10);
      if (gbSize >= 1000) {
        score += 8;
      } else if (gbSize >= 512) {
        score += 6;
      } else if (gbSize >= 256) {
        score += 4;
      } else if (gbSize >= 128) {
        score += 2;
      }
    }
  }
  
  // Graphics (0-20 points)
  if (laptop.graphics) {
    const graphics = laptop.graphics.toLowerCase();
    
    // High-end GPU
    if (graphics.includes('rtx 40') || graphics.includes('radeon rx 7')) {
      score += 20;
    }
    // Upper mid-range GPU
    else if (graphics.includes('rtx 30') || graphics.includes('radeon rx 6')) {
      score += 16;
    }
    // Mid-range GPU
    else if (graphics.includes('rtx 20') || graphics.includes('gtx 16') || 
             graphics.includes('radeon rx 5')) {
      score += 12;
    }
    // Entry dedicated GPU
    else if (graphics.includes('gtx') || graphics.includes('mx') || 
             graphics.includes('radeon')) {
      score += 8;
    }
    // Integrated graphics
    else if (graphics.includes('iris') || graphics.includes('m1') || 
             graphics.includes('m2') || graphics.includes('m3')) {
      score += 5;
    }
    // Basic integrated
    else if (graphics.includes('uhd') || graphics.includes('hd')) {
      score += 3;
    }
  }
  
  // Screen resolution (0-10 points)
  if (laptop.screen_resolution) {
    const resolution = laptop.screen_resolution.toLowerCase();
    
    if (resolution.includes('4k') || resolution.includes('uhd') || 
        resolution.includes('3840 x 2160')) {
      score += 10;
    }
    else if (resolution.includes('2k') || resolution.includes('qhd') || 
             resolution.includes('2560 x 1440')) {
      score += 7;
    }
    else if (resolution.includes('fhd') || resolution.includes('1080p') || 
             resolution.includes('1920 x 1080')) {
      score += 5;
    }
    else if (resolution.includes('hd')) {
      score += 2;
    }
  }
  
  return Math.round(score);
}
