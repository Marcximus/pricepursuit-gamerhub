
import type { Product } from "@/types/product";
import { calculateProcessorScore } from "./components/processorScore";
import { calculateGraphicsScore } from "./components/graphicsScore";
import { calculateRamScore } from "./components/ramScore";
import { calculateStorageScore } from "./components/storageScore";
import { calculateDisplayScore } from "./displayScore";

export function calculateBenchmarkScore(laptop: Product): number {
  if (!laptop) return 0;
  
  // Calculate individual component scores
  const processorScore = calculateProcessorScore(laptop) * 0.35; // 35% weight
  const graphicsScore = calculateGraphicsScore(laptop) * 0.25;   // 25% weight
  const ramScore = calculateRamScore(laptop) * 0.20;             // 20% weight
  const storageScore = calculateStorageScore(laptop) * 0.15;     // 15% weight
  const displayScore = calculateDisplayScore(laptop) * 0.05;     // 5% weight
  
  // Calculate total score
  const totalScore = processorScore + graphicsScore + ramScore + storageScore + displayScore;
  
  // Only return a score if we have enough data
  const hasEnoughData = laptop.processor || laptop.graphics || laptop.ram || laptop.storage;
  if (!hasEnoughData) return 0;
  
  // Ensure final score is between 0-100
  return Math.min(100, Math.max(0, Math.round(totalScore)));
}
