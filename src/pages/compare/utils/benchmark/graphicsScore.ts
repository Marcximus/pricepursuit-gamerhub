
import type { Product } from "@/types/product";

/**
 * Calculate graphics score component of the benchmark
 */
export function calculateGraphicsScoreComponent(laptop: Product): number {
  let score = 0;
  
  // Graphics (0-20 points)
  if (laptop.graphics) {
    const graphics = laptop.graphics.toLowerCase();
    
    // High-end GPU
    if (graphics.includes('rtx 40') || graphics.includes('radeon rx 7')) {
      score = 20;
    }
    // Upper mid-range GPU
    else if (graphics.includes('rtx 30') || graphics.includes('radeon rx 6')) {
      score = 16;
    }
    // Mid-range GPU
    else if (graphics.includes('rtx 20') || graphics.includes('gtx 16') || 
             graphics.includes('radeon rx 5')) {
      score = 12;
    }
    // Entry dedicated GPU
    else if (graphics.includes('gtx') || graphics.includes('mx') || 
             graphics.includes('radeon')) {
      score = 8;
    }
    // Integrated graphics
    else if (graphics.includes('iris') || graphics.includes('m1') || 
             graphics.includes('m2') || graphics.includes('m3')) {
      score = 5;
    }
    // Basic integrated
    else if (graphics.includes('uhd') || graphics.includes('hd')) {
      score = 3;
    }
  }
  
  return score;
}
