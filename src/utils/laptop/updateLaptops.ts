
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Triggering laptop updates...');
    
    // Get ALL laptops, regardless of status
    const { data: laptopsToUpdate, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true);

    if (fetchError) {
      console.error('Error finding laptops to update:', fetchError);
      throw fetchError;
    }

    if (!laptopsToUpdate || laptopsToUpdate.length === 0) {
      console.log('No laptops found in database');
      toast({
        title: "No laptops found",
        description: "No laptops found in the database to update",
      });
      return null;
    }

    const updateCount = laptopsToUpdate.length;
    console.log(`Found ${updateCount} laptops to update`);
    
    // Mark ALL laptops for update
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
    
    // Call edge function to update ALL laptops
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        updateAll: true // New flag to indicate we want to update all laptops
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
      description: `Starting updates for ${updateCount} laptops. This will take approximately ${Math.ceil(updateCount/60)} minutes to complete.`,
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

