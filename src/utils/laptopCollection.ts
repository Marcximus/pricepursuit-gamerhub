
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const collectLaptops = async () => {
  try {
    console.log('Triggering laptop collection...');
    
    // First update all existing laptops to pending status
    await supabase
      .from('products')
      .update({ collection_status: 'pending' })
      .eq('is_laptop', true);
    
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      body: { 
        action: 'collect',
        mode: 'discovery' // This indicates we want to discover new laptops
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

export const updateLaptops = async () => {
  try {
    console.log('Triggering laptop updates...');
    
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: {}
    });
    
    if (error) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to start laptop updates",
        variant: "destructive"
      });
      throw new Error(error.message || 'Failed to update laptops');
    }
    
    console.log('Laptop update response:', data);
    toast({
      title: "Update started",
      description: `Starting updates for ${data.updated_count} laptops. This will take a few minutes to complete.`,
    });
    return data;
  } catch (error) {
    console.error('Failed to update laptops:', error);
    toast({
      title: "Update failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};

