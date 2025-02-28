
import { supabase } from "@/integrations/supabase/client";

export const updateLaptops = async () => {
  try {
    console.log('Starting silent update for ALL laptops...');
    
    // Get laptops with priority for those without prices
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, title')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .order('current_price', { nullsFirst: true }) // Prioritize NULL prices
      .limit(100); // Limit to a reasonable number

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      return null;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      return null;
    }

    // Log detailed info about laptops to be updated
    console.log(`Found ${laptops.length} laptops to update with the following priority:`);
    laptops.forEach((laptop, index) => {
      console.log(`${index + 1}. ID: ${laptop.id}, ASIN: ${laptop.asin}, Title: ${laptop.title?.substring(0, 30)}..., Current Price: ${laptop.current_price === null ? 'NULL (High Priority)' : `$${laptop.current_price}`}`);
    });

    // Group laptops by price status for better logging
    const nullPriceLaptops = laptops.filter(l => l.current_price === null);
    const zeroPriceLaptops = laptops.filter(l => l.current_price === 0);
    const withPriceLaptops = laptops.filter(l => l.current_price !== null && l.current_price > 0);
    
    console.log('Price distribution of laptops to update:');
    console.log(`- NULL price (highest priority): ${nullPriceLaptops.length} laptops`);
    console.log(`- Zero price: ${zeroPriceLaptops.length} laptops`);
    console.log(`- With price: ${withPriceLaptops.length} laptops`);

    // Split laptops into chunks of 10
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < laptops.length; i += chunkSize) {
      chunks.push(laptops.slice(i, i + chunkSize));
    }

    console.log(`Split updates into ${chunks.length} chunks of up to ${chunkSize} laptops each`);
    
    // Process each chunk sequentially in the background
    const processChunks = async () => {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkIds = chunk.map(l => l.id);
        
        console.log(`----- Processing chunk ${i + 1}/${chunks.length} -----`);
        console.log(`Chunk ${i + 1} laptops:`, chunk.map(l => ({ 
          id: l.id.substring(0, 8) + '...', 
          asin: l.asin, 
          price: l.current_price === null ? 'NULL' : `$${l.current_price}`
        })));

        // Mark chunk laptops as pending update
        console.log(`Marking ${chunk.length} laptops as pending_update`);
        const { error: statusError } = await supabase
          .from('products')
          .update({ 
            update_status: 'pending_update',
            last_checked: new Date().toISOString()
          })
          .in('id', chunkIds);

        if (statusError) {
          console.error(`Error marking chunk ${i + 1} laptops for update:`, statusError);
          continue;
        }

        // Call edge function for this chunk
        try {
          console.log(`Invoking update-laptops function for chunk ${i + 1} with ${chunk.length} laptops`);
          const { data, error } = await supabase.functions.invoke('update-laptops', {
            body: { 
              laptops: chunk.map(l => ({ id: l.id, asin: l.asin, title: l.title }))
            }
          });
          
          if (error) {
            console.error(`Error processing chunk ${i + 1}:`, error);
            console.log(`Marking chunk ${i + 1} laptops as error due to function invocation failure`);
            await supabase
              .from('products')
              .update({ update_status: 'error' })
              .in('id', chunkIds);
          } else {
            console.log(`Successfully initiated update for chunk ${i + 1} with response:`, data);
          }
        } catch (error) {
          console.error(`Failed to process chunk ${i + 1}:`, error);
        }

        // Add a small delay between chunks to prevent rate limiting
        if (i < chunks.length - 1) {
          const delayMs = 2000;
          console.log(`Adding ${delayMs}ms delay before processing next chunk...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
      
      console.log('All chunks processing completed');
    };

    // Start the background process without waiting for it to complete
    processChunks().catch(error => {
      console.error('Background process error:', error);
    });
    
    return { success: true, message: `Started updating ${laptops.length} laptops in ${chunks.length} chunks` };

  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    return { success: false, error: error.message };
  }
};
