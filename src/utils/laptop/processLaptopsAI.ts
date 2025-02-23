
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const PARALLEL_PROCESSING = 1; // Process one at a time
const DELAY_BETWEEN_REQUESTS = 1000; // 1 second delay between requests

export const processLaptopsAI = async () => {
  try {
    console.log('Starting AI processing for laptops...');
    
    // Get laptops that need AI processing
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('ai_processing_status', 'pending')
      .order('created_at', { ascending: true });

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

    // Process laptops one at a time
    for (const laptop of laptops) {
      try {
        // Update status to in_progress
        await supabase
          .from('products')
          .update({ ai_processing_status: 'processing' })
          .eq('id', laptop.id);

        console.log(`Processing laptop ${laptop.asin}...`);

        const { error: processError } = await supabase.functions.invoke('process-laptops-ai', {
          body: { asin: laptop.asin }
        });

        if (processError) {
          console.error('Error processing laptop:', processError);
          
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
            description: `Failed to process laptop ${laptop.asin}: ${processError.message}`,
            variant: "destructive"
          });
          continue;
        }

        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));

      } catch (error) {
        console.error(`Error processing laptop ${laptop.asin}:`, error);
      }
    }

    toast({
      title: "Processing Complete",
      description: `Completed processing ${laptops.length} laptops`,
      variant: "default"
    });

    return { success: true, processed: laptops.length };

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
