
import type { Product } from "@/types/product";

export function calculateGraphicsScore(laptop: Product): number {
  if (!laptop.graphics) return 0;
  
  const graphics = laptop.graphics.toLowerCase();
  let score = 0;
  
  // NVIDIA RTX 40 Series
  if (graphics.includes('rtx 40')) {
    // Different RTX 40 series models
    if (graphics.includes('4090')) {
      score = 100;
    } else if (graphics.includes('4080')) {
      score = 95;
    } else if (graphics.includes('4070')) {
      score = 90;
    } else if (graphics.includes('4060')) {
      score = 85;
    } else if (graphics.includes('4050')) {
      score = 80;
    } else {
      score = 90; // Generic RTX 40 Series
    }
  } 
  // NVIDIA RTX 30 Series
  else if (graphics.includes('rtx 30')) {
    if (graphics.includes('3090')) {
      score = 93;
    } else if (graphics.includes('3080')) {
      score = 88;
    } else if (graphics.includes('3070')) {
      score = 83;
    } else if (graphics.includes('3060')) {
      score = 78;
    } else if (graphics.includes('3050')) {
      score = 73;
    } else {
      score = 80; // Generic RTX 30 Series
    }
  }
  // NVIDIA RTX 20 Series
  else if (graphics.includes('rtx 20')) {
    if (graphics.includes('2080')) {
      score = 78;
    } else if (graphics.includes('2070')) {
      score = 73;
    } else if (graphics.includes('2060')) {
      score = 68;
    } else {
      score = 70; // Generic RTX 20 Series
    }
  }
  // NVIDIA GTX 16 Series
  else if (graphics.includes('gtx 16')) {
    if (graphics.includes('1660')) {
      score = 65;
    } else if (graphics.includes('1650')) {
      score = 60;
    } else {
      score = 62; // Generic GTX 16 Series
    }
  }
  // Older NVIDIA
  else if (graphics.includes('gtx 10')) {
    if (graphics.includes('1080')) {
      score = 67;
    } else if (graphics.includes('1070')) {
      score = 64;
    } else if (graphics.includes('1060')) {
      score = 61;
    } else if (graphics.includes('1050')) {
      score = 58;
    } else {
      score = 60; // Generic GTX 10 Series
    }
  }
  else if (graphics.includes('gtx')) {
    score = 55;
  }
  else if (graphics.includes('mx')) {
    if (graphics.includes('mx550')) {
      score = 53;
    } else if (graphics.includes('mx450')) {
      score = 52;
    } else if (graphics.includes('mx350')) {
      score = 51;
    } else if (graphics.includes('mx250')) {
      score = 50;
    } else if (graphics.includes('mx150')) {
      score = 49;
    } else {
      score = 50; // Generic MX Series
    }
  }
  // AMD Graphics
  else if (graphics.includes('radeon')) {
    if (graphics.includes('rx 7')) {
      score = 88;
    } else if (graphics.includes('rx 6')) {
      score = 80;
    } else if (graphics.includes('rx 5')) {
      score = 70;
    } else if (graphics.includes('vega')) {
      score = 65;
    } else {
      score = 65;
    }
  }
  // Integrated Graphics
  else if (graphics.includes('iris') || graphics.includes('xe')) {
    if (graphics.includes('iris xe max')) {
      score = 55;
    } else if (graphics.includes('iris xe')) {
      score = 52;
    } else if (graphics.includes('iris plus')) {
      score = 48;
    } else {
      score = 45;
    }
  }
  else if (graphics.includes('uhd')) {
    if (graphics.includes('750') || graphics.includes('770')) {
      score = 45;
    } else if (graphics.includes('730') || graphics.includes('710')) {
      score = 43;
    } else if (graphics.includes('630') || graphics.includes('620')) {
      score = 41;
    } else {
      score = 40;
    }
  }
  else if (graphics.includes('hd')) {
    score = 38;
  }
  // Apple Silicon
  else if (graphics.includes('m3')) {
    if (graphics.includes('ultra')) {
      score = 90;
    } else if (graphics.includes('max')) {
      score = 85;
    } else if (graphics.includes('pro')) {
      score = 80;
    } else {
      score = 75;
    }
  }
  else if (graphics.includes('m2')) {
    if (graphics.includes('max')) {
      score = 83;
    } else if (graphics.includes('pro')) {
      score = 78;
    } else {
      score = 73;
    }
  }
  else if (graphics.includes('m1')) {
    if (graphics.includes('max')) {
      score = 80;
    } else if (graphics.includes('pro')) {
      score = 75;
    } else {
      score = 70;
    }
  }
  else if (graphics.includes('arc')) {
    if (graphics.includes('a770')) {
      score = 80;
    } else if (graphics.includes('a750')) {
      score = 75;
    } else if (graphics.includes('a380')) {
      score = 65;
    } else if (graphics.includes('a370')) {
      score = 60;
    } else if (graphics.includes('a350')) {
      score = 55;
    } else {
      score = 65;
    }
  }
  
  // Memory size bonus for dedicated GPUs
  if ((graphics.includes('rtx') || graphics.includes('gtx') || graphics.includes('radeon rx')) && 
      !graphics.includes('iris') && !graphics.includes('intel') && !graphics.includes('hd')) {
    const memMatch = graphics.match(/(\d+)\s*gb/i);
    if (memMatch) {
      const memSize = parseInt(memMatch[1], 10);
      if (memSize >= 16) {
        score += 10;
      } else if (memSize >= 12) {
        score += 8;
      } else if (memSize >= 8) {
        score += 6;
      } else if (memSize >= 6) {
        score += 4;
      } else if (memSize >= 4) {
        score += 2;
      }
    }
  }
  
  return Math.min(100, Math.max(35, score)); // Ensure score is between 35-100
}
