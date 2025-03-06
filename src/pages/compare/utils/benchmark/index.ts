import type { Product } from "@/types/product";

// Import individual score components
import { calculateProcessorScoreComponent } from "./processorScore";
import { calculateGraphicsScoreComponent } from "./graphicsScore";
import { calculateRamScoreComponent } from "./ramScore";
import { calculateStorageScoreComponent } from "./storageScore";
import { calculateDisplayScoreComponent } from "./displayScore";

// Import processor scoring modules
import { calculateIntelScore } from "./processors/intelProcessorScore";
import { calculateAppleScore } from "./processors/appleProcessorScore";
import { calculateAMDScore } from "./processors/amdProcessorScore";

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
 */
export function calculateProcessorScore(processor: string): number {
  if (!processor) return 40;
  
  const proc = processor.toLowerCase();
  let score = 0;
  
  // Try each processor type calculator
  if (proc.includes('intel') || proc.includes('i3') || proc.includes('i5') || 
      proc.includes('i7') || proc.includes('i9') || proc.includes('pentium') || 
      proc.includes('celeron')) {
    score = calculateIntelScore(processor);
  }
  else if (proc.includes('m1') || proc.includes('m2') || proc.includes('m3')) {
    score = calculateAppleScore(processor);
  }
  else if (proc.includes('ryzen') || proc.includes('amd')) {
    score = calculateAMDScore(processor);
  }
  
  // HX models (high performance) get a boost
  if (proc.includes('hx')) {
    score += 5;
  }
  // H models (high performance) get a small boost
  else if (proc.includes(' h') || proc.includes('-h')) {
    score += 3;
  }
  
  // Generic fallbacks if no score was calculated
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
