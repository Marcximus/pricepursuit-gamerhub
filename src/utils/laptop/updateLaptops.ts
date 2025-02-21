
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateLaptops = async () => {
  try {
    console.log('Starting update for ALL laptops...');
    
    // Get ALL laptops
    const { data: laptops, error: fetchError } = await supabase
      .from('products')
      .select('id, asin')
      .eq('is_laptop', true);

    if (fetchError) {
      console.error('Error fetching laptops:', fetchError);
      throw fetchError;
    }

    if (!laptops || laptops.length === 0) {
      console.log('No laptops found');
      toast({
        title: "No laptops found",
        description: "No laptops available in the database",
      });
      return null;
    }

    console.log(`Found ${laptops.length} laptops to update`);

    // Call edge function to update laptops
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { laptops }
    });

    if (error) {
      console.error('Error calling update-laptops function:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to start laptop updates",
        variant: "destructive"
      });
      throw error;
    }

    console.log('Update started:', data);
    toast({
      title: "Update started",
      description: `Processing ${laptops.length} laptops. This may take several minutes.`,
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

