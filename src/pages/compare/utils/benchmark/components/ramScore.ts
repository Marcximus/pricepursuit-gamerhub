
import type { Product } from "@/types/product";

export function calculateRamScore(laptop: Product): number {
  if (!laptop.ram) return 0;
  
  const ram = laptop.ram.toLowerCase();
  let score = 0;
  
  // RAM Size scoring
  if (ram.includes('64gb')) {
    score = 100;
  } else if (ram.includes('32gb')) {
    score = 90;
  } else if (ram.includes('24gb')) {
    score = 85;
  } else if (ram.includes('16gb')) {
    score = 80;
  } else if (ram.includes('12gb')) {
    score = 70;
  } else if (ram.includes('8gb')) {
    score = 60;
  } else {
    score = 40;
  }
  
  // RAM Type bonus
  if (ram.includes('ddr5')) {
    score += 5;
  } else if (ram.includes('ddr4')) {
    score += 3;
  }
  
  return Math.min(100, score);
}
