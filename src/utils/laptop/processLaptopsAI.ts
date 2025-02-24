
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const PARALLEL_PROCESSING = 1; // Process one at a time
const DELAY_BETWEEN_REQUESTS = 250; // 250ms delay between requests
const BATCH_SIZE = 5; // Process max 5 laptops at a time
const TIMEOUT_DURATION = 30000; // 30 second timeout

export const processLaptopsAI = async () => {
  try {
    console.log('Starting AI processing for laptops...');
    
    // Get laptops that need AI processing
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, ai_processing_status')
      .in('ai_processing_status', ['pending', 'error', 'processing'])
      .order('ai_processing_status', { ascending: true, nullsFirst: true }) // pending first
      .order('created_at', { ascending: true }) // oldest first
      .limit(BATCH_SIZE);

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
    toast({
      title: "Processing Started",
      description: `Starting to process ${laptops.length} laptops...`,
    });

    let processedCount = 0;
    let errorCount = 0;

    // Process laptops one at a time
    for (const laptop of laptops) {
      try {
        console.log(`Processing laptop ${laptop.asin} (current status: ${laptop.ai_processing_status})...`);

        // Update status to processing
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            ai_processing_status: 'processing',
            ai_processed_at: new Date().toISOString() 
          })
          .eq('id', laptop.id);

        if (updateError) {
          console.error(`Error updating status for laptop ${laptop.asin}:`, updateError);
          errorCount++;
          continue;
        }

        // Call the process-laptops-ai edge function with a timeout
        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Function timed out')), TIMEOUT_DURATION);
          });

          const processingPromise = supabase.functions.invoke('process-laptops-ai', {
            body: { asin: laptop.asin }
          });

          const response = await Promise.race([processingPromise, timeoutPromise]);

          if ('error' in response) throw response.error;
          
          processedCount++;
          console.log(`Successfully processed laptop ${laptop.asin}`);

          // Show progress toast every few laptops
          if (processedCount % 2 === 0 || processedCount === laptops.length) {
            toast({
              title: "Processing Progress",
              description: `Processed ${processedCount} of ${laptops.length} laptops`,
            });
          }

        } catch (edgeFunctionError) {
          console.error('Edge function error:', edgeFunctionError);
          errorCount++;
          
          // Update status to error
          await supabase
            .from('products')
            .update({
              ai_processing_status: 'error',
              ai_processed_at: new Date().toISOString()
            })
            .eq('id', laptop.id);

          toast({
            title: "Processing Error",
            description: `Failed to process laptop ${laptop.asin}. Will retry later.`,
            variant: "destructive"
          });
        }

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
