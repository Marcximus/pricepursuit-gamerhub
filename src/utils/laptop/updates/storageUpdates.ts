
import { supabase } from "@/integrations/supabase/client";
import { updateProductByAsin } from "./updateCore";

/**
 * Updates storage specification for a specific product by ASIN
 * @param asin The product ASIN
 * @param storageSpec The new storage specification
 */
export const updateProductStorage = async (asin: string, storageSpec: string) => {
  return updateProductByAsin(asin, { storage: storageSpec });
};

// Function to update the Lenovo IdeaPad storage from 512 TB to 512 GB
export const updateLenovoIdeaPadStorage = async () => {
  const ASIN = 'B07QQB7552'; // Using the ASIN provided in the user message
  const NEW_STORAGE = '512 GB SSD';
  
  console.log(`Updating storage for product ${ASIN} to "${NEW_STORAGE}"`);
  const result = await updateProductStorage(ASIN, NEW_STORAGE);
  
  return result;
};

// Function to find and fix all laptops with unrealistic storage values
export const fixUnrealisticStorageValues = async () => {
  console.log('Looking for laptops with unrealistic storage values...');
  
  try {
    // Find laptops with unrealistic TB storage values
    const { data: problematicLaptops, error } = await supabase
      .from('products')
      .select('id, asin, title, storage')
      .ilike('storage', '%TB%')
      .or('storage.ilike.%128 TB%,storage.ilike.%256 TB%,storage.ilike.%512 TB%')
      .limit(100);
    
    if (error) {
      console.error('Error fetching problematic laptops:', error);
      return { success: false, error };
    }
    
    console.log(`Found ${problematicLaptops?.length || 0} laptops with potentially unrealistic TB storage`);
    
    if (!problematicLaptops || problematicLaptops.length === 0) {
      return { 
        success: true, 
        message: 'No laptops with unrealistic storage values found' 
      };
    }
    
    // Fix each problematic laptop
    const updatePromises = problematicLaptops.map(laptop => {
      if (!laptop.storage) return null;
      
      // Replace TB with GB for common laptop storage values
      const correctedStorage = laptop.storage.replace(
        /\b(128|256|512|1000|2000)\s*TB\b/i, 
        '$1 GB'
      );
      
      if (correctedStorage !== laptop.storage) {
        console.log(`Correcting storage for "${laptop.title}" (${laptop.asin}): "${laptop.storage}" → "${correctedStorage}"`);
        
        return supabase
          .from('products')
          .update({ storage: correctedStorage })
          .eq('id', laptop.id);
      }
      
      return null;
    }).filter(Boolean);
    
    if (updatePromises.length === 0) {
      return { 
        success: true, 
        message: 'No corrections needed for the found laptops' 
      };
    }
    
    await Promise.all(updatePromises);
    
    console.log(`Successfully corrected ${updatePromises.length} laptops with unrealistic storage values`);
    
    return { 
      success: true, 
      message: `Corrected ${updatePromises.length} laptops with unrealistic storage values`,
      correctedCount: updatePromises.length
    };
    
  } catch (error) {
    console.error('Error fixing unrealistic storage values:', error);
    return { success: false, error };
  }
};
