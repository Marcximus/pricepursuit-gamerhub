
import type { Product } from "@/types/product";

/**
 * Calculate RAM score component of the benchmark
 */
export function calculateRamScoreComponent(laptop: Product): number {
  let score = 0;
  
  // RAM (0-20 points)
  if (laptop.ram) {
    const ramMatch = laptop.ram.match(/(\d+)\s*GB/i);
    if (ramMatch) {
      const ramSize = parseInt(ramMatch[1], 10);
      if (ramSize >= 32) {
        score = 20;
      } else if (ramSize >= 16) {
        score = 15;
      } else if (ramSize >= 8) {
        score = 10;
      } else if (ramSize >= 4) {
        score = 5;
      }
    }
  }
  
  return score;
}
