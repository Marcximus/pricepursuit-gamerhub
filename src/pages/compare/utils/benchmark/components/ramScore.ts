
import type { Product } from "@/types/product";

export function calculateRamScore(laptop: Product): number {
  if (!laptop.ram) return 0;
  
  const ram = laptop.ram.toLowerCase();
  let score = 0;
  
  // RAM Size scoring
  if (ram.includes('64gb')) {
    score = 100;
  } else if (ram.includes('48gb')) {
    score = 95;
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
  } else if (ram.includes('4gb')) {
    score = 40;
  } else {
    score = 30;
  }
  
  // RAM Type bonus
  if (ram.includes('ddr5')) {
    score += 10;
  } else if (ram.includes('ddr4')) {
    score += 5;
  } else if (ram.includes('lpddr5')) {
    score += 12;
  } else if (ram.includes('lpddr4')) {
    score += 7;
  }
  
  // RAM Speed bonus
  const speedMatch = ram.match(/(\d{3,5})\s*mhz/i);
  if (speedMatch) {
    const speed = parseInt(speedMatch[1], 10);
    if (speed >= 4800) {
      score += 10;
    } else if (speed >= 3600) {
      score += 7;
    } else if (speed >= 3200) {
      score += 5;
    } else if (speed >= 2666) {
      score += 3;
    } else if (speed >= 2133) {
      score += 1;
    }
  }
  
  return Math.min(100, score);
}
