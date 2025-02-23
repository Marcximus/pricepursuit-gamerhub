
import { supabase } from "@/integrations/supabase/client";

export const updateLaptops = async () => {
  try {
    console.log('Starting silent update for ALL laptops...');
    
    // Get laptops with priority for those without prices
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .or('current_price.is.null,current_price.eq.0')
      .order('current_price', { nullsFirst: true });

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      return null;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      return null;
    }

    const updateCount = laptops.length;
    console.log(`Found ${updateCount} laptops to update, prioritizing those without prices`);

    // Split laptops into chunks of 10
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < laptops.length; i += chunkSize) {
      chunks.push(laptops.slice(i, i + chunkSize));
    }

    console.log(`Split updates into ${chunks.length} chunks of ${chunkSize} laptops each`);
    
    // Process each chunk sequentially in the background
    const processChunks = async () => {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkIds = chunk.map(l => l.id);
        
        console.log(`Processing chunk ${i + 1}/${chunks.length} silently`);

        // Mark chunk laptops as pending update
        const { error: statusError } = await supabase
          .from('products')
          .update({ 
            update_status: 'pending_update',
            last_checked: new Date().toISOString()
          })
          .in('id', chunkIds);

        if (statusError) {
          console.error('Error marking laptops for update:', statusError);
          continue;
        }

        // Call edge function for this chunk
        try {
          const { error } = await supabase.functions.invoke('update-laptops', {
            body: { 
              laptops: chunk.map(l => ({ id: l.id, asin: l.asin }))
            }
          });
          
          if (error) {
            console.error(`Error processing chunk ${i + 1}:`, error);
            await supabase
              .from('products')
              .update({ update_status: 'error' })
              .in('id', chunkIds);
          } else {
            console.log(`Successfully initiated update for chunk ${i + 1}`);
          }
        } catch (error) {
          console.error(`Failed to process chunk ${i + 1}:`, error);
        }

        // Add a small delay between chunks to prevent rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    };

    // Start the background process without waiting for it to complete
    processChunks().catch(error => {
      console.error('Background process error:', error);
    });
    
    return { success: true };

  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    return { success: false };
  }
};
