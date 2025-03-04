
import type { Product } from "@/types/product";
import { calculateProcessorScoreComponent } from "./processorScore";
import { calculateRamScoreComponent } from "./ramScore";
import { calculateStorageScoreComponent } from "./storageScore";
import { calculateGraphicsScoreComponent } from "./graphicsScore";
import { calculateDisplayScoreComponent } from "./displayScore";

/**
 * Calculate a benchmark score for a laptop based on its specifications
 * This is similar to the calculation in the edge function but more focused on frontend availability
 */
export function calculateBenchmarkScore(laptop: Product): number {
  // Gather scores from individual components
  const processorScore = calculateProcessorScoreComponent(laptop);
  const ramScore = calculateRamScoreComponent(laptop);
  const storageScore = calculateStorageScoreComponent(laptop);
  const graphicsScore = calculateGraphicsScoreComponent(laptop);
  const displayScore = calculateDisplayScoreComponent(laptop);
  
  // Sum all component scores
  const totalScore = processorScore + ramScore + storageScore + graphicsScore + displayScore;
  
  return Math.round(totalScore);
}

/**
 * Calculate processor score based on processor type
 * This is a simplified version that can be used on the frontend
 */
export function calculateProcessorScore(processor: string): number {
  if (!processor) return 40;
  
  processor = processor.toLowerCase();
  
  // Intel Core i9
  if (processor.includes('i9')) {
    return 90;
  }
  // AMD Ryzen 9
  if (processor.includes('ryzen 9')) {
    return 88;
  }
  // Apple M3 variants
  if (processor.includes('m3 ultra')) {
    return 95;
  }
  if (processor.includes('m3 max')) {
    return 92;
  }
  if (processor.includes('m3 pro')) {
    return 88;
  }
  if (processor.includes('m3')) {
    return 85;
  }
  // Intel Core i7
  if (processor.includes('i7')) {
    return 80;
  }
  // AMD Ryzen 7
  if (processor.includes('ryzen 7')) {
    return 78;
  }
  // Apple M2 variants
  if (processor.includes('m2 max')) {
    return 85;
  }
  if (processor.includes('m2 pro')) {
    return 82;
  }
  if (processor.includes('m2')) {
    return 78;
  }
  // Intel Core i5
  if (processor.includes('i5')) {
    return 70;
  }
  // AMD Ryzen 5
  if (processor.includes('ryzen 5')) {
    return 68;
  }
  // Apple M1 variants
  if (processor.includes('m1')) {
    return 72;
  }
  // Intel Core i3
  if (processor.includes('i3')) {
    return 50;
  }
  // AMD Ryzen 3
  if (processor.includes('ryzen 3')) {
    return 48;
  }
  // Budget processors
  if (processor.includes('celeron') || processor.includes('pentium')) {
    return 30;
  }
  
  // Default for unknown processors
  return 40;
}
