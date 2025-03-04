
import type { Product } from "@/types/product";

/**
 * Calculate display score component of the benchmark
 */
export function calculateDisplayScoreComponent(laptop: Product): number {
  let score = 0;
  
  // Screen resolution (0-10 points)
  if (laptop.screen_resolution) {
    const resolution = laptop.screen_resolution.toLowerCase();
    
    if (resolution.includes('4k') || resolution.includes('uhd') || 
        resolution.includes('3840 x 2160')) {
      score = 10;
    }
    else if (resolution.includes('2k') || resolution.includes('qhd') || 
             resolution.includes('2560 x 1440')) {
      score = 7;
    }
    else if (resolution.includes('fhd') || resolution.includes('1080p') || 
             resolution.includes('1920 x 1080')) {
      score = 5;
    }
    else if (resolution.includes('hd')) {
      score = 2;
    }
  }
  
  return score;
}
