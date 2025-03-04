
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { LaptopUpdate, UpdateResult } from "../../../types.ts";
import { extractPrice } from "../../extractors/priceExtractor.ts";
import { extractImageUrl } from "../../extractors/imageExtractor.ts";
import { extractEnhancedSpecs } from "../../extractors/specsExtractor.ts";
import { updatePriceHistory } from "./priceHistory.ts";
import { updateProductStatus } from "./statusUpdater.ts";
import { prepareProductUpdates, applyProductUpdates } from "./updateProcessor.ts";

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
    
    // Extract key information
    const extractedPrice = extractPrice(content);
    const imageUrl = extractImageUrl(content);
    const enhancedSpecs = extractEnhancedSpecs(content, existingProduct);
    
    // Prepare updates with all extracted data
    const updates = prepareProductUpdates(
      existingProduct, 
      content, 
      extractedPrice, 
      imageUrl, 
      enhancedSpecs
    );
    
    // Track which aspects were updated
    let priceUpdated = false;
    let imageUpdated = false;
    let specsUpdated = false;
    
    // Update price history if price changed
    if (extractedPrice !== null && updates.current_price !== undefined) {
      priceUpdated = await updatePriceHistory(
        supabase, 
        laptop.id, 
        existingProduct.current_price, 
        extractedPrice
      );
      
      if (priceUpdated) {
        console.log(`Updated price for ${laptop.asin}: $${existingProduct.current_price} -> $${extractedPrice}`);
      }
    }
    
    // Check if image was updated
    if (updates.image_url) {
      imageUpdated = true;
      console.log(`Updated image for ${laptop.asin}: ${updates.image_url}`);
    }
    
    // Check if specs were updated
    if (enhancedSpecs && Object.keys(enhancedSpecs).length > 0) {
      specsUpdated = true;
      console.log(`Updated specifications for ${laptop.asin}:`, 
        Object.keys(enhancedSpecs).join(', '));
    }
    
    // Apply updates to database
    const updateSuccess = await applyProductUpdates(supabase, laptop.id, updates);
    
    // If no changes, just update status
    if (!updateSuccess && Object.keys(updates).length <= 2) {
      await updateProductStatus(supabase, laptop.id, 'completed');
      console.log(`No updates needed for product ${laptop.asin}`);
    }
    
    return { 
      success: true,
      priceUpdated,
      imageUpdated,
      specsUpdated
    };
    
  } catch (error) {
    console.error(`Error in updateProductInDatabase for ${laptop.asin}:`, error);
    
    // Update status to error
    await updateProductStatus(supabase, laptop.id, 'error');
    
    return { 
      success: false, 
      error: error.message,
      priceUpdated: false,
      imageUpdated: false,
      specsUpdated: false
    };
  }
}
