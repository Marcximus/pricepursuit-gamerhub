
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function updateProductInDatabase(supabase: any, laptop: { id: string }, content: any) {
  console.log(`Processing update for laptop ${laptop.id}`);
  
  const currentPrice = content.price?.current;
  const updateData = {
    title: content.title,
    description: content.description,
    current_price: currentPrice,
    original_price: content.price?.previous || currentPrice,
    rating: content.rating,
    rating_count: content.rating_breakdown?.total_count,
    image_url: content.images?.[0],
    review_data: content.reviews,
    processor: content.product_details?.processor,
    ram: content.product_details?.ram,
    storage: content.product_details?.hard_drive,
    graphics: content.product_details?.graphics_coprocessor,
    screen_size: content.product_details?.standing_screen_display_size,
    screen_resolution: content.product_details?.screen_resolution,
    weight: content.product_details?.item_weight,
    battery_life: content.product_details?.batteries,
    update_status: 'completed',
    last_checked: new Date().toISOString(),
    last_updated: new Date().toISOString()
  };

  const { error: updateError } = await supabase.rpc(
    'update_product_with_price_history',
    {
      p_product_id: laptop.id,
      p_price: currentPrice,
      p_update_data: updateData
    }
  );

  if (updateError) {
    throw updateError;
  }

  return updateData;
}

export async function updateErrorStatus(supabase: any, laptopId: string) {
  return await supabase
    .from('products')
    .update({ 
      update_status: 'error',
      last_checked: new Date().toISOString()
    })
    .eq('id', laptopId);
}

