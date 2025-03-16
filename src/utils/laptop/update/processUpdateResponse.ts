
import { supabase } from "@/integrations/supabase/client";

/**
 * Process the response from the update-laptops edge function and update statistics
 * @param response The edge function response
 */
export const processUpdateResponse = async (response: any) => {
  if (!response || !response.success) {
    console.error('Update failed:', response?.error || 'Unknown error');
    return response;
  }
  
  try {
    // Log detailed stats from the update
    if (response.stats) {
      const { success, failed, priceUpdated, imageUpdated, specsUpdated } = response.stats;
      
      console.log('Update complete with the following results:');
      console.log(`- Success: ${success} laptops`);
      console.log(`- Failed: ${failed} laptops`);
      console.log(`- Price updated: ${priceUpdated} laptops`);
      console.log(`- Image updated: ${imageUpdated} laptops`);
      console.log(`- Specifications updated: ${specsUpdated} laptops`);
      
      // Update a statistics record in the database if needed
      // This could be implemented later to track update efficiency
    }
    
    return response;
  } catch (error: any) {
    console.error('Error processing update response:', error);
    return response;
  }
};

// Flag to preserve existing data when updating product specifications
export const preserveExistingData = true;
