
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Triggering laptop updates...');
    
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
    
    // Mark laptops for update with explicit status
    const { error: statusError } = await supabase
      .from('products')
      .update({ update_status: 'pending_update' })
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
      // Reset status on error
      await supabase
        .from('products')
        .update({ update_status: null })
        .eq('update_status', 'pending_update');
        
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
  } catch (error: any) {
    console.error('Failed to update laptops:', error);
    try {
      // Reset status on error
      await supabase
        .from('products')
        .update({ update_status: null })
        .eq('update_status', 'pending_update');
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
