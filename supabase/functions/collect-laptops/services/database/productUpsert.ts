
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    // Verify critical data fields before insertion
    if (!processedData.asin) {
      console.error('[Database] Missing ASIN for product:', processedData);
      throw new Error('Missing ASIN for product');
    }
    
    // Log the product data being processed
    console.log(`[Database] Processing product ${processedData.asin}:`, {
      title: processedData.title?.substring(0, 50) || 'Unknown',
      price: processedData.current_price || 'None',
      image: processedData.image_url ? 'Available' : 'Missing'
    });
    
    // Check if product already exists by ASIN
    const { data: existingProduct, error: selectError } = await supabase
      .from('products')
      .select('id, asin, image_url, current_price')
      .eq('asin', processedData.asin)
      .limit(1);
      
    if (selectError) {
      console.error('[Database] Error checking for existing product:', selectError);
      throw selectError;
    }
    
    let updateData = { ...processedData };
    
    if (existingProduct && existingProduct.length > 0) {
      // Log existing product data
      console.log(`[Database] Found existing product ${processedData.asin}:`, {
        id: existingProduct[0].id, 
        existingPrice: existingProduct[0].current_price || 'None',
        existingImage: existingProduct[0].image_url ? 'Available' : 'Missing',
        newPrice: processedData.current_price || 'None',
        newImage: processedData.image_url ? 'Available' : 'Missing'
      });
      
      // Preserve existing image_url if new one is missing
      if (!processedData.image_url && existingProduct[0].image_url) {
        console.log(`[Database] Keeping existing image URL for ${processedData.asin}`);
        updateData.image_url = existingProduct[0].image_url;
      }
      
      // Update existing product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          ...updateData,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingProduct[0].id);
        
      if (updateError) {
        console.error('[Database] Error updating product:', updateError);
        throw updateError;
      }
      
      console.log(`[Database] Successfully updated product ${processedData.asin}`);
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
      
      console.log(`[Database] Successfully inserted new product ${processedData.asin}`);
      return { id: insertResult?.[0]?.id, isNew: true };
    }
  } catch (error) {
    console.error('[Database] Error in upsertProduct:', error);
    throw error;
  }
}
