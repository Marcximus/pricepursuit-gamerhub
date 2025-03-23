
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getSupabaseClient } from './supabaseClient.ts';
import { upsertProduct } from './productUpsert.ts';

/**
 * Insert or update multiple products in the database
 * @param products An array of processed product data objects
 * @param detailedLogging Whether to log detailed information
 * @returns Statistics about the operation
 */
export async function insertOrUpdateProducts(products: any[], detailedLogging = false) {
  try {
    const supabase = getSupabaseClient();
    
    console.log(`[Database] Starting database operations for ${products.length} products`);
    console.log(`[Database] Price data available: ${products.filter(p => p.current_price !== null).length}/${products.length}`);
    console.log(`[Database] Image URLs available: ${products.filter(p => p.image_url && p.image_url.length > 0).length}/${products.length}`);
    
    // Stats to track results
    const stats = {
      added: 0,
      updated: 0,
      failed: 0,
      missingPrice: 0,
      missingImage: 0
    };
    
    // Count products with missing data
    for (const product of products) {
      if (!product.current_price) stats.missingPrice++;
      if (!product.image_url) stats.missingImage++;
    }
    
    // Process each product
    for (const product of products) {
      try {
        // Skip invalid products
        if (!product || !product.asin) {
          console.log('[Database] Skipping invalid product:', product);
          stats.failed++;
          continue;
        }
        
        const result = await upsertProduct(supabase, null, product);
        
        if (result.isNew) {
          stats.added++;
          if (detailedLogging) {
            console.log(`[Database] Added new product: ${product.asin}`);
          }
        } else {
          stats.updated++;
          if (detailedLogging) {
            console.log(`[Database] Updated existing product: ${product.asin}`);
          }
        }
      } catch (error) {
        console.error(`[Database] Error processing product ${product?.asin || 'unknown'}:`, error);
        stats.failed++;
      }
    }
    
    console.log('[Database] Database operations completed with stats:', {
      ...stats,
      successRate: `${Math.round(((stats.added + stats.updated) / products.length) * 100)}%`,
      priceDataRate: `${Math.round(((products.length - stats.missingPrice) / products.length) * 100)}%`,
      imageDataRate: `${Math.round(((products.length - stats.missingImage) / products.length) * 100)}%`
    });
    
    return stats;
  } catch (error) {
    console.error('[Database] Error in insertOrUpdateProducts:', error);
    return {
      added: 0,
      updated: 0,
      failed: products.length,
      missingPrice: 0,
      missingImage: 0
    };
  }
}
