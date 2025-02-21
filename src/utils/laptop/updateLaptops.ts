
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Triggering laptop updates...');
    
    // Find laptops needing updates with explicit status check
    const { data: laptopsToUpdate, error: countError } = await supabase
      .from('products')
      .select('id')
      .eq('is_laptop', true)
      .or('current_price.is.null,last_checked.lt.now()-interval\'1 day\'')
      .is('update_status', null); // Only select laptops not currently being updated

    if (countError) {
      console.error('Error finding laptops to update:', countError);
      throw countError;
    }

    if (!laptopsToUpdate || laptopsToUpdate.length === 0) {
      console.log('No laptops need updating');
      toast({
        title: "No updates needed",
        description: "All laptops are up to date",
      });
      return null;
    }

    const updateCount = laptopsToUpdate.length;
    console.log(`Found ${updateCount} laptops that need updating`);
    
    // Mark laptops for update with correct status
    const { error: statusError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending_update',
        last_checked: new Date().toISOString()
      })
      .in('id', laptopsToUpdate.map(l => l.id));

    if (statusError) {
      console.error('Error updating status:', statusError);
      throw statusError;
    }
    
    // Call edge function to update prices
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        count: updateCount
      }
    });
    
    if (error) {
      console.error('Error updating laptops:', error);
      // Reset status on error for affected laptops
      await supabase
        .from('products')
        .update({ update_status: null })
        .in('id', laptopsToUpdate.map(l => l.id));
        
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
    toast({
      title: "Update failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};
