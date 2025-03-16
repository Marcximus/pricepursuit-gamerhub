
import { supabase } from "@/integrations/supabase/client";
import { processUpdateResponse } from "./processUpdateResponse";

/**
 * Process an array of chunks sequentially to avoid overwhelming the Edge Function
 * @param chunks Array of laptop chunks to process
 */
export async function processChunksSequentially(chunks: any[][]) {
  console.log(`Preparing to process ${chunks.length} chunks with a total of ${chunks.flat().length} laptops`);
  
  let successfulChunks = 0;
  let failedChunks = 0;
  
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
      
      // Add timeout for edge function call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
      
      try {
        // Call edge function with timeout
        const { data, error } = await supabase.functions.invoke('update-laptops', {
          body: { laptops: chunk }
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error(`Error processing chunk ${i + 1}:`, error);
          failedChunks++;
          
          // Mark these laptops as error since the edge function failed
          await supabase
            .from('products')
            .update({ update_status: 'error' })
            .in('id', chunk.map(l => l.id));
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
          
          // Process response to update database with statistics
          await processUpdateResponse(data);
          
          successfulChunks++;
        }
      } catch (timeoutError) {
        clearTimeout(timeoutId);
        console.error(`Timeout or abort error processing chunk ${i + 1}:`, timeoutError);
        failedChunks++;
        
        // Mark these laptops as timeout error
        await supabase
          .from('products')
          .update({ update_status: 'timeout' })
          .in('id', chunk.map(l => l.id));
      }
      
      // Add a small delay between chunks to avoid overwhelming the API
      if (i < chunks.length - 1) {
        const delayTime = 5000 + (Math.random() * 3000); // 5-8 second random delay
        console.log(`Waiting ${Math.round(delayTime/1000)} seconds before processing next chunk...`);
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      failedChunks++;
      
      // Try to mark these laptops as error
      try {
        await supabase
          .from('products')
          .update({ update_status: 'error' })
          .in('id', chunk.map(l => l.id));
      } catch (markError) {
        console.error(`Failed to mark chunk ${i + 1} laptops as error:`, markError);
      }
      
      // Continue with next chunk anyway
    }
  }
  
  console.log(`All ${chunks.length} chunks have been processed. Success: ${successfulChunks}, Failed: ${failedChunks}`);
}
