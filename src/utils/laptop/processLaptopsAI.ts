
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const PARALLEL_PROCESSING = 1; // Process one at a time
const DELAY_BETWEEN_REQUESTS = 250; // 250ms delay between requests
const BATCH_SIZE = 5; // Process max 5 laptops at a time

export const processLaptopsAI = async () => {
  try {
    console.log('Starting AI processing for laptops...');
    
    // Get laptops that need AI processing, prioritizing:
    // 1. Never processed ones (ai_processing_status = 'pending')
    // 2. Failed ones (ai_processing_status = 'error')
    // 3. Interrupted ones (ai_processing_status = 'processing')
    // Order by created_at to process oldest first
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, ai_processing_status')
      .in('ai_processing_status', ['pending', 'error', 'processing'])
      .order('ai_processing_status', { ascending: true, nullsFirst: true }) // pending first
      .order('created_at', { ascending: true }) // oldest first
      .limit(BATCH_SIZE); // Process in smaller batches of 5

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      toast({
        title: "Error",
        description: "Failed to fetch laptops for processing",
        variant: "destructive"
      });
      return { success: false, error: fetchError };
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops need processing');
      toast({
        title: "No laptops to process",
        description: "All laptops have been processed",
        variant: "default"
      });
      return { success: true, processed: 0 };
    }

    console.log(`Found ${laptops.length} laptops to process`);
    let processedCount = 0;
    let errorCount = 0;

    // Process laptops one at a time
    for (const laptop of laptops) {
      try {
        console.log(`Processing laptop ${laptop.asin} (current status: ${laptop.ai_processing_status})...`);

        // Update status to in_progress with timestamp
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            ai_processing_status: 'processing',
            ai_processed_at: new Date().toISOString() 
          })
          .eq('id', laptop.id);

        if (updateError) {
          console.error(`Error updating status for laptop ${laptop.asin}:`, updateError);
          continue;
        }

        // Call the process-laptops-ai edge function
        const { error: processError } = await supabase.functions.invoke('process-laptops-ai', {
          body: { asin: laptop.asin }
        });

        if (processError) {
          console.error('Error processing laptop:', processError);
          errorCount++;
          
          // Update status to error with timestamp
          await supabase
            .from('products')
            .update({
              ai_processing_status: 'error',
              ai_processed_at: new Date().toISOString()
            })
            .eq('id', laptop.id);
            
          toast({
            title: "Processing Error",
            description: `Failed to process laptop ${laptop.asin}: ${processError.message}`,
            variant: "destructive"
          });
          continue;
        }

        processedCount++;
        console.log(`Successfully processed laptop ${laptop.asin}`);

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));

      } catch (error) {
        console.error(`Error processing laptop ${laptop.asin}:`, error);
        errorCount++;
        
        // Update status to error
        await supabase
          .from('products')
          .update({
            ai_processing_status: 'error',
            ai_processed_at: new Date().toISOString()
          })
          .eq('id', laptop.id);
      }
    }

    const summary = `Processed ${processedCount} laptops (${errorCount} errors)`;
    console.log(summary);

    toast({
      title: "Processing Complete",
      description: summary,
      variant: errorCount > 0 ? "destructive" : "default"
    });

    return { 
      success: true, 
      processed: processedCount,
      errors: errorCount 
    };

  } catch (error) {
    console.error('Failed to start AI processing:', error);
    toast({
      title: "Error",
      description: "Failed to start AI processing",
      variant: "destructive"
    });
    return { success: false, error };
  }
};
