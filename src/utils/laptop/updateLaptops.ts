
import { supabase } from "@/integrations/supabase/client";

export const updateLaptops = async () => {
  try {
    console.log('Starting silent update for ALL laptops...');
    
    // Get laptops with priority for those that haven't been updated in the longest time
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, title, last_checked')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .order('last_checked', { nullsFirst: true }) // Prioritize laptops that have never been checked
      .limit(100); // Limit to a reasonable number

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      return null;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      return null;
    }

    // Format timestamps for logging
    const formattedLaptops = laptops.map(laptop => ({
      ...laptop,
      formattedLastChecked: laptop.last_checked ? new Date(laptop.last_checked).toLocaleString() : 'Never checked'
    }));

    // Log detailed info about laptops to be updated - now using ASIN as primary identifier
    console.log(`Found ${laptops.length} laptops to update with the following priority:`);
    formattedLaptops.forEach((laptop, index) => {
      console.log(`${index + 1}. ASIN: ${laptop.asin}, Title: ${laptop.title?.substring(0, 30)}..., Last Checked: ${laptop.formattedLastChecked}, Current Price: ${laptop.current_price === null ? 'NULL' : `$${laptop.current_price}`}`);
    });

    // Group laptops by update status for better logging
    const neverCheckedLaptops = formattedLaptops.filter(l => !l.last_checked);
    const oldestCheckedLaptops = formattedLaptops.filter(l => l.last_checked).sort((a, b) => 
      new Date(a.last_checked).getTime() - new Date(b.last_checked).getTime()
    ).slice(0, 10);
    const nullPriceLaptops = formattedLaptops.filter(l => l.current_price === null);
    
    console.log('Laptop update priority distribution:');
    console.log(`- Never checked (highest priority): ${neverCheckedLaptops.length} laptops`);
    
    if (oldestCheckedLaptops.length > 0) {
      console.log('- Oldest checked laptops:');
      oldestCheckedLaptops.forEach((l, i) => {
        console.log(`  ${i+1}. ASIN: ${l.asin}, Last checked: ${l.formattedLastChecked}, Price: ${l.current_price === null ? 'NULL' : `$${l.current_price}`}`);
      });
    }
    
    console.log(`- NULL price laptops: ${nullPriceLaptops.length} laptops`);

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
        const chunkAsins = chunk.map(l => l.asin);
        
        console.log(`----- Processing chunk ${i + 1}/${chunks.length} -----`);
        console.log(`Chunk ${i + 1} laptops:`, chunk.map(l => ({ 
          asin: l.asin, 
          lastChecked: l.last_checked ? new Date(l.last_checked).toLocaleString() : 'Never',
          price: l.current_price === null ? 'NULL' : `$${l.current_price}`
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
          const { data, error } = await supabase.functions.invoke('update-laptops', {
            body: { 
              laptops: chunk.map(l => ({ 
                id: l.id, 
                asin: l.asin, 
                current_price: l.current_price, // Include current price to avoid zero-price overwrites
                title: l.title,
                last_checked: l.last_checked
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
          }
        } catch (error) {
          console.error(`Failed to process chunk ${i + 1} (ASINs: ${chunkAsins.join(', ')}):`, error);
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
