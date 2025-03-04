
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

/**
 * Update price history if price has changed
 */
export async function updatePriceHistory(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  currentPrice: number | null | undefined,
  extractedPrice: number
): Promise<boolean> {
  // Only update price history if:
  // Current price in DB is not null/undefined AND new price is different from current price
  if (currentPrice !== null && 
      currentPrice !== undefined && 
      Math.abs(currentPrice - extractedPrice) > 0.01) {
    
    await supabase
      .from('price_history')
      .insert({
        product_id: productId,
        price: extractedPrice,
        timestamp: new Date().toISOString()
      });
    
    return true;
  }
  
  return false;
}
