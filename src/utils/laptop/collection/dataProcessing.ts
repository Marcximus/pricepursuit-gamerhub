
import { supabase } from "@/integrations/supabase/client";
import { normalizeProductSpecs } from "./specNormalization";

/**
 * Process a single page of product data for a brand
 * @param brand Brand to process
 * @param page Page number
 * @param groupIndex Current group index for tracking progress
 * @param brandIndex Current brand index within the group
 * @param totalBrands Total number of brands being processed
 * @returns Processing statistics or null if there was an error
 */
export async function processPage(brand: string, page: number, groupIndex: number, brandIndex: number, totalBrands: number) {
  console.log(`Processing ${brand} page ${page}, batch ${groupIndex * 2 + brandIndex + 1}/${totalBrands}`);
  
  const { data: response, error: functionError } = await supabase.functions.invoke('collect-laptops', {
    body: {
      brands: [brand],
      pages_per_brand: 1,
      current_page: page,
      batch_number: groupIndex * 2 + brandIndex + 1,
      total_batches: totalBrands,
      normalize_specs: true // Signal to the edge function that we want to normalize specs
    }
  });

  if (functionError) {
    if (functionError.message?.includes('duplicate key value violates unique constraint')) {
      console.warn(`Duplicate ASIN found for ${brand} page ${page}`, functionError);
      return {
        stats: {
          processed: 0,
          updated: 0,
          added: 0,
          failed: 0,
          skipped: 1
        }
      };
    }
    
    console.error(`Edge function error for ${brand} page ${page}:`, functionError);
    return null;
  }

  // If we have products returned, ensure they're properly normalized
  if (response && response.products && Array.isArray(response.products)) {
    console.log(`Received ${response.products.length} products from edge function, ensuring correct normalization`);
    
    await validateAndUpdateProductSpecs(response.products, response.stats);
  }

  return response;
}

/**
 * Validate and update products with missing specifications
 * @param products Array of products to check
 * @param stats Collection statistics to update
 */
async function validateAndUpdateProductSpecs(products: any[], stats: any) {
  // Update any existing products with any missing specs
  const existingAsins = products.map((p: any) => p.asin);
  if (existingAsins.length > 0) {
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .in('asin', existingAsins);
    
    if (fetchError) {
      console.error('Error fetching existing products for spec check:', fetchError);
    } else if (existingProducts && existingProducts.length > 0) {
      console.log(`Found ${existingProducts.length} existing products to update with normalized specs`);
      
      for (const product of existingProducts) {
        // Re-normalize specs for any product missing important specs
        if (!product.processor || !product.ram || !product.storage || !product.graphics || !product.screen_size) {
          console.log(`Product ${product.asin} missing specs, normalizing from title: ${product.title?.substring(0, 30)}...`);
          
          const normalizedProduct = normalizeProductSpecs(product);
          
          // Only update if we managed to extract more info
          const needsUpdate = 
            (!product.processor && normalizedProduct.processor) ||
            (!product.ram && normalizedProduct.ram) ||
            (!product.storage && normalizedProduct.storage) ||
            (!product.graphics && normalizedProduct.graphics) ||
            (!product.screen_size && normalizedProduct.screen_size);
          
          if (needsUpdate) {
            console.log(`Updating product ${product.asin} with newly extracted specs`);
            const { error: updateError } = await supabase
              .from('products')
              .update({
                processor: normalizedProduct.processor || product.processor,
                ram: normalizedProduct.ram || product.ram,
                storage: normalizedProduct.storage || product.storage,
                graphics: normalizedProduct.graphics || product.graphics,
                screen_size: normalizedProduct.screen_size || product.screen_size,
                brand: normalizedProduct.brand || product.brand,
                model: normalizedProduct.model || product.model
              })
              .eq('id', product.id);
            
            if (updateError) {
              console.error(`Error updating product ${product.asin} with normalized specs:`, updateError);
            } else {
              console.log(`Successfully updated product ${product.asin} with normalized specs`);
              
              // Update stats to reflect our manual updates
              if (stats) {
                stats.updated = (stats.updated || 0) + 1;
              }
            }
          }
        }
      }
    }
  }
}
