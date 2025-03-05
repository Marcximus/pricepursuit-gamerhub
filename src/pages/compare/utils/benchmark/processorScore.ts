
import { calculateProcessorScore } from "./index";
import type { Product } from "@/types/product";

/**
 * Calculate processor score component of the benchmark
 */
export function calculateProcessorScoreComponent(laptop: Product): number {
  let score = 0;
  
  // Use existing processor score if available
  if (laptop.processor_score) {
    score = laptop.processor_score * 0.35;
  } else if (laptop.processor) {
    // Prioritize Ultra processors for higher scoring
    const processor = laptop.processor.toLowerCase();
    
    if (processor.includes('ultra')) {
      // Special case for Intel Core Ultra processors
      if (processor.includes('ultra 9')) {
        score = 95 * 0.35;
      } else if (processor.includes('ultra 7')) {
        score = 93 * 0.35; 
      } else if (processor.includes('ultra 5')) {
        score = 91 * 0.35;
      } else {
        score = 90 * 0.35; // Generic Ultra
      }
    } else {
      // Calculate processor score for non-Ultra processors
      const processorScore = calculateProcessorScore(laptop.processor);
      score = processorScore * 0.35;
    }
  }
  
  return score;
}
