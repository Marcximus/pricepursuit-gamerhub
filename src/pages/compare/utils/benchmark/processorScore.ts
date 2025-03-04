
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
    // Calculate processor score if not available
    const processorScore = calculateProcessorScore(laptop.processor);
    score = processorScore * 0.35;
  }
  
  return score;
}
