
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Triggering laptop updates...');
    
    const { count: inProgressCount, error: checkError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('update_status', 'in_progress');

    if (checkError) {
      console.error('Error checking update status:', checkError);
      throw checkError;
    }

    if (inProgressCount && inProgressCount > 0) {
      console.log('Update already in progress');
      toast({
        title: "Update in progress",
        description: "Please wait for the current update to complete",
      });
      return null;
    }
    
    // Find laptops needing updates
    const { count: updateCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'');

    if (countError) {
      console.error('Error counting laptops to update:', countError);
      throw countError;
    }

    if (!updateCount || updateCount === 0) {
      console.log('No laptops need updating');
      toast({
        title: "No updates needed",
        description: "All laptops are up to date",
      });
      return null;
    }

    console.log(`Found ${updateCount} laptops that need updating`);
    
    // Mark laptops as being updated
    const { error: statusError } = await supabase
      .from('products')
      .update({ update_status: 'in_progress' })
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'');

    if (statusError) {
      console.error('Error updating status:', statusError);
      throw statusError;
    }
    
    // Call edge function to update prices
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        count: updateCount,
        force_refresh: true
      }
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
      description: `Starting updates for ${updateCount} laptops. This may take a few minutes to complete.`,
    });
    return data;
  } catch (error) {
    console.error('Failed to update laptops:', error);
    try {
      // Reset status on error
      await supabase
        .from('products')
        .update({ update_status: 'pending' })
        .eq('update_status', 'in_progress');
    } catch (resetError) {
      console.error('Error resetting update status:', resetError);
    }
    toast({
      title: "Update failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};
