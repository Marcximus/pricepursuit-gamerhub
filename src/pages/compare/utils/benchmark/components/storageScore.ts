
import type { Product } from "@/types/product";

export function calculateStorageScore(laptop: Product): number {
  if (!laptop.storage) return 0;
  
  const storage = laptop.storage.toLowerCase();
  let score = 0;
  
  // Storage Type scoring
  if (storage.includes('nvme') || storage.includes('pcie')) {
    score += 20;
  } else if (storage.includes('ssd')) {
    score += 15;
  } else if (storage.includes('hdd')) {
    score += 5;
  }
  
  // Storage Size scoring
  if (storage.includes('2tb')) {
    score += 80;
  } else if (storage.includes('1tb')) {
    score += 70;
  } else if (storage.includes('512')) {
    score += 60;
  } else if (storage.includes('256')) {
    score += 50;
  } else {
    score += 40;
  }
  
  return Math.min(100, score);
}
