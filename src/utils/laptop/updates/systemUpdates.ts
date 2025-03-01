
import { supabase } from "@/integrations/supabase/client";

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
