
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Get ALL laptops with is_laptop=true, no other filters
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
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

    const updateCount = laptops.length;
    console.log(`Found ${updateCount} laptops to update`);
    
    // Mark ALL laptops as pending update
    const { error: statusError } = await supabase
      .from('products')
      .update({ 
        update_status: 'pending_update',
        last_checked: new Date().toISOString()
      })
      .in('id', laptops.map(l => l.id));

    if (statusError) {
      console.error('Error marking laptops for update:', statusError);
      throw statusError;
    }
    
    // Call edge function to update ALL laptops
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        laptops: laptops.map(l => ({ id: l.id, asin: l.asin })),
        updateAll: true // Flag to indicate we want ALL laptops updated
      }
    });
    
    if (error) {
      console.error('Error calling update-laptops function:', error);
      // Reset status on error
      await supabase
        .from('products')
        .update({ update_status: null })
        .in('id', laptops.map(l => l.id));
        
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
