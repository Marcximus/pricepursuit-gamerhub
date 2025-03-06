
import type { Product } from "@/types/product";

export function calculateProcessorScore(laptop: Product): number {
  if (!laptop.processor) return 0;
  
  const proc = laptop.processor.toLowerCase();
  let score = 0;
  
  // Base processor type score
  if (proc.includes('ultra')) {
    score += 85; // Latest gen Intel Ultra
  } else if (proc.includes('i9') || proc.includes('ryzen 9')) {
    score += 80;
  } else if (proc.includes('i7') || proc.includes('ryzen 7')) {
    score += 75;
  } else if (proc.includes('i5') || proc.includes('ryzen 5')) {
    score += 65;
  } else if (proc.includes('i3') || proc.includes('ryzen 3')) {
    score += 55;
  }
  
  // Generation bonuses
  if (proc.includes('13') || proc.includes('14')) {
    score += 10;
  } else if (proc.includes('12')) {
    score += 8;
  } else if (proc.includes('11')) {
    score += 6;
  } else if (proc.includes('10')) {
    score += 4;
  }
  
  // Performance variants
  if (proc.includes('hx')) {
    score += 10;
  } else if (proc.includes('h')) {
    score += 5;
  }
  
  // Apple Silicon
  if (proc.includes('m3')) {
    score = 90;
  } else if (proc.includes('m2')) {
    score = 85;
  } else if (proc.includes('m1')) {
    score = 80;
  }
  
  return Math.min(100, Math.max(40, score)); // Ensure score is between 40-100
}
