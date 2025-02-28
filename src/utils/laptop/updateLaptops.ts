
import { supabase } from "@/integrations/supabase/client";
import { processOxylabsResponse } from "./oxylabsDataProcessor";
import { logLaptopProcessingDetails } from "./collection/status/processingLogs";

export const updateLaptops = async () => {
  try {
    console.log('Starting silent update for ALL laptops...');
    
    // Get laptops with priority for those that haven't been updated in the longest time
    // or missing image_url
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price, title, last_checked, image_url')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .or(`last_checked.is.null,image_url.is.null`) // Prioritize laptops with no image URLs
      .order('last_checked', { nullsFirst: true }) // Prioritize laptops that have never been checked
      .limit(100); // Limit to a reasonable number

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      return { success: false, message: 'No laptops found to update' };
    }

    // Format timestamps for logging
    const formattedLaptops = laptops.map(laptop => ({
      ...laptop,
      formattedLastChecked: laptop.last_checked ? new Date(laptop.last_checked).toLocaleString() : 'Never checked'
    }));

    // Log detailed info about laptops to be updated - now using ASIN as primary identifier
    console.log(`Found ${laptops.length} laptops to update with the following priority:`);
    formattedLaptops.forEach((laptop, index) => {
      console.log(`${index + 1}. ASIN: ${laptop.asin}, Title: ${laptop.title?.substring(0, 30)}..., Last Checked: ${laptop.formattedLastChecked}, Current Price: ${laptop.current_price === null ? 'NULL' : `$${laptop.current_price}`}, Has Image: ${laptop.image_url ? 'Yes' : 'No'}`);
    });

    // Group laptops by update status for better logging
    const neverCheckedLaptops = formattedLaptops.filter(l => !l.last_checked);
    const oldestCheckedLaptops = formattedLaptops.filter(l => l.last_checked).sort((a, b) => 
      new Date(a.last_checked).getTime() - new Date(b.last_checked).getTime()
    ).slice(0, 10);
    const nullPriceLaptops = formattedLaptops.filter(l => l.current_price === null);
    const noImageLaptops = formattedLaptops.filter(l => !l.image_url);
    
    console.log('Laptop update priority distribution:');
    console.log(`- Never checked (highest priority): ${neverCheckedLaptops.length} laptops`);
    console.log(`- Missing images: ${noImageLaptops.length} laptops`);
    
    if (oldestCheckedLaptops.length > 0) {
      console.log('- Oldest checked laptops:');
      oldestCheckedLaptops.forEach((l, i) => {
        console.log(`  ${i+1}. ASIN: ${l.asin}, Last checked: ${l.formattedLastChecked}, Price: ${l.current_price === null ? 'NULL' : `$${l.current_price}`}, Has Image: ${l.image_url ? 'Yes' : 'No'}`);
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

// Create a helper function to process an update response directly
export const processUpdateResponse = (response: any, existingData: any) => {
  if (!response || !response.results || !response.results.length) {
    console.error('Invalid update response format');
    return null;
  }
  
  try {
    // Process through our enhanced Oxylabs processor
    const processedData = processOxylabsResponse(response);
    
    if (!processedData) {
      console.error('Failed to process data');
      return null;
    }
    
    // Log detailed processing information for debugging
    logLaptopProcessingDetails(
      processedData.asin,
      processedData.title,
      processedData,
      existingData
    );
    
    return processedData;
  } catch (error) {
    console.error('Error in processUpdateResponse:', error);
    return null;
  }
};
