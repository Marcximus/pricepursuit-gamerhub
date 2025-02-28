
import { supabase } from "@/integrations/supabase/client";

export async function processChunksSequentially(chunks) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkAsins = chunk.map(l => l.asin);
    
    console.log(`----- Processing chunk ${i + 1}/${chunks.length} -----`);
    console.log(`Chunk ${i + 1} laptops:`, chunk.map(l => ({ 
      asin: l.asin, 
      lastChecked: l.last_checked ? new Date(l.last_checked).toLocaleString() : 'Never',
      price: l.current_price === null ? 'NULL' : `$${l.current_price}`,
      hasImage: l.image_url ? 'Yes' : 'No'
    })));

    // Mark chunk laptops as pending update
    console.log(`Marking ${chunk.length} laptops (ASINs: ${chunkAsins.join(', ')}) as pending_update`);
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

    // Call edge function for this chunk
    try {
      console.log(`Invoking update-laptops function for chunk ${i + 1} with ${chunk.length} laptops (ASINs: ${chunkAsins.join(', ')})`);
      
      // Improve the function invocation with better error handling and data formatting
      const { data, error } = await supabase.functions.invoke('update-laptops', {
        body: { 
          laptops: chunk.map(l => ({ 
            id: l.id, 
            asin: l.asin, 
            current_price: l.current_price, 
            title: l.title,
            last_checked: l.last_checked,
            image_url: l.image_url 
          }))
        }
      });
      
      if (error) {
        console.error(`Error processing chunk ${i + 1} (ASINs: ${chunkAsins.join(', ')}):`, error);
        console.log(`Marking chunk ${i + 1} laptops as error due to function invocation failure`);
        await supabase
          .from('products')
          .update({ update_status: 'error' })
          .in('asin', chunkAsins);
      } else {
        console.log(`Successfully initiated update for chunk ${i + 1} with response:`, data);
        
        // Update the status to completed for this batch if no further action needed
        if (data && data.success) {
          console.log(`Update-laptops function successfully processed chunk ${i + 1}`);
        }
      }
    } catch (error) {
      console.error(`Failed to process chunk ${i + 1} (ASINs: ${chunkAsins.join(', ')}):`, error);
      
      // Make sure to mark laptops as error in case of exception
      try {
        await supabase
          .from('products')
          .update({ update_status: 'error' })
          .in('asin', chunkAsins);
      } catch (markError) {
        console.error(`Failed to mark chunk ${i + 1} as error:`, markError);
      }
    }

    // Add a small delay between chunks to prevent rate limiting
    if (i < chunks.length - 1) {
      const delayMs = 2000;
      console.log(`Adding ${delayMs}ms delay before processing next chunk...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.log('All chunks processing completed');
}
