
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export async function upsertProduct(
  supabase: SupabaseClient,
  rawData: any,
  processedData: any
) {
  console.log(`[Database] Upserting product ${processedData.asin}`);

  try {
    const { error } = await supabase
      .from('products')
      .upsert([
        {
          asin: processedData.asin,
          title: processedData.title,
          current_price: processedData.current_price,
          original_price: processedData.original_price,
          rating: processedData.rating,
          rating_count: processedData.rating_count,
          image_url: processedData.image_url,
          product_url: processedData.product_url,
          brand: processedData.brand,
          collection_status: processedData.collection_status,
          last_checked: processedData.last_checked,
          is_laptop: processedData.is_laptop
        }
      ], {
        onConflict: 'asin'
      });

    if (error) {
      throw error;
    }

    console.log(`[Database] Successfully upserted product ${processedData.asin}`);
  } catch (error) {
    console.error(`[Database] Error upserting product ${processedData.asin}:`, error);
    throw error;
  }
}

