
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Get ALL laptops with is_laptop=true that aren't already being processed
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin, update_status')
      .eq('is_laptop', true)
      .not('update_status', 'eq', 'in_progress')
      .not('update_status', 'eq', 'pending_update');

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      throw fetchError;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops available for update');
      toast({
        title: "No updates needed",
        description: "All laptops are either up to date or currently being processed",
      });
      return null;
    }

    console.log(`Found ${laptops.length} laptops to update`);
    
    // Mark laptops as pending update
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
    
    // Call edge function to update laptops
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        laptops: laptops.map(l => ({ id: l.id, asin: l.asin })),
      }
    });
    
    if (error) {
      console.error('Error calling update-laptops function:', error);
      // Reset status on error only for laptops that were pending
      await supabase
        .from('products')
        .update({ update_status: null })
        .in('id', laptops.map(l => l.id))
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
      description: `Starting updates for ${laptops.length} laptops. This may take several minutes to complete.`,
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
