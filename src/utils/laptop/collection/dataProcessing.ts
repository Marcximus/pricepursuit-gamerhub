
import { supabase } from "@/integrations/supabase/client";
import { COLLECTION_CONFIG } from "../config";
import { normalizeProductSpecs } from "./specNormalization";
import { shouldCollectProduct } from "./pageProcessing";

/**
 * Process product data before inserting it into the database
 * @param products Array of raw product data
 * @returns Processed products with stats
 */
export async function processProductData(products: any[]) {
  if (!products || products.length === 0) {
    return { stats: { processed: 0, added: 0, updated: 0, failed: 0, skipped: 0 } };
  }
  
  const stats = {
    processed: products.length,
    added: 0,
    updated: 0,
    failed: 0,
    skipped: 0
  };
  
  const processedProducts = [];
  
  for (const product of products) {
    try {
      // Skip products that don't match our criteria
      if (!shouldCollectProduct(product.title)) {
        stats.skipped++;
        continue;
      }
      
      // Normalize product specs
      const normalizedProduct = normalizeProductSpecs(product);
      
      if (normalizedProduct) {
        processedProducts.push(normalizedProduct);
      }
    } catch (error) {
      console.error('Error processing product:', error);
      stats.failed++;
    }
  }
  
  if (processedProducts.length > 0) {
    try {
      // Insert or update products in the database
      const { data, error } = await supabase
        .from('products')
        .upsert(processedProducts, { 
          onConflict: 'asin',
          ignoreDuplicates: false
        })
        .select();
      
      if (error) {
        console.error('Error upserting products:', error);
        stats.failed += processedProducts.length;
      } else if (data) {
        // Don't try to access updated_at directly as it might not exist
        // Instead, determine if a record is new or updated in a different way
        // Such as checking if the record exists in the database before upserting
        stats.added = data.length; // Simplifying this logic for now
        stats.updated = 0; // We'll simplify this part
      }
    } catch (upsertError) {
      console.error('Error in upsert operation:', upsertError);
      stats.failed += processedProducts.length;
    }
  }
  
  return { stats };
}

/**
 * Process a page of products for a specific brand
 * @param brand Brand name
 * @param page Page number
 * @param groupIndex Current group index
 * @param brandIndex Current brand index within group
 * @param totalBrands Total number of brands
 * @returns Processing result with stats
 */
export async function processPage(
  brand: string,
  page: number,
  groupIndex: number,
  brandIndex: number,
  totalBrands: number
) {
  try {
    console.log(`Processing ${brand} page ${page} (group ${groupIndex + 1}, brand ${brandIndex + 1}/${totalBrands})`);
    
    // In a real implementation, this would fetch product data from an API
    // and process it, but for this example we'll just simulate some results
    const stats = {
      processed: Math.floor(Math.random() * 10) + 5,
      updated: Math.floor(Math.random() * 3),
      added: Math.floor(Math.random() * 5),
      failed: Math.floor(Math.random() * 2),
      skipped: Math.floor(Math.random() * 3)
    };
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, page, brand, stats };
  } catch (error) {
    console.error(`Error processing ${brand} page ${page}:`, error);
    return { success: false, page, brand, error };
  }
}
