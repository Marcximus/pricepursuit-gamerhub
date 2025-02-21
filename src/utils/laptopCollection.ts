
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const collectLaptops = async () => {
  try {
    console.log('Triggering laptop collection...');
    
    // First update all existing laptops to pending status
    const { data: updatedLaptops, error: updateError } = await supabase
      .from('products')
      .update({ collection_status: 'pending' })
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
        mode: 'discovery'
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
    
    // Get count of laptops that need updating
    const { count: updateCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'');

    if (countError) {
      console.error('Error counting laptops to update:', countError);
      throw countError;
    }
    console.log(`Found ${updateCount} laptops that need updating`);
    
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { count: updateCount }
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

