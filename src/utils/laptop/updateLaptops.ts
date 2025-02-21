
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Get laptops with priority for those without prices - fixed OR syntax
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, current_price')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .or('current_price.is.null,current_price.eq.0')  // Fixed OR condition syntax
      .order('current_price', { nullsFirst: true });

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      throw fetchError;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found to update');
      toast({
        title: "No laptops found",
        description: "No laptops found in the database to update",
      });
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
    
    // Process each chunk sequentially
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkIds = chunk.map(l => l.id);
      
      // Log which laptops are being processed in this chunk
      console.log(`Processing chunk ${i + 1}/${chunks.length}:`, 
        chunk.map(l => ({ id: l.id, asin: l.asin, current_price: l.current_price }))
      );

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
        continue; // Continue with next chunk even if this one fails
      }

      // Call edge function for this chunk
      try {
        const { data, error } = await supabase.functions.invoke('update-laptops', {
          body: { 
            laptops: chunk.map(l => ({ id: l.id, asin: l.asin }))
          }
        });
        
        if (error) {
          console.error(`Error processing chunk ${i + 1}:`, error);
          // Reset status for failed chunk
          await supabase
            .from('products')
            .update({ update_status: 'error' })
            .in('id', chunkIds);
        } else {
          console.log(`Successfully initiated update for chunk ${i + 1}:`, data);
        }
      } catch (error) {
        console.error(`Failed to process chunk ${i + 1}:`, error);
      }

      // Add a small delay between chunks to prevent rate limiting
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    toast({
      title: "Update started",
      description: `Started batch updates for ${updateCount} laptops in ${chunks.length} chunks, prioritizing those without prices.`,
    });
    return { totalLaptops: updateCount, chunks: chunks.length };

  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    toast({
      title: "Update failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

