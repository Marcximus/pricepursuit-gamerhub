
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const collectLaptops = async () => {
  try {
    console.log('Checking collection status...');
    
    // Check if collection is already in progress
    const { count: inProgressCount, error: checkError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('collection_status', 'in_progress');

    if (checkError) {
      console.error('Error checking collection status:', checkError);
      throw checkError;
    }

    if (inProgressCount && inProgressCount > 0) {
      console.log('Collection already in progress');
      toast({
        title: "Collection in progress",
        description: "Please wait for the current collection to complete",
      });
      return null;
    }

    // Start collection process
    console.log('Starting laptop collection...');
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      body: { 
        force_refresh: true,
        mode: 'full_collection'
      }
    });

    if (error) {
      console.error('Error collecting laptops:', error);
      toast({
        title: "Collection failed",
        description: error.message || "Failed to start laptop collection",
        variant: "destructive"
      });
      throw error;
    }

    console.log('Collection response:', data);
    toast({
      title: "Collection started",
      description: "Started collecting new laptops. This may take a few minutes.",
    });
    
    return data;
  } catch (error) {
    console.error('Failed to collect laptops:', error);
    toast({
      title: "Collection failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};
