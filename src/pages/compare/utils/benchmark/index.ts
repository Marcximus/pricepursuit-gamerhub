import type { Product } from "@/types/product";

// Import individual score components
import { calculateProcessorScoreComponent } from "./processorScore";
import { calculateGraphicsScoreComponent } from "./graphicsScore";
import { calculateRamScoreComponent } from "./ramScore";
import { calculateStorageScoreComponent } from "./storageScore";
import { calculateDisplayScoreComponent } from "./displayScore";

/**
 * Calculate a benchmark score for a laptop
 * This is used to determine the winner in the comparison
 */
export function calculateBenchmarkScore(laptop: Product): number {
  // Base score is 0
  let score = 0;
  
  // Calculate components of score
  const processorScore = calculateProcessorScoreComponent(laptop);
  const graphicsScore = calculateGraphicsScoreComponent(laptop);
  const ramScore = calculateRamScoreComponent(laptop);
  const storageScore = calculateStorageScoreComponent(laptop);
  const displayScore = calculateDisplayScoreComponent(laptop);
  
  // Sum up components
  score = processorScore + graphicsScore + ramScore + storageScore + displayScore;
  
  // Apply small random variation (±2%) to avoid exact ties
  // but keep it deterministic based on the laptop's ID
  const idSeed = laptop.id ? parseInt(laptop.id.toString().slice(-4), 10) / 10000 : 0;
  const variation = 1 + (idSeed * 0.04 - 0.02); // ±2% variation
  
  return Math.round(score * variation);
}

/**
 * Calculate a processor score based on common naming patterns
 * Used as part of the benchmark score
 */
export function calculateProcessorScore(processor: string): number {
  let score = 0;
  const proc = processor.toLowerCase();
  
  // Apple processors
  if (proc.includes('m3') || proc.includes('m 3')) {
    if (proc.includes('max')) score = 90;
    else if (proc.includes('pro')) score = 85;
    else score = 80;
  }
  else if (proc.includes('m2') || proc.includes('m 2')) {
    if (proc.includes('max')) score = 85;
    else if (proc.includes('pro')) score = 80;
    else score = 75;
  }
  else if (proc.includes('m1') || proc.includes('m 1')) {
    if (proc.includes('max')) score = 75;
    else if (proc.includes('pro')) score = 70;
    else score = 65;
  }
  
  // Intel Core Ultra
  else if (proc.includes('core ultra')) {
    if (proc.includes('9')) score = 90;
    else if (proc.includes('7')) score = 85;
    else if (proc.includes('5')) score = 80;
  }
  
  // Intel Core i9/i7/i5/i3
  else if (proc.includes('i9')) {
    if (proc.includes('14') || proc.includes('13')) score = 85;
    else if (proc.includes('12') || proc.includes('11')) score = 80;
    else score = 75;
  }
  else if (proc.includes('i7')) {
    if (proc.includes('14') || proc.includes('13')) score = 80;
    else if (proc.includes('12') || proc.includes('11')) score = 75;
    else score = 70;
  }
  else if (proc.includes('i5')) {
    if (proc.includes('14') || proc.includes('13')) score = 75;
    else if (proc.includes('12') || proc.includes('11')) score = 70;
    else score = 65;
  }
  else if (proc.includes('i3')) {
    if (proc.includes('14') || proc.includes('13')) score = 65;
    else if (proc.includes('12') || proc.includes('11')) score = 60;
    else score = 55;
  }
  
  // AMD Ryzen
  else if (proc.includes('ryzen 9')) {
    if (proc.includes('7') || proc.includes('8')) score = 85; // 7000/8000 series
    else if (proc.includes('5') || proc.includes('6')) score = 80;
    else score = 75;
  }
  else if (proc.includes('ryzen 7')) {
    if (proc.includes('7') || proc.includes('8')) score = 80;
    else if (proc.includes('5') || proc.includes('6')) score = 75;
    else score = 70;
  }
  else if (proc.includes('ryzen 5')) {
    if (proc.includes('7') || proc.includes('8')) score = 75;
    else if (proc.includes('5') || proc.includes('6')) score = 70;
    else score = 65;
  }
  else if (proc.includes('ryzen 3')) {
    if (proc.includes('7') || proc.includes('8')) score = 65;
    else if (proc.includes('5') || proc.includes('6')) score = 60;
    else score = 55;
  }
  
  // Budget processors
  else if (proc.includes('pentium')) {
    score = 40;
  }
  else if (proc.includes('celeron')) {
    score = 30;
  }
  
  // Generic fallbacks
  else if (proc.includes('amd')) {
    score = 50;
  }
  else if (proc.includes('intel')) {
    score = 50;
  }
  else {
    score = 30; // Unknown processor
  }
  
  return score;
}
