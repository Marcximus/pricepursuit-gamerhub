
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

/**
 * Updates RAM specification for a specific product by ASIN
 * @param asin The product ASIN
 * @param ramSpec The new RAM specification
 */
export const updateProductRam = async (asin: string, ramSpec: string) => {
  return updateProductByAsin(asin, { ram: ramSpec });
};

// Function to update the RAM for product B07STVDB3N to 32 GB DDR5
export const updateSpecificLaptopRam = async () => {
  const ASIN = 'B07STVDB3N';
  const NEW_RAM = '32 GB DDR5';
  
  console.log(`Updating RAM for product ${ASIN} to "${NEW_RAM}"`);
  const result = await updateProductRam(ASIN, NEW_RAM);
  
  return result;
};

// Function to update the RAM for product B07SRSSWH9 to 64 GB DDR5
export const updateB07SRSSWH9Ram = async () => {
  const ASIN = 'B07SRSSWH9';
  const NEW_RAM = '64 GB DDR5';
  
  console.log(`Updating RAM for product ${ASIN} to "${NEW_RAM}"`);
  const result = await updateProductRam(ASIN, NEW_RAM);
  
  return result;
};
