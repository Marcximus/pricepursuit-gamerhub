
import { OxylabsResult, ProcessedLaptopData } from './types.ts';
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function upsertProduct(
  supabase: SupabaseClient,
  rawData: OxylabsResult,
  processedData: ProcessedLaptopData
) {
  console.log(`[Database] Upserting product for ASIN: ${rawData.asin}`);
  console.log('[Database] Processed specifications:', {
    processor: processedData.processor,
    ram: processedData.ram,
    storage: processedData.storage,
    graphics: processedData.graphics
  });

  const productData = {
    asin: rawData.asin,
    title: rawData.title,
    current_price: typeof rawData.price === 'number' ? rawData.price : null,
    original_price: typeof rawData.price_strikethrough === 'number' ? rawData.price_strikethrough : null,
    rating: typeof rawData.rating === 'number' ? rawData.rating : null,
    rating_count: typeof rawData.reviews_count === 'number' ? rawData.reviews_count : null,
    image_url: rawData.url_image || null,
    product_url: rawData.url || null,
    is_laptop: true,
    brand: processedData.brand || rawData.manufacturer || '',
    collection_status: 'completed',
    last_checked: new Date().toISOString(),
    last_collection_attempt: new Date().toISOString(),
    // Add processed specifications
    processor: processedData.processor,
    ram: processedData.ram,
    storage: processedData.storage,
    screen_size: processedData.screen_size,
    screen_resolution: processedData.screen_resolution,
    graphics: processedData.graphics,
    weight: processedData.weight,
    battery_life: processedData.battery_life,
    model: processedData.model,
    review_data: processedData.review_data
  };

  const { data, error } = await supabase
    .from('products')
    .upsert([productData], {
      onConflict: 'asin',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('[Database] Error upserting product:', error);
    throw error;
  }

  console.log(`[Database] Successfully upserted product with ASIN: ${rawData.asin}`);
  return data;
}

