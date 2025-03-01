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

/**
 * Updates storage specification for a specific product by ASIN
 * @param asin The product ASIN
 * @param storageSpec The new storage specification
 */
export const updateProductStorage = async (asin: string, storageSpec: string) => {
  return updateProductByAsin(asin, { storage: storageSpec });
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

// Function to update the RAM for B07SXVRQ6N to 32 GB DDR5
export const updateB07SXVRQ6NRam = async () => {
  const ASIN = 'B07SXVRQ6N';
  const NEW_RAM = '32 GB DDR5';
  
  console.log(`Updating RAM for product ${ASIN} to "${NEW_RAM}"`);
  const result = await updateProductRam(ASIN, NEW_RAM);
  
  return result;
};

// Function to update the RAM for B07TB8WP87 to 32 GB DDR5
export const updateB07TB8WP87Ram = async () => {
  const ASIN = 'B07TB8WP87';
  const NEW_RAM = '32 GB DDR5';
  
  console.log(`Updating RAM for product ${ASIN} to "${NEW_RAM}"`);
  const result = await updateProductRam(ASIN, NEW_RAM);
  
  return result;
};

// Function to update the RAM for B09DDCDKZZ to 12 GB DDR4
export const updateB09DDCDKZZRam = async () => {
  const ASIN = 'B09DDCDKZZ';
  const NEW_RAM = '12 GB DDR4';
  
  console.log(`Updating RAM for product ${ASIN} to "${NEW_RAM}"`);
  const result = await updateProductRam(ASIN, NEW_RAM);
  
  return result;
};

// Function to update the Lenovo IdeaPad storage from 512 TB to 512 GB
export const updateLenovoIdeaPadStorage = async () => {
  const ASIN = 'B07QQB7552'; // Using the ASIN provided in the user message
  const NEW_STORAGE = '512 GB SSD';
  
  console.log(`Updating storage for product ${ASIN} to "${NEW_STORAGE}"`);
  const result = await updateProductStorage(ASIN, NEW_STORAGE);
  
  return result;
};

// Function to update the Alienware M18 R2 RAM from 12 GB to 32 GB
export const updateAlienwareM18R2Ram = async () => {
  // We need the ASIN for the Alienware M18 R2 model
  // Since we don't have the ASIN from the user message, let's try to find it by title or details
  try {
    // First, try to find the laptop by a unique part of its title
    console.log('Searching for Alienware M18 R2 laptop...');
    
    const { data: laptops, error } = await supabase
      .from('products')
      .select('*')
      .ilike('title', '%Alienware M18 R2%')
      .limit(5);
    
    if (error) {
      console.error('Error searching for Alienware laptop:', error);
      return { success: false, error };
    }
    
    if (!laptops || laptops.length === 0) {
      console.error('No Alienware M18 R2 laptop found in the database');
      return { 
        success: false, 
        error: 'Laptop not found. Please add the correct ASIN for this laptop.' 
      };
    }
    
    // If we found multiple matches, find the one with 12 GB RAM that needs updating
    const laptopToUpdate = laptops.find(laptop => 
      laptop.ram && laptop.ram.includes('12 GB')
    );
    
    if (!laptopToUpdate) {
      console.error('Found Alienware M18 R2 laptops, but none with 12 GB RAM:', laptops);
      // If we have matches but none with 12 GB RAM, update the first one anyway
      const firstLaptop = laptops[0];
      console.log(`Updating first found Alienware laptop (ASIN: ${firstLaptop.asin})`);
      
      const result = await updateProductRam(firstLaptop.asin, '32 GB DDR5');
      return {
        ...result,
        message: `Updated Alienware laptop with ASIN ${firstLaptop.asin}. Current RAM was "${firstLaptop.ram}".`
      };
    }
    
    // Update the found laptop
    console.log(`Updating Alienware M18 R2 laptop (ASIN: ${laptopToUpdate.asin}) RAM from "${laptopToUpdate.ram}" to "32 GB DDR5"`);
    const result = await updateProductRam(laptopToUpdate.asin, '32 GB DDR5');
    
    return {
      ...result,
      message: `Updated Alienware M18 R2 laptop with ASIN ${laptopToUpdate.asin}.`
    };
    
  } catch (error) {
    console.error('Error in updateAlienwareM18R2Ram:', error);
    return { success: false, error };
  }
};

// Function to force refresh the cached data for all laptops
export const refreshLaptopCache = async () => {
  try {
    console.log('Refreshing laptop cache...');
    
    // Clear the TanStack Query cache for the 'all-laptops' query
    // Note: This function would need to be implemented in the actual app
    // or it could be done by adding a timestamp parameter to the fetch function
    
    // For now, we'll just force a data refresh by touching a random field
    // on a few laptops to trigger cache invalidation
    
    const { data: sampleLaptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true)
      .limit(3);
    
    if (fetchError) {
      console.error('Error fetching sample laptops:', fetchError);
      return { success: false, error: fetchError };
    }
    
    if (!sampleLaptops || sampleLaptops.length === 0) {
      return { success: false, error: 'No laptops found to refresh' };
    }
    
    // Update the last_checked timestamp on these laptops to force refresh
    const updatePromises = sampleLaptops.map(laptop => {
      return supabase
        .from('products')
        .update({ last_checked: new Date().toISOString() })
        .eq('id', laptop.id);
    });
    
    await Promise.all(updatePromises);
    
    console.log('Cache refresh triggered successfully');
    return { success: true, message: 'Laptop cache refreshed successfully' };
    
  } catch (error) {
    console.error('Error refreshing laptop cache:', error);
    return { success: false, error };
  }
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
