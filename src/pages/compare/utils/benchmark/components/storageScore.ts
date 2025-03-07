
import type { Product } from "@/types/product";

export function calculateStorageScore(laptop: Product): number {
  if (!laptop.storage) return 0;
  
  const storage = laptop.storage.toLowerCase();
  let score = 0;
  
  // Storage Type scoring
  if (storage.includes('pcie gen 4') || storage.includes('pcie 4.0')) {
    score += 25;
  } else if (storage.includes('pcie gen 3') || storage.includes('pcie 3.0')) {
    score += 22;
  } else if (storage.includes('nvme')) {
    score += 20;
  } else if (storage.includes('pcie')) {
    score += 18;
  } else if (storage.includes('m.2')) {
    score += 15;
  } else if (storage.includes('ssd')) {
    score += 12;
  } else if (storage.includes('emmc')) {
    score += 7;
  } else if (storage.includes('hdd')) {
    score += 5;
  }
  
  // Storage Size scoring
  if (storage.includes('4tb')) {
    score += 75;
  } else if (storage.includes('3tb')) {
    score += 70;
  } else if (storage.includes('2tb')) {
    score += 65;
  } else if (storage.includes('1.5tb') || storage.includes('1.5 tb')) {
    score += 60;
  } else if (storage.includes('1tb')) {
    score += 55;
  } else if (storage.includes('768gb') || storage.includes('750gb')) {
    score += 50;
  } else if (storage.includes('512gb')) {
    score += 45;
  } else if (storage.includes('480gb')) {
    score += 43;
  } else if (storage.includes('256gb')) {
    score += 40;
  } else if (storage.includes('128gb')) {
    score += 30;
  } else if (storage.includes('64gb')) {
    score += 20;
  } else if (storage.includes('32gb')) {
    score += 10;
  } else {
    score += 5;
  }
  
  // Dual storage bonus
  if ((storage.includes('ssd') && storage.includes('hdd')) || 
      storage.includes('+')) {
    score += 10;
  }
  
  return Math.min(100, score);
}
