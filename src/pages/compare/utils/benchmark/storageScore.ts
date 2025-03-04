
import type { Product } from "@/types/product";

/**
 * Calculate storage score component of the benchmark
 */
export function calculateStorageScoreComponent(laptop: Product): number {
  let score = 0;
  
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
  
  return score;
}
