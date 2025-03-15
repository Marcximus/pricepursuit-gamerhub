
import { supabase } from "@/integrations/supabase/client";

// Timeout configuration (in milliseconds)
const FUNCTION_TIMEOUT = 90000; // 90 seconds timeout (reduced from 120s)
const DELAY_BETWEEN_CHUNKS = 2000; // Increased from 1000ms to 2000ms for better stability

export async function processChunksSequentially(chunks) {
  // Log a summary of all chunks before processing
  console.log(`Preparing to process ${chunks.length} chunks with a total of ${chunks.reduce((count, chunk) => count + chunk.length, 0)} laptops`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkAsins = chunk.map(l => l.asin);
    
    console.log(`----- Processing chunk ${i + 1}/${chunks.length} with ${chunk.length} laptops -----`);
    console.log(`First 5 laptops in chunk ${i + 1}:`, chunk.slice(0, 5).map(l => ({ 
      asin: l.asin, 
      lastChecked: l.last_checked ? new Date(l.last_checked).toLocaleString() : 'Never',
      price: l.current_price === null ? 'NULL' : `$${l.current_price}`,
      hasImage: l.image_url ? 'Yes' : 'No',
      status: l.update_status || 'pending'
    })));

    // Mark chunk laptops as pending update with a fresh timestamp
    console.log(`Marking ${chunk.length} laptops as pending_update`);
    const { error: statusError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending_update',
        last_checked: new Date().toISOString()
      })
      .in('asin', chunkAsins);

    if (statusError) {
      console.error(`Error marking chunk ${i + 1} laptops for update:`, statusError);
      continue;
    }

    // Call edge function for this chunk with proper timeout handling
    try {
      console.log(`Invoking update-laptops function for chunk ${i + 1} with ${chunk.length} laptops`);
      
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Function invocation timed out')), FUNCTION_TIMEOUT);
      });
      
      // Create the actual function invocation promise
      const functionPromise = supabase.functions.invoke('update-laptops', {
        body: { 
          laptops: chunk.map(l => ({ 
            id: l.id, 
            asin: l.asin, 
            current_price: l.current_price, 
            title: l.title,
            last_checked: l.last_checked,
            image_url: l.image_url,
            update_status: l.update_status || 'pending'
          }))
        }
      });
      
      // Race the promises - whichever completes first wins
      const result = await Promise.race([functionPromise, timeoutPromise]);
      
      if (result && result.error) {
        console.error(`Error processing chunk ${i + 1}:`, result.error);
        console.log(`Marking chunk ${i + 1} laptops as error due to function invocation failure`);
        await supabase
          .from('products')
          .update({ update_status: 'error' })
          .in('asin', chunkAsins);
      } else if (result && result.data) {
        console.log(`Successfully initiated update for chunk ${i + 1}`);
        
        // Log successful results summary
        if (result.data && result.data.success) {
          const statsData = result.data.stats || {};
          console.log(`Update-laptops function processed chunk ${i + 1} with results:`, {
            total: chunk.length,
            successful: statsData.successCount || 0,
            priceUpdates: statsData.priceUpdates || 0,
            imageUpdates: statsData.imageUpdates || 0,
            errors: statsData.errorCount || 0
          });
        }
      }
    } catch (error) {
      console.error(`Failed to process chunk ${i + 1}:`, error);
      
      // Check if this is a timeout error
      const isTimeout = error.message && error.message.includes('timed out');
      const errorStatus = isTimeout ? 'timeout' : 'error';
      
      console.log(`Marking chunk ${i + 1} laptops as ${errorStatus} due to ${isTimeout ? 'function timeout' : 'processing error'}`);
      
      // Make sure to mark laptops as error in case of exception
      try {
        await supabase
          .from('products')
          .update({ update_status: errorStatus })
          .in('asin', chunkAsins);
      } catch (markError) {
        console.error(`Failed to mark chunk ${i + 1} as ${errorStatus}:`, markError);
      }
      
      // Add longer recovery delay if we had a timeout
      if (isTimeout) {
        console.log(`Adding extra recovery delay after timeout for chunk ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second recovery delay
      }
    }

    // Add a larger delay between chunks to prevent rate limiting
    if (i < chunks.length - 1) {
      console.log(`Adding ${DELAY_BETWEEN_CHUNKS}ms delay before processing next chunk...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
    }
  }
  
  console.log('All chunks processing completed');
}
