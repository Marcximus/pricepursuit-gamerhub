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
  
  // Ensure the score is never below 10 if we have any data
  const finalScore = Math.max(10, score * variation);
  
  return Math.round(finalScore);
}

/**
 * Calculate a processor score based on common naming patterns
 * Used as part of the benchmark score
 */
export function calculateProcessorScore(processor: string): number {
  if (!processor) return 40;
  
  let score = 0;
  const proc = processor.toLowerCase();
  
  // Intel Core Ultra (newest series)
  if (proc.includes('core ultra') || proc.includes('intel ultra')) {
    if (proc.includes('9')) score = 95;
    else if (proc.includes('7')) score = 93;
    else if (proc.includes('5')) score = 91;
    else score = 90; // Generic Ultra
  }
  
  // Apple processors
  else if (proc.includes('m3') || proc.includes('m 3')) {
    if (proc.includes('ultra')) score = 95;
    else if (proc.includes('max')) score = 90;
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
  
  // Intel Core generations
  else if (proc.includes('i9')) {
    // 14th/15th gen
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 88;
    // 13th gen
    else if (proc.includes('13') || proc.includes('13th')) score = 85;
    // 12th gen
    else if (proc.includes('12') || proc.includes('12th')) score = 82;
    // 11th gen
    else if (proc.includes('11') || proc.includes('11th')) score = 78;
    // 10th gen
    else if (proc.includes('10') || proc.includes('10th')) score = 75;
    // Older gens
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 70;
    else score = 65;
  }
  else if (proc.includes('i7')) {
    // 14th/15th gen
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 85;
    // 13th gen
    else if (proc.includes('13') || proc.includes('13th')) score = 82;
    // 12th gen
    else if (proc.includes('12') || proc.includes('12th')) score = 78;
    // 11th gen
    else if (proc.includes('11') || proc.includes('11th')) score = 75;
    // 10th gen
    else if (proc.includes('10') || proc.includes('10th')) score = 72;
    // Older gens
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 68;
    else score = 65;
  }
  else if (proc.includes('i5')) {
    // 14th/15th gen
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 80;
    // 13th gen
    else if (proc.includes('13') || proc.includes('13th')) score = 78;
    // 12th gen
    else if (proc.includes('12') || proc.includes('12th')) score = 75;
    // 11th gen
    else if (proc.includes('11') || proc.includes('11th')) score = 72;
    // 10th gen
    else if (proc.includes('10') || proc.includes('10th')) score = 68;
    // Older gens
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 65;
    else score = 60;
  }
  else if (proc.includes('i3')) {
    // 14th/15th gen
    if (proc.includes('14') || proc.includes('15') || proc.includes('14th') || proc.includes('15th')) score = 70;
    // 13th gen
    else if (proc.includes('13') || proc.includes('13th')) score = 68;
    // 12th gen
    else if (proc.includes('12') || proc.includes('12th')) score = 65;
    // 11th gen
    else if (proc.includes('11') || proc.includes('11th')) score = 62;
    // 10th gen
    else if (proc.includes('10') || proc.includes('10th')) score = 58;
    // Older gens
    else if (proc.includes('9th') || proc.includes('9') || proc.includes('8th') || proc.includes('8')) score = 55;
    else score = 50;
  }
  
  // AMD Ryzen
  else if (proc.includes('ryzen 9')) {
    // 8000 series
    if (proc.includes('8') || proc.includes('8000')) score = 88;
    // 7000 series
    else if (proc.includes('7') || proc.includes('7000')) score = 85;
    // 6000 series
    else if (proc.includes('6') || proc.includes('6000')) score = 82;
    // 5000 series
    else if (proc.includes('5') || proc.includes('5000')) score = 80;
    // 4000 series
    else if (proc.includes('4') || proc.includes('4000')) score = 75;
    // 3000 series
    else if (proc.includes('3') || proc.includes('3000')) score = 70;
    else score = 65;
  }
  else if (proc.includes('ryzen 7')) {
    // 8000 series
    if (proc.includes('8') || proc.includes('8000')) score = 85;
    // 7000 series
    else if (proc.includes('7') || proc.includes('7000')) score = 82;
    // 6000 series
    else if (proc.includes('6') || proc.includes('6000')) score = 78;
    // 5000 series
    else if (proc.includes('5') || proc.includes('5000')) score = 75;
    // 4000 series
    else if (proc.includes('4') || proc.includes('4000')) score = 70;
    // 3000 series
    else if (proc.includes('3') || proc.includes('3000')) score = 65;
    else score = 60;
  }
  else if (proc.includes('ryzen 5')) {
    // 8000 series
    if (proc.includes('8') || proc.includes('8000')) score = 80;
    // 7000 series
    else if (proc.includes('7') || proc.includes('7000')) score = 78;
    // 6000 series
    else if (proc.includes('6') || proc.includes('6000')) score = 75;
    // 5000 series
    else if (proc.includes('5') || proc.includes('5000')) score = 72;
    // 4000 series
    else if (proc.includes('4') || proc.includes('4000')) score = 68;
    // 3000 series
    else if (proc.includes('3') || proc.includes('3000')) score = 65;
    else score = 60;
  }
  else if (proc.includes('ryzen 3')) {
    // 8000 series
    if (proc.includes('8') || proc.includes('8000')) score = 70;
    // 7000 series
    else if (proc.includes('7') || proc.includes('7000')) score = 68;
    // 6000 series
    else if (proc.includes('6') || proc.includes('6000')) score = 65;
    // 5000 series
    else if (proc.includes('5') || proc.includes('5000')) score = 62;
    // 4000 series
    else if (proc.includes('4') || proc.includes('4000')) score = 58;
    // 3000 series
    else if (proc.includes('3') || proc.includes('3000')) score = 55;
    else score = 50;
  }
  
  // Budget processors
  else if (proc.includes('pentium')) {
    // Newer vs older Pentium
    if (proc.includes('gold')) score = 45;
    else if (proc.includes('silver')) score = 40;
    else score = 35;
  }
  else if (proc.includes('celeron')) {
    // Newer vs older Celeron
    if (proc.includes('n5') || proc.includes('n6')) score = 35;
    else if (proc.includes('n4')) score = 30;
    else score = 25;
  }
  
  // HX models (high performance) get a boost
  if (proc.includes('hx')) {
    score += 5;
  }
  
  // H models (high performance) get a small boost
  else if (proc.includes(' h') || proc.includes('-h')) {
    score += 3;
  }
  
  // Generic fallbacks
  if (score === 0) {
    if (proc.includes('amd')) {
      score = 50;
    }
    else if (proc.includes('intel')) {
      score = 50;
    }
    else {
      score = 40; // Unknown processor
    }
  }
  
  // Cap at 100
  return Math.min(100, score);
}

// Export the function for use in other files
calculateBenchmarkScore.calculateProcessorScore = calculateProcessorScore;
