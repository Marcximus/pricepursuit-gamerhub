import type { PriceHistory } from '@/types/product';

// Generate mock price history for the last 90 days
export function generateMockPriceHistory(productId: string, currentPrice: number): PriceHistory[] {
  const history: PriceHistory[] = [];
  const today = new Date();
  const daysToGenerate = 90;
  
  // Start with a slightly higher price and fluctuate down to current
  let basePrice = currentPrice * 1.15; // 15% higher initially
  
  for (let i = daysToGenerate; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Create price fluctuations with a general downward trend
    const daysFactor = (daysToGenerate - i) / daysToGenerate;
    const randomFluctuation = (Math.random() - 0.5) * 0.08 * basePrice; // ±8% random
    const trendDecrease = basePrice * 0.15 * daysFactor; // 15% decrease over time
    
    let price = basePrice - trendDecrease + randomFluctuation;
    
    // Add some occasional spikes (sales end)
    if (Math.random() > 0.9) {
      price *= 1.05;
    }
    
    // Add some occasional drops (flash sales)
    if (Math.random() > 0.95) {
      price *= 0.95;
    }
    
    // Ensure price doesn't go below current price (except for the last few days)
    if (i > 5) {
      price = Math.max(price, currentPrice * 1.02);
    } else {
      price = currentPrice + (Math.random() - 0.5) * currentPrice * 0.02;
    }
    
    history.push({
      id: `mock-history-${productId}-${i}`,
      product_id: productId,
      price: Math.round(price * 100) / 100,
      timestamp: date.toISOString(),
      created_at: date.toISOString(),
    });
  }
  
  return history;
}
