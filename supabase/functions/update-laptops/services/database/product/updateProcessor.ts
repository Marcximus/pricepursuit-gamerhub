
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { calculateBenchmarkScore, calculateProcessorScore } from "../../scoring/scoreCalculator.ts";
import { extractReviewData } from "../../extractors/reviewExtractor.ts";

/**
 * Prepare product update data based on API content and existing product
 */
export function prepareProductUpdates(
  existingProduct: any,
  content: any,
  extractedPrice: number | null,
  imageUrl: string | null,
  enhancedSpecs: Record<string, any>
): Record<string, any> {
  // Initialize updates with timestamp and status
  const updates: Record<string, any> = {
    last_checked: new Date().toISOString(),
    update_status: 'completed'
  };
  
  // Add price update if needed
  if (extractedPrice !== null && extractedPrice !== undefined) {
    if (existingProduct.current_price === null || 
        existingProduct.current_price === undefined || 
        Math.abs(existingProduct.current_price - extractedPrice) > 0.01) {
      updates.current_price = extractedPrice;
    }
  }
  
  // Add image URL if needed
  if (imageUrl && (!existingProduct.image_url || existingProduct.image_url !== imageUrl)) {
    updates.image_url = imageUrl;
  }
  
  // Add product URL if missing
  if (!existingProduct.product_url) {
    const productUrl = content.url || `https://www.amazon.com/dp/${existingProduct.asin}`;
    updates.product_url = productUrl;
  }
  
  // Add enhanced specs if available
  if (enhancedSpecs && Object.keys(enhancedSpecs).length > 0) {
    Object.assign(updates, enhancedSpecs);
  }
  
  // Extract and add review data if available
  const reviewData = extractReviewData(content);
  if (reviewData) {
    updates.review_data = reviewData;
    updates.average_rating = content.rating || null;
    updates.total_reviews = content.reviews_count || 0;
  }
  
  // Update processor score if processor changed
  if (updates.processor && updates.processor !== existingProduct.processor) {
    updates.processor_score = calculateProcessorScore(updates.processor);
  }
  
  // Update benchmark score if relevant specs changed
  if (updates.processor || updates.ram || updates.storage || updates.graphics) {
    updates.benchmark_score = calculateBenchmarkScore({
      ...existingProduct,
      ...updates
    });
  }
  
  return updates;
}

/**
 * Apply updates to product in database
 */
export async function applyProductUpdates(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  updates: Record<string, any>
): Promise<boolean> {
  try {
    // Only update if we have changes beyond just the status and timestamp
    if (Object.keys(updates).length <= 2) {
      return false;
    }
    
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId);
    
    if (error) {
      console.error(`Error updating product ${productId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in applyProductUpdates for ${productId}:`, error);
    return false;
  }
}
