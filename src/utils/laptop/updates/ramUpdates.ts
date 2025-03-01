
import { supabase } from "@/integrations/supabase/client";
import { updateProductByAsin } from "./updateCore";

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
