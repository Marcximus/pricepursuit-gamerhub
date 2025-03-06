
import { supabase } from "@/integrations/supabase/client";
import { processChunksSequentially } from "./chunkProcessor";
import { applyAllProductFilters } from "../productFilters";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Modified query: Include laptops with ANY status except "completed"
    // This ensures we retry laptops stuck in pending_update, error, timeout states
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, title, last_checked, image_url, update_status')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'completed') // Only exclude completed laptops
      .order('last_checked', { nullsFirst: true }) // Prioritize laptops that have never been checked
      .limit(500); // Maintained limit of 500

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      return { success: false, message: 'No laptops found to update' };
    }

    console.log(`Fetched ${laptops.length} laptops to update`);
    console.log('Status distribution:', laptops.reduce((acc, laptop) => {
      acc[laptop.update_status || 'null'] = (acc[laptop.update_status || 'null'] || 0) + 1;
      return acc;
    }, {}));

    // Filter out any obviously non-laptop products using filters
    const filteredLaptops = applyAllProductFilters(laptops);
    
    if (filteredLaptops.length === 0) {
      console.log('No valid laptops found after filtering');
      return { success: false, message: 'No valid laptops found after filtering' };
    }

    console.log(`After filtering: ${filteredLaptops.length} valid laptops remaining for update`);

    // Prioritize laptops with missing prices or images, but still keep all laptops in the queue
    const prioritizedLaptops = [...filteredLaptops].sort((a, b) => {
      // Priority 0: Error or stuck states get highest priority
      const errorStates = ['error', 'timeout', 'pending_update'];
      const aIsError = errorStates.includes(a.update_status || '');
      const bIsError = errorStates.includes(b.update_status || '');
      if (aIsError && !bIsError) return -1;
      if (!aIsError && bIsError) return 1;
      
      // Priority 1: Missing price (null price)
      if (a.current_price === null && b.current_price !== null) return -1;
      if (a.current_price !== null && b.current_price === null) return 1;
      
      // Priority 2: Missing image
      if (!a.image_url && b.image_url) return -1;
      if (a.image_url && !b.image_url) return 1;
      
      // Priority 3: Last checked date (oldest first, null is highest priority)
      if (!a.last_checked && b.last_checked) return -1;
      if (a.last_checked && !b.last_checked) return 1;
      if (a.last_checked && b.last_checked) {
        return new Date(a.last_checked).getTime() - new Date(b.last_checked).getTime();
      }
      
      return 0;
    });

    // Format timestamps for logging
    const formattedLaptops = prioritizedLaptops.map(laptop => ({
      ...laptop,
      formattedLastChecked: laptop.last_checked ? new Date(laptop.last_checked).toLocaleString() : 'Never checked'
    }));

    // Log detailed info about laptops to be updated
    console.log(`Found ${prioritizedLaptops.length} laptops to update with the following priority:`);
    formattedLaptops.forEach((laptop, index) => {
      if (index < 10 || index >= prioritizedLaptops.length - 10) {
        // Only log first 10 and last 10 to avoid excessive logging
        console.log(`${index + 1}. ASIN: ${laptop.asin}, Title: ${laptop.title?.substring(0, 30)}..., Last Checked: ${laptop.formattedLastChecked}, Current Price: ${laptop.current_price === null ? 'NULL' : `$${laptop.current_price}`}, Has Image: ${laptop.image_url ? 'Yes' : 'No'}, Status: ${laptop.update_status || 'pending'}`);
      } else if (index === 10) {
        console.log(`... (${prioritizedLaptops.length - 20} more laptops) ...`);
      }
    });

    // Log priority distribution
    logPriorityDistribution(formattedLaptops);

    // Split laptops into chunks of 50 (increased from 20)
    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < prioritizedLaptops.length; i += chunkSize) {
      chunks.push(prioritizedLaptops.slice(i, i + chunkSize));
    }

    console.log(`Split updates into ${chunks.length} chunks of up to ${chunkSize} laptops each`);
    
    // Process each chunk sequentially in the background
    processChunksSequentially(chunks).catch(error => {
      console.error('Background process error:', error);
    });
    
    return { success: true, message: `Started updating ${prioritizedLaptops.length} laptops in ${chunks.length} chunks` };

  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    return { success: false, error: error.message };
  }
};

function logPriorityDistribution(formattedLaptops) {
  // Group laptops by update priority for better logging
  const neverCheckedLaptops = formattedLaptops.filter(l => !l.last_checked);
  const oldestCheckedLaptops = formattedLaptops.filter(l => l.last_checked).sort((a, b) => 
    new Date(a.last_checked).getTime() - new Date(b.last_checked).getTime()
  ).slice(0, 10);
  const nullPriceLaptops = formattedLaptops.filter(l => l.current_price === null);
  const noImageLaptops = formattedLaptops.filter(l => !l.image_url);
  const errorStatusLaptops = formattedLaptops.filter(l => ['error', 'timeout'].includes(l.update_status || ''));
  const pendingUpdateLaptops = formattedLaptops.filter(l => l.update_status === 'pending_update');
  
  console.log('Laptop update priority distribution:');
  console.log(`- Error/timeout status: ${errorStatusLaptops.length} laptops`);
  console.log(`- Stuck in pending_update: ${pendingUpdateLaptops.length} laptops`);
  console.log(`- Never checked: ${neverCheckedLaptops.length} laptops`);
  console.log(`- Missing prices: ${nullPriceLaptops.length} laptops`);
  console.log(`- Missing images: ${noImageLaptops.length} laptops`);
  
  if (oldestCheckedLaptops.length > 0) {
    console.log('- Oldest checked laptops:');
    oldestCheckedLaptops.forEach((l, i) => {
      console.log(`  ${i+1}. ASIN: ${l.asin}, Last checked: ${l.formattedLastChecked}, Price: ${l.current_price === null ? 'NULL' : `$${l.current_price}`}, Has Image: ${l.image_url ? 'Yes' : 'No'}, Status: ${l.update_status || 'pending'}`);
    });
  }
}
