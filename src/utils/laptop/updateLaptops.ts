
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Get ALL laptops with is_laptop=true, no other filters
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, update_status')
      .eq('is_laptop', true);

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      throw fetchError;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found in database');
      toast({
        title: "No laptops found",
        description: "No laptops found in the database to update",
      });
      return null;
    }

    // Filter out laptops that are already being processed
    const laptopsToUpdate = laptops.filter(l => 
      l.update_status !== 'in_progress' && l.update_status !== 'pending_update'
    );

    if (laptopsToUpdate.length === 0) {
      console.log('All laptops are already being processed');
      toast({
        title: "Update in progress",
        description: "All laptops are currently being updated. Please wait for the current update to complete.",
      });
      return null;
    }

    const updateCount = laptopsToUpdate.length;
    console.log(`Found ${updateCount} laptops to update`);
    
    // Mark laptops as pending update
    const { error: statusError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending_update',
        last_checked: new Date().toISOString()
      })
      .in('id', laptopsToUpdate.map(l => l.id));

    if (statusError) {
      console.error('Error marking laptops for update:', statusError);
      throw statusError;
    }
    
    // Call edge function to update laptops
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        laptops: laptopsToUpdate.map(l => ({ id: l.id, asin: l.asin })),
      }
    });
    
    if (error) {
      console.error('Error calling update-laptops function:', error);
      // Reset status on error only for laptops that were pending
      await supabase
        .from('products')
        .update({ update_status: null })
        .in('id', laptopsToUpdate.map(l => l.id))
        .eq('update_status', 'pending_update');
        
      toast({
        title: "Update failed",
        description: error.message || "Failed to start laptop updates",
        variant: "destructive"
      });
      throw error;
    }
    
    console.log('Update response:', data);
    toast({
      title: "Update started",
      description: `Starting updates for ${updateCount} laptops. This may take several minutes to complete.`,
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
