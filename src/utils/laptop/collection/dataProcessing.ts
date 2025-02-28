
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
      } else {
        stats.added = data.filter(p => p.created_at === p.updated_at).length;
        stats.updated = data.length - stats.added;
      }
    } catch (upsertError) {
      console.error('Error in upsert operation:', upsertError);
      stats.failed += processedProducts.length;
    }
  }
  
  return { stats };
}
