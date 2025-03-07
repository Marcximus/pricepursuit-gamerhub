
import type { Product } from "@/types/product";

export function calculateProcessorScore(laptop: Product): number {
  if (!laptop.processor) return 0;
  
  const proc = laptop.processor.toLowerCase();
  let score = 0;
  
  // Base processor type score
  if (proc.includes('ultra')) {
    // Intel Core Ultra series
    if (proc.includes('ultra 9')) {
      score += 90;
    } else if (proc.includes('ultra 7')) {
      score += 85;
    } else if (proc.includes('ultra 5')) {
      score += 80;
    } else {
      score += 75; // Generic Ultra
    }
  } else if (proc.includes('i9') || proc.includes('ryzen 9')) {
    score += 80;
  } else if (proc.includes('i7') || proc.includes('ryzen 7')) {
    score += 75;
  } else if (proc.includes('i5') || proc.includes('ryzen 5')) {
    score += 65;
  } else if (proc.includes('i3') || proc.includes('ryzen 3')) {
    score += 55;
  } else if (proc.includes('core 7')) {
    score += 75; // Intel Core 7 (new naming)
  } else if (proc.includes('core 5')) {
    score += 65; // Intel Core 5 (new naming)
  } else if (proc.includes('core 3')) {
    score += 55; // Intel Core 3 (new naming)
  }
  
  // Generation bonuses
  if (proc.includes('13') || proc.includes('14')) {
    score += 15;
  } else if (proc.includes('12')) {
    score += 12;
  } else if (proc.includes('11')) {
    score += 9;
  } else if (proc.includes('10')) {
    score += 6;
  } else if (proc.includes('9')) {
    score += 3;
  }
  
  // Performance variants
  if (proc.includes('hx')) {
    score += 15;
  } else if (proc.includes('h')) {
    score += 10;
  } else if (proc.includes('p')) {
    score += 8;
  } else if (proc.includes('u')) {
    score += 3;
  } else if (proc.includes('y')) {
    score -= 5; // Ultra low power
  }
  
  // Core count bonus if available
  const coreMatch = proc.match(/(\d+)[\s-]core/i);
  if (coreMatch) {
    const cores = parseInt(coreMatch[1], 10);
    if (cores > 16) {
      score += 10;
    } else if (cores > 12) {
      score += 8;
    } else if (cores > 8) {
      score += 6;
    } else if (cores > 6) {
      score += 4;
    } else if (cores > 4) {
      score += 2;
    }
  }
  
  // Apple Silicon
  if (proc.includes('m3')) {
    if (proc.includes('ultra')) {
      score = 95;
    } else if (proc.includes('max')) {
      score = 92;
    } else if (proc.includes('pro')) {
      score = 88;
    } else {
      score = 85;
    }
  } else if (proc.includes('m2')) {
    if (proc.includes('max')) {
      score = 88;
    } else if (proc.includes('pro')) {
      score = 85;
    } else {
      score = 82;
    }
  } else if (proc.includes('m1')) {
    if (proc.includes('max')) {
      score = 83;
    } else if (proc.includes('pro')) {
      score = 80;
    } else {
      score = 78;
    }
  }
  
  return Math.min(100, Math.max(40, score)); // Ensure score is between 40-100
}
