
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const collectLaptops = async () => {
  try {
    console.log('Triggering laptop collection...');
    
    const { data: existingLaptops, error: checkError } = await supabase
      .from('products')
      .select('id, last_collection_attempt')
      .eq('is_laptop', true)
      .order('last_collection_attempt', { ascending: true })
      .limit(1);

    if (checkError) {
      console.error('Error checking existing laptops:', checkError);
      throw checkError;
    }

    // Check if we've attempted collection recently (within last 5 minutes)
    const lastAttempt = existingLaptops?.[0]?.last_collection_attempt;
    if (lastAttempt && new Date(lastAttempt).getTime() > Date.now() - 5 * 60 * 1000) {
      console.log('Collection attempted too recently, waiting...');
      toast({
        title: "Collection in progress",
        description: "Please wait a few minutes before starting another collection",
      });
      return null;
    }
    
    // First update all existing laptops to pending status
    const { data: updatedLaptops, error: updateError } = await supabase
      .from('products')
      .update({ 
        collection_status: 'pending',
        last_collection_attempt: new Date().toISOString()
      })
      .eq('is_laptop', true)
      .select();

    if (updateError) {
      console.error('Error updating laptop status:', updateError);
      throw updateError;
    }
    console.log(`Updated ${updatedLaptops?.length || 0} laptops to pending status`);
    
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      body: { 
        action: 'start',
        mode: 'discovery',
        force_refresh: true
      }
    });
    
    if (error) {
      console.error('Error collecting laptops:', error);
      toast({
        title: "Collection failed",
        description: error.message || "Failed to start laptop collection",
        variant: "destructive"
      });
      throw new Error(error.message || 'Failed to collect laptops');
    }
    
    console.log('Laptop collection response:', data);
    toast({
      title: "Collection started",
      description: "The laptop discovery process has started and will take several minutes to complete. The data will refresh automatically.",
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
