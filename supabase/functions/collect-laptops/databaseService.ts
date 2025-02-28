
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

/**
 * Upserts a product in the database
 * @param supabase The Supabase client
 * @param rawData The raw product data from Oxylabs
 * @param processedData The processed product data ready for insertion
 * @returns The database operation result
 */
export async function upsertProduct(
  supabase: ReturnType<typeof createClient>,
  rawData: any,
  processedData: any
) {
  try {
    // Check if product already exists by ASIN
    const { data: existingProduct, error: selectError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('asin', processedData.asin)
      .limit(1);
      
    if (selectError) {
      console.error('[Database] Error checking for existing product:', selectError);
      throw selectError;
    }
    
    if (existingProduct && existingProduct.length > 0) {
      // Update existing product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...processedData,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingProduct[0].id);
        
      if (updateError) {
        console.error('[Database] Error updating product:', updateError);
        throw updateError;
      }
      
      return { id: existingProduct[0].id, isNew: false };
    } else {
      // Insert new product
      const { data: insertResult, error: insertError } = await supabase
        .from('products')
        .insert({
          ...processedData,
          created_at: new Date().toISOString()
        })
        .select('id');
        
      if (insertError) {
        // Log full error for debugging
        console.error('[Database] Error inserting product:', insertError);
        
        // Check if it's a duplicate key error (can happen with concurrent operations)
        if (insertError.message && insertError.message.includes('duplicate key value violates unique constraint')) {
          console.warn('[Database] Duplicate product detected:', processedData.asin);
          
          // Re-fetch the product to get its ID
          const { data: duplicateProduct } = await supabase
            .from('products')
            .select('id')
            .eq('asin', processedData.asin)
            .limit(1);
            
          if (duplicateProduct && duplicateProduct.length > 0) {
            return { id: duplicateProduct[0].id, isNew: false, wasDuplicate: true };
          }
        }
        
        throw insertError;
      }
      
      return { id: insertResult?.[0]?.id, isNew: true };
    }
  } catch (error) {
    console.error('[Database] Error in upsertProduct:', error);
    throw error;
  }
}

/**
 * Insert or update multiple products in the database
 * @param products An array of processed product data objects
 * @param detailedLogging Whether to log detailed information
 * @returns Statistics about the operation
 */
export async function insertOrUpdateProducts(products: any[], detailedLogging = false) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (detailedLogging) {
      console.log(`Starting database operations for ${products.length} products`);
    }
    
    // Stats to track results
    const stats = {
      added: 0,
      updated: 0,
      failed: 0
    };
    
    // Process each product
    for (const product of products) {
      try {
        // Skip invalid products
        if (!product || !product.asin) {
          if (detailedLogging) {
            console.log('Skipping invalid product:', product);
          }
          stats.failed++;
          continue;
        }
        
        const result = await upsertProduct(supabase, null, product);
        
        if (result.isNew) {
          stats.added++;
          if (detailedLogging) {
            console.log(`Added new product: ${product.asin}`);
          }
        } else {
          stats.updated++;
          if (detailedLogging) {
            console.log(`Updated existing product: ${product.asin}`);
          }
        }
      } catch (error) {
        console.error(`Error processing product ${product?.asin || 'unknown'}:`, error);
        stats.failed++;
      }
    }
    
    if (detailedLogging) {
      console.log('Database operations completed with stats:', stats);
    }
    
    return stats;
  } catch (error) {
    console.error('Error in insertOrUpdateProducts:', error);
    return {
      added: 0,
      updated: 0,
      failed: products.length
    };
  }
}
