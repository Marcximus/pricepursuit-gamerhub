
import type { Product } from "@/types/product";

export function calculateGraphicsScore(laptop: Product): number {
  if (!laptop.graphics) return 0;
  
  const graphics = laptop.graphics.toLowerCase();
  let score = 0;
  
  // NVIDIA RTX 40 Series
  if (graphics.includes('rtx 40')) {
    score = 90;
  } 
  // NVIDIA RTX 30 Series
  else if (graphics.includes('rtx 30')) {
    score = 80;
  }
  // NVIDIA RTX 20 Series or GTX 16 Series
  else if (graphics.includes('rtx 20') || graphics.includes('gtx 16')) {
    score = 70;
  }
  // Older NVIDIA
  else if (graphics.includes('gtx')) {
    score = 60;
  }
  // AMD Graphics
  else if (graphics.includes('radeon')) {
    if (graphics.includes('7')) {
      score = 85;
    } else if (graphics.includes('6')) {
      score = 75;
    } else {
      score = 65;
    }
  }
  // Integrated Graphics
  else if (graphics.includes('iris') || graphics.includes('xe')) {
    score = 50;
  }
  else if (graphics.includes('uhd') || graphics.includes('hd')) {
    score = 40;
  }
  // Apple Silicon
  else if (graphics.includes('m3')) {
    score = 85;
  }
  else if (graphics.includes('m2')) {
    score = 80;
  }
  else if (graphics.includes('m1')) {
    score = 75;
  }
  
  return Math.min(100, Math.max(40, score)); // Ensure score is between 40-100
}
