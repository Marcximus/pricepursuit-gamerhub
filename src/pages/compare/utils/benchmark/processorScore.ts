
import type { Product } from "@/types/product";

// Import processor scoring modules
import { calculateIntelScore } from "./processors/intelProcessorScore";
import { calculateAppleScore } from "./processors/appleProcessorScore";
import { calculateAMDScore } from "./processors/amdProcessorScore";

/**
 * Calculate processor score component of the benchmark
 */
export function calculateProcessorScoreComponent(laptop: Product): number {
  let score = 0;
  
  // Use existing processor score if available
  if (laptop.processor_score) {
    score = laptop.processor_score * 0.35;
  } else if (laptop.processor) {
    // Calculate processor score for the processor
    const processorScore = calculateProcessorScore(laptop.processor);
    score = processorScore * 0.35;
  }
  
  return score;
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
      proc.includes('celeron') || proc.includes('ultra')) {
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
