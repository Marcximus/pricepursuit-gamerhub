
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define laptop comparison type
type LaptopData = {
  id: string;
  brand: string;
  model: string;
  title: string;
  processor: string;
  ram: string;
  storage: string;
  graphics: string;
  screen_size: string;
  screen_resolution: string;
  price: number;
  rating: number;
  rating_count: number;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { laptopLeft, laptopRight } = await req.json();

    if (!laptopLeft || !laptopRight) {
      throw new Error('Two laptops are required for comparison');
    }
    
    // Create analysis of the two laptops
    const result = compareData(laptopLeft, laptopRight);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  } catch (error) {
    console.error('Error comparing laptops:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});

// Compare two laptops and return analysis
function compareData(laptopLeft: LaptopData, laptopRight: LaptopData) {
  // Helper functions for comparison
  const extractRamGB = (ramString: string): number => {
    const match = ramString.match(/(\d+)\s*GB/i);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  const extractStorageGB = (storageString: string): number => {
    const tbMatch = storageString.match(/(\d+)\s*TB/i);
    if (tbMatch) return parseInt(tbMatch[1], 10) * 1000;
    
    const gbMatch = storageString.match(/(\d+)\s*GB/i);
    return gbMatch ? parseInt(gbMatch[1], 10) : 0;
  };
  
  const isHigherTier = (processor: string): number => {
    // Higher score means better processor
    if (!processor) return 0;
    const p = processor.toLowerCase();
    
    if (p.includes('i9') || p.includes('ryzen 9') || p.includes('m3 max') || p.includes('m3 ultra')) return 9;
    if (p.includes('i7') || p.includes('ryzen 7') || p.includes('m3 pro') || p.includes('m2 max')) return 8;
    if (p.includes('i5') || p.includes('ryzen 5') || p.includes('m3') || p.includes('m2 pro')) return 7;
    if (p.includes('i3') || p.includes('ryzen 3') || p.includes('m2') || p.includes('m1 pro')) return 6;
    if (p.includes('m1')) return 5;
    if (p.includes('celeron') || p.includes('pentium')) return 2;
    
    return 4; // Default for unknown processors
  };
  
  const getGpuTier = (gpu: string): number => {
    if (!gpu) return 0;
    const g = gpu.toLowerCase();
    
    if (g.includes('rtx 40') || g.includes('rtx 30')) return 9;
    if (g.includes('rtx 20') || g.includes('rtx')) return 8;
    if (g.includes('gtx 16') || g.includes('radeon rx')) return 7;
    if (g.includes('gtx') || g.includes('mx')) return 6;
    if (g.includes('iris xe') || g.includes('m3') || g.includes('m2')) return 5;
    if (g.includes('intel') && g.includes('graphics')) return 3;
    if (g.includes('integrated') || g.includes('uhd')) return 2;
    
    return 4; // Default for unknown GPUs
  };
  
  // Compare specs and calculate scores
  const processorScoreLeft = isHigherTier(laptopLeft.processor);
  const processorScoreRight = isHigherTier(laptopRight.processor);
  
  const ramScoreLeft = extractRamGB(laptopLeft.ram || '0 GB');
  const ramScoreRight = extractRamGB(laptopRight.ram || '0 GB');
  
  const storageScoreLeft = extractStorageGB(laptopLeft.storage || '0 GB');
  const storageScoreRight = extractStorageGB(laptopRight.storage || '0 GB');
  
  const gpuScoreLeft = getGpuTier(laptopLeft.graphics);
  const gpuScoreRight = getGpuTier(laptopRight.graphics);
  
  // Calculate weighted total scores
  const performanceScoreLeft = (processorScoreLeft * 0.4) + (ramScoreLeft * 0.02) + (storageScoreLeft * 0.005) + (gpuScoreLeft * 0.3);
  const performanceScoreRight = (processorScoreRight * 0.4) + (ramScoreRight * 0.02) + (storageScoreRight * 0.005) + (gpuScoreRight * 0.3);
  
  // Calculate value scores (performance per dollar)
  const valueScoreLeft = laptopLeft.price > 0 ? performanceScoreLeft / laptopLeft.price * 1000 : 0;
  const valueScoreRight = laptopRight.price > 0 ? performanceScoreRight / laptopRight.price * 1000 : 0;
  
  // Determine advantages for each laptop
  const advantagesLeft = [];
  const advantagesRight = [];
  
  // Processor comparison
  if (processorScoreLeft > processorScoreRight) {
    advantagesLeft.push(`Better processor (${laptopLeft.processor})`);
  } else if (processorScoreLeft < processorScoreRight) {
    advantagesRight.push(`Better processor (${laptopRight.processor})`);
  }
  
  // RAM comparison
  if (ramScoreLeft > ramScoreRight) {
    advantagesLeft.push(`More RAM (${laptopLeft.ram})`);
  } else if (ramScoreLeft < ramScoreRight) {
    advantagesRight.push(`More RAM (${laptopRight.ram})`);
  }
  
  // Storage comparison
  if (storageScoreLeft > storageScoreRight) {
    advantagesLeft.push(`Larger storage (${laptopLeft.storage})`);
  } else if (storageScoreLeft < storageScoreRight) {
    advantagesRight.push(`Larger storage (${laptopRight.storage})`);
  }
  
  // GPU comparison
  if (gpuScoreLeft > gpuScoreRight) {
    advantagesLeft.push(`Better graphics (${laptopLeft.graphics})`);
  } else if (gpuScoreLeft < gpuScoreRight) {
    advantagesRight.push(`Better graphics (${laptopRight.graphics})`);
  }
  
  // Price comparison
  if (laptopLeft.price < laptopRight.price) {
    advantagesLeft.push(`Lower price ($${laptopLeft.price.toFixed(2)})`);
  } else if (laptopLeft.price > laptopRight.price) {
    advantagesRight.push(`Lower price ($${laptopRight.price.toFixed(2)})`);
  }
  
  // Rating comparison
  if (laptopLeft.rating > laptopRight.rating) {
    advantagesLeft.push(`Higher customer rating (${laptopLeft.rating}/5)`);
  } else if (laptopLeft.rating < laptopRight.rating) {
    advantagesRight.push(`Higher customer rating (${laptopRight.rating}/5)`);
  }
  
  // Determine overall winner
  let winner: 'left' | 'right' | 'tie' = 'tie';
  let winningReason = '';
  
  if (performanceScoreLeft > performanceScoreRight && valueScoreLeft >= valueScoreRight) {
    winner = 'left';
    winningReason = 'better performance and value';
  } else if (performanceScoreRight > performanceScoreLeft && valueScoreRight >= valueScoreLeft) {
    winner = 'right';
    winningReason = 'better performance and value';
  } else if (performanceScoreLeft > performanceScoreRight * 1.3) {
    winner = 'left';
    winningReason = 'significantly better performance';
  } else if (performanceScoreRight > performanceScoreLeft * 1.3) {
    winner = 'right';
    winningReason = 'significantly better performance';
  } else if (valueScoreLeft > valueScoreRight * 1.3) {
    winner = 'left';
    winningReason = 'much better value for money';
  } else if (valueScoreRight > valueScoreLeft * 1.3) {
    winner = 'right';
    winningReason = 'much better value for money';
  } else if (advantagesLeft.length > advantagesRight.length + 2) {
    winner = 'left';
    winningReason = 'more advantages overall';
  } else if (advantagesRight.length > advantagesLeft.length + 2) {
    winner = 'right';
    winningReason = 'more advantages overall';
  }
  
  // Generate comparison analysis
  const leftName = `${laptopLeft.brand} ${laptopLeft.model}`;
  const rightName = `${laptopRight.brand} ${laptopRight.model}`;
  
  let analysis = '';
  
  if (winner === 'tie') {
    analysis = `Both the ${leftName} and ${rightName} have their strengths. `;
    
    if (performanceScoreLeft > performanceScoreRight) {
      analysis += `The ${leftName} offers better performance, while the ${rightName} provides better value for money. `;
    } else if (performanceScoreRight > performanceScoreLeft) {
      analysis += `The ${rightName} offers better performance, while the ${leftName} provides better value for money. `;
    } else {
      analysis += `They are quite evenly matched in terms of performance and value. `;
    }
    
    analysis += `Your choice should depend on your specific needs and budget.`;
  } else {
    const winnerName = winner === 'left' ? leftName : rightName;
    const loserName = winner === 'left' ? rightName : leftName;
    
    analysis = `The ${winnerName} is the better choice overall due to ${winningReason}. `;
    
    if (winner === 'left' && laptopLeft.price > laptopRight.price) {
      analysis += `While it's more expensive than the ${loserName}, the performance difference justifies the higher price. `;
    } else if (winner === 'right' && laptopRight.price > laptopLeft.price) {
      analysis += `While it's more expensive than the ${loserName}, the performance difference justifies the higher price. `;
    }
    
    if (winner === 'left' && valueScoreRight > valueScoreLeft) {
      analysis += `However, if you're on a tight budget, the ${loserName} offers better value for money. `;
    } else if (winner === 'right' && valueScoreLeft > valueScoreRight) {
      analysis += `However, if you're on a tight budget, the ${loserName} offers better value for money. `;
    }
  }
  
  // Generate recommendation
  let recommendation = '';
  
  if (winner === 'tie') {
    if (laptopLeft.price < laptopRight.price) {
      recommendation = `If you're budget-conscious, choose the ${leftName}. If you need the best performance, the ${rightName} might be worth the extra cost.`;
    } else if (laptopRight.price < laptopLeft.price) {
      recommendation = `If you're budget-conscious, choose the ${rightName}. If you need the best performance, the ${leftName} might be worth the extra cost.`;
    } else {
      recommendation = `Both laptops are excellent choices. Consider your brand preference or specific features that matter most to you.`;
    }
  } else {
    const winnerName = winner === 'left' ? leftName : rightName;
    recommendation = `The ${winnerName} is the recommended choice for most users based on this comparison.`;
  }
  
  // Generate value for money analysis
  const valueForMoneyLeft = laptopLeft.price > 0 
    ? `The ${leftName} offers ${valueScoreLeft > valueScoreRight ? 'better' : 'good'} value at $${laptopLeft.price.toFixed(2)}.`
    : `Price information unavailable for the ${leftName}.`;
    
  const valueForMoneyRight = laptopRight.price > 0 
    ? `The ${rightName} offers ${valueScoreRight > valueScoreLeft ? 'better' : 'good'} value at $${laptopRight.price.toFixed(2)}.`
    : `Price information unavailable for the ${rightName}.`;
  
  // Return the complete comparison result
  return {
    winner,
    analysis,
    advantages: {
      left: advantagesLeft,
      right: advantagesRight
    },
    valueForMoney: {
      left: valueForMoneyLeft,
      right: valueForMoneyRight
    },
    recommendation,
    scores: {
      performanceLeft: performanceScoreLeft,
      performanceRight: performanceScoreRight,
      valueLeft: valueScoreLeft,
      valueRight: valueScoreRight
    }
  };
}
