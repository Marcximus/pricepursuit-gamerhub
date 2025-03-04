
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { LaptopUpdate, UpdateResult } from "../../types.ts";
import { extractPrice } from "../extractors/priceExtractor.ts";
import { extractImageUrl } from "../extractors/imageExtractor.ts";
import { extractReviewData } from "../extractors/reviewExtractor.ts";
import { extractEnhancedSpecs } from "../extractors/specsExtractor.ts";
import { calculateProcessorScore, calculateBenchmarkScore } from "../scoring/scoreCalculator.ts";

/**
 * Update a laptop product in the database with enhanced data processing
 */
export async function updateProductInDatabase(
  supabase: ReturnType<typeof createClient>,
  laptop: LaptopUpdate,
  apiData: any
): Promise<UpdateResult> {
  try {
    console.log(`Processing data for ASIN ${laptop.asin}...`);
    
    // Get the current product data from the database
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', laptop.id)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching existing product ${laptop.asin}:`, fetchError);
      return { 
        success: false, 
        error: fetchError.message,
        priceUpdated: false,
        imageUpdated: false,
        specsUpdated: false
      };
    }
    
    // Extract product data from API response
    const content = apiData.results[0].content;
    
    // Process the data with enhanced extraction
    const updates: Record<string, any> = {
      last_checked: new Date().toISOString(),
      update_status: 'completed'
    };
    
    let priceUpdated = false;
    let imageUpdated = false;
    let specsUpdated = false;
    
    // Price extraction (with safety checks)
    const extractedPrice = extractPrice(content);
    if (extractedPrice !== null && extractedPrice !== undefined) {
      // Only update price if:
      // 1. Current price in DB is null/undefined, OR
      // 2. New price is different from current price
      if (existingProduct.current_price === null || 
          existingProduct.current_price === undefined || 
          Math.abs(existingProduct.current_price - extractedPrice) > 0.01) {
        
        updates.current_price = extractedPrice;
        priceUpdated = true;
        
        // If price changed, store in price history
        if (existingProduct.current_price !== null && 
            existingProduct.current_price !== undefined) {
          await supabase
            .from('price_history')
            .insert({
              product_id: laptop.id,
              price: extractedPrice,
              timestamp: new Date().toISOString()
            });
        }
        
        console.log(`Updated price for ${laptop.asin}: $${existingProduct.current_price} -> $${extractedPrice}`);
      }
    }
    
    // Image URL extraction (with safety checks)
    const imageUrl = extractImageUrl(content);
    if (imageUrl && (!existingProduct.image_url || existingProduct.image_url !== imageUrl)) {
      updates.image_url = imageUrl;
      imageUpdated = true;
      console.log(`Updated image for ${laptop.asin}: ${imageUrl}`);
    }
    
    // Extract and update product_url if missing
    if (!existingProduct.product_url) {
      const productUrl = content.url || `https://www.amazon.com/dp/${laptop.asin}`;
      updates.product_url = productUrl;
    }
    
    // Extract enhanced specifications
    const enhancedSpecs = extractEnhancedSpecs(content, existingProduct);
    
    // Only update specs if we actually got new information
    if (enhancedSpecs && Object.keys(enhancedSpecs).length > 0) {
      Object.assign(updates, enhancedSpecs);
      specsUpdated = true;
      console.log(`Updated specifications for ${laptop.asin}:`, 
        Object.keys(enhancedSpecs).join(', '));
    }
    
    // Extract review data if available
    const reviewData = extractReviewData(content);
    if (reviewData) {
      updates.review_data = reviewData;
      updates.average_rating = content.rating || null;
      updates.total_reviews = content.reviews_count || 0;
    }
    
    // Update processor score and benchmark score if we have processor info
    if (updates.processor && updates.processor !== existingProduct.processor) {
      updates.processor_score = calculateProcessorScore(updates.processor);
    }
    
    if (updates.processor || updates.ram || updates.storage || updates.graphics) {
      updates.benchmark_score = calculateBenchmarkScore({
        ...existingProduct,
        ...updates
      });
    }
    
    // Only update if we have changes
    if (Object.keys(updates).length > 1) { // More than just update_status
      const { error: updateError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', laptop.id);
      
      if (updateError) {
        console.error(`Error updating product ${laptop.asin}:`, updateError);
        return { 
          success: false, 
          error: updateError.message,
          priceUpdated,
          imageUpdated,
          specsUpdated
        };
      }
      
      console.log(`Successfully updated product ${laptop.asin} with ${Object.keys(updates).length - 1} fields`);
      return { 
        success: true,
        priceUpdated,
        imageUpdated,
        specsUpdated
      };
    } else {
      // No changes except status, still update status
      const { error: statusUpdateError } = await supabase
        .from('products')
        .update({ update_status: 'completed' })
        .eq('id', laptop.id);
      
      if (statusUpdateError) {
        console.error(`Error updating status for ${laptop.asin}:`, statusUpdateError);
      }
      
      console.log(`No updates needed for product ${laptop.asin}`);
      return { 
        success: true,
        priceUpdated: false,
        imageUpdated: false,
        specsUpdated: false
      };
    }
  } catch (error) {
    console.error(`Error in updateProductInDatabase for ${laptop.asin}:`, error);
    
    // Update status to error
    await supabase
      .from('products')
      .update({ update_status: 'error' })
      .eq('id', laptop.id);
    
    return { 
      success: false, 
      error: error.message,
      priceUpdated: false,
      imageUpdated: false,
      specsUpdated: false
    };
  }
}
