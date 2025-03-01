
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates specific product fields for a given ASIN
 * @param asin The product ASIN to update
 * @param updateData Object containing the fields to update
 * @returns Promise with the update result
 */
export const updateProductByAsin = async (
  asin: string, 
  updateData: Partial<{
    ram: string;
    processor: string;
    storage: string;
    graphics: string;
    screen_size: string;
    screen_resolution: string;
    brand: string;
    model: string;
    [key: string]: any;
  }>
) => {
  try {
    console.log(`Updating product with ASIN ${asin}:`, updateData);
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('asin', asin)
      .select();
    
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    
    console.log('Product updated successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to update product:', error);
    return { success: false, error };
  }
};
