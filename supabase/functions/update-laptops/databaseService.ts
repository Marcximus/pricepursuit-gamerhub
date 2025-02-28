
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { LaptopUpdate, LaptopUpdateResult } from './types.ts';

/**
 * Update a laptop in the database
 */
export const updateLaptop = async (
  supabase: ReturnType<typeof createClient>,
  laptop: LaptopUpdate
): Promise<LaptopUpdateResult> => {
  // Get current timestamp
  const now = new Date().toISOString();

  // Determine whether a price record should be created
  const shouldCreatePriceRecord = 
    laptop.current_price !== null && 
    laptop.current_price !== undefined && 
    laptop.current_price > 0;

  // Track and log specification extraction 
  const hasExtractedSpecs = !!(
    laptop.processor || 
    laptop.ram || 
    laptop.storage || 
    laptop.graphics || 
    laptop.screen_size
  );
  
  // Log the update details for debugging
  console.log(`Updating laptop ${laptop.id} (ASIN: ${laptop.asin}):`, {
    hasPrice: shouldCreatePriceRecord,
    price: laptop.current_price,
    hasSpecs: hasExtractedSpecs,
    specs: {
      processor: !!laptop.processor,
      ram: !!laptop.ram,
      storage: !!laptop.storage,
      graphics: !!laptop.graphics,
      screen_size: !!laptop.screen_size
    },
    raw: {
      processor: laptop.processor,
      ram: laptop.ram,
      storage: laptop.storage,
      graphics: laptop.graphics,
      screen_size: laptop.screen_size
    }
  });

  try {
    // Start by updating the product
    const { error: updateError } = await supabase
      .from('products')
      .update({
        title: laptop.title,
        current_price: laptop.current_price,
        original_price: laptop.original_price,
        rating: laptop.rating,
        rating_count: laptop.rating_count,
        total_reviews: laptop.total_reviews,
        image_url: laptop.image_url,
        processor: laptop.processor,
        ram: laptop.ram,
        storage: laptop.storage,
        graphics: laptop.graphics,
        screen_size: laptop.screen_size,
        screen_resolution: laptop.screen_resolution,
        weight: laptop.weight,
        battery_life: laptop.battery_life,
        brand: laptop.brand,
        model: laptop.model,
        update_status: 'completed',
        last_checked: now,
        last_updated: now
      })
      .eq('id', laptop.id);

    if (updateError) {
      console.error(`Error updating laptop ${laptop.id}:`, updateError);
      return {
        id: laptop.id,
        asin: laptop.asin,
        success: false,
        message: `Error updating laptop: ${updateError.message}`
      };
    }

    // Check if we need to create a price history record
    if (shouldCreatePriceRecord) {
      // Get today's date in YYYY-MM-DD format for checking existing price records
      const today = new Date().toISOString().split('T')[0];
      
      // Check if we already have a price record for today
      const { data: existingPrices, error: checkError } = await supabase
        .from('price_history')
        .select('id')
        .eq('product_id', laptop.id)
        .gte('timestamp', `${today}T00:00:00Z`)
        .lt('timestamp', `${today}T23:59:59Z`)
        .limit(1);
      
      if (checkError) {
        console.error(`Error checking existing price records for ${laptop.id}:`, checkError);
      } else if (!existingPrices || existingPrices.length === 0) {
        // No price record for today, create one
        const { error: priceError } = await supabase
          .from('price_history')
          .insert({
            product_id: laptop.id,
            price: laptop.current_price,
            timestamp: now
          });
        
        if (priceError) {
          console.error(`Error creating price history for ${laptop.id}:`, priceError);
        }
      } else {
        console.log(`Price history for ${laptop.id} already exists for today, skipping`);
      }
    }

    // Return success
    return {
      id: laptop.id,
      asin: laptop.asin,
      success: true,
      message: `Updated laptop ${laptop.id} successfully`
    };
  } catch (error) {
    console.error(`Exception updating laptop ${laptop.id}:`, error);
    return {
      id: laptop.id,
      asin: laptop.asin,
      success: false,
      message: `Exception updating laptop: ${(error as Error).message}`
    };
  }
};
