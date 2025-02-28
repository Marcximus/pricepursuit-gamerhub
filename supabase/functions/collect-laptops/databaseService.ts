
import { supabase } from './supabaseClient.ts';
import { LaptopProductData } from './types.ts';
import { normalizeProductSpecs } from './utils/collectionUtils.ts';

/**
 * Saves a product to the Supabase database
 */
export async function saveProduct(product: LaptopProductData): Promise<{ id: string, isNew: boolean }> {
  // Normalize all specifications before saving
  const normalizedProduct = normalizeProductSpecs(product);
  
  // Check if product already exists
  const { data: existingProducts, error: queryError } = await supabase
    .from('products')
    .select('id, current_price, last_checked')
    .eq('asin', normalizedProduct.asin)
    .limit(1);

  if (queryError) {
    console.error('Error checking for existing product:', queryError);
    throw queryError;
  }

  // If product exists, update it
  if (existingProducts && existingProducts.length > 0) {
    const existingProduct = existingProducts[0];
    const updateData = {
      title: normalizedProduct.title,
      current_price: normalizedProduct.current_price,
      original_price: normalizedProduct.original_price,
      rating: normalizedProduct.rating,
      rating_count: normalizedProduct.rating_count,
      image_url: normalizedProduct.image_url,
      product_url: normalizedProduct.product_url,
      brand: normalizedProduct.brand,
      model: normalizedProduct.model,
      processor: normalizedProduct.processor,
      ram: normalizedProduct.ram,
      storage: normalizedProduct.storage,
      graphics: normalizedProduct.graphics,
      screen_size: normalizedProduct.screen_size,
      screen_resolution: normalizedProduct.screen_resolution,
      weight: normalizedProduct.weight,
      battery_life: normalizedProduct.battery_life,
      collection_status: 'completed',
      last_checked: new Date().toISOString(),
      is_laptop: true
    };

    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', existingProduct.id);

    if (updateError) {
      console.error('Error updating product:', updateError);
      throw updateError;
    }

    return { id: existingProduct.id, isNew: false };
  }

  // If product doesn't exist, insert it
  const newProduct = {
    asin: normalizedProduct.asin,
    title: normalizedProduct.title,
    current_price: normalizedProduct.current_price,
    original_price: normalizedProduct.original_price,
    rating: normalizedProduct.rating,
    rating_count: normalizedProduct.rating_count,
    image_url: normalizedProduct.image_url,
    product_url: normalizedProduct.product_url,
    brand: normalizedProduct.brand,
    model: normalizedProduct.model,
    processor: normalizedProduct.processor,
    ram: normalizedProduct.ram,
    storage: normalizedProduct.storage,
    graphics: normalizedProduct.graphics,
    screen_size: normalizedProduct.screen_size,
    screen_resolution: normalizedProduct.screen_resolution,
    weight: normalizedProduct.weight,
    battery_life: normalizedProduct.battery_life,
    collection_status: 'completed',
    last_collection_attempt: new Date().toISOString(),
    last_checked: new Date().toISOString(),
    is_laptop: true
  };

  const { data: insertedProduct, error: insertError } = await supabase
    .from('products')
    .insert(newProduct)
    .select('id')
    .single();

  if (insertError) {
    console.error('Error inserting product:', insertError);
    throw insertError;
  }

  return { id: insertedProduct.id, isNew: true };
}

/**
 * Updates product collection status
 */
export async function updateProductStatus(asin: string, status: 'pending' | 'in_progress' | 'completed'): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ 
      collection_status: status,
      ...(status === 'in_progress' ? { last_collection_attempt: new Date().toISOString() } : {})
    })
    .eq('asin', asin);

  if (error) {
    console.error(`Error updating status for ${asin}:`, error);
    throw error;
  }
}

/**
 * Mark all products for a brand as being processed
 */
export async function markBrandInProgress(brand: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ 
      collection_status: 'in_progress',
      last_collection_attempt: new Date().toISOString()
    })
    .eq('brand', brand);

  if (error) {
    console.error(`Error updating status for brand ${brand}:`, error);
    throw error;
  }
}

/**
 * Mark all products for a brand as completed processing
 */
export async function markBrandCompleted(brand: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ collection_status: 'completed' })
    .eq('brand', brand)
    .eq('collection_status', 'in_progress');

  if (error) {
    console.error(`Error completing status for brand ${brand}:`, error);
    throw error;
  }
}
