
import type { Product } from "@/types/product";

export function calculateDisplayScore(laptop: Product): number {
  if (!laptop.screen_resolution) return 0;
  
  const resolution = laptop.screen_resolution.toLowerCase();
  let score = 0;
  
  // Score based on resolution
  if (resolution.includes('4k') || 
      resolution.includes('uhd') || 
      resolution.includes('3840') || 
      resolution.includes('2160')) {
    score = 100;
  } else if (resolution.includes('2k') || 
             resolution.includes('wqhd') || 
             resolution.includes('qhd') || 
             resolution.includes('2560') || 
             resolution.includes('1440')) {
    score = 80;
  } else if (resolution.includes('fhd') || 
             resolution.includes('1080') || 
             resolution.includes('1920')) {
    score = 60;
  } else if (resolution.includes('hd') || 
             resolution.includes('720') || 
             resolution.includes('1366') || 
             resolution.includes('768')) {
    score = 40;
  } else {
    score = 20; // Base score for any resolution
  }
  
  // Bonus for high refresh rate displays
  if (laptop.screen_resolution.includes('144hz') || 
      laptop.screen_resolution.includes('144 hz')) {
    score += 15;
  } else if (laptop.screen_resolution.includes('120hz') || 
             laptop.screen_resolution.includes('120 hz')) {
    score += 10;
  } else if (laptop.screen_resolution.includes('90hz') || 
             laptop.screen_resolution.includes('90 hz')) {
    score += 5;
  }
  
  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, score));
}
