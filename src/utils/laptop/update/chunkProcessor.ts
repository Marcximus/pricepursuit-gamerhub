
import { supabase } from "@/integrations/supabase/client";

/**
 * Process an array of chunks sequentially to avoid overwhelming the Edge Function
 * @param chunks Array of laptop chunks to process
 */
export async function processChunksSequentially(chunks: any[][]) {
  console.log(`Preparing to process ${chunks.length} chunks with a total of ${chunks.flat().length} laptops`);
  
  // Process each chunk in order
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`----- Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} laptops -----`);
    
    // Log first few laptops in this chunk for debugging
    console.log(`First ${Math.min(5, chunk.length)} laptops in chunk ${i + 1}:`, chunk.slice(0, 5).map(laptop => ({
      asin: laptop.asin,
      lastChecked: laptop.formattedLastChecked || (laptop.last_checked ? new Date(laptop.last_checked).toLocaleString() : 'Never'),
      price: laptop.current_price ? `$${laptop.current_price}` : 'NULL',
      hasImage: laptop.image_url ? 'Yes' : 'No',
      status: laptop.update_status || 'pending'
    })));
    
    try {
      // Mark these laptops as pending_update
      await supabase
        .from('products')
        .update({ 
          update_status: 'pending_update',
          last_checked: new Date().toISOString()
        })
        .in('id', chunk.map(l => l.id));
        
      console.log(`Marking ${chunk.length} laptops as pending_update`);
      
      // Call the Edge Function to process this chunk
      console.log(`Invoking update-laptops function for chunk ${i + 1} with ${chunk.length} laptops`);
      
      const { data, error } = await supabase.functions.invoke('update-laptops', {
        body: { laptops: chunk }
      });
      
      if (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
      } else {
        console.log(`Chunk ${i + 1} processed successfully:`, {
          success: data?.success,
          message: data?.message,
          statsSuccess: data?.stats?.success || 0,
          statsFailed: data?.stats?.failed || 0,
          statsPriceUpdated: data?.stats?.priceUpdated || 0,
          statsImageUpdated: data?.stats?.imageUpdated || 0,
          statsSpecsUpdated: data?.stats?.specsUpdated || 0
        });
      }
      
      // Add a small delay between chunks to avoid overwhelming the API
      if (i < chunks.length - 1) {
        console.log(`Waiting 5 seconds before processing next chunk...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      // Continue with next chunk anyway
    }
  }
  
  console.log(`All ${chunks.length} chunks have been processed`);
}
