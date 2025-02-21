
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const refreshBrandModels = async () => {
  try {
    console.log('Initiating brand and model refresh...');
    
    const { count: inProgressCount, error: checkError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .eq('collection_status', 'refreshing');

    if (checkError) {
      console.error('Error checking refresh status:', checkError);
      throw checkError;
    }

    if (inProgressCount && inProgressCount > 0) {
      console.log('Refresh already in progress');
      toast({
        title: "Refresh in progress",
        description: "Please wait for the current refresh to complete",
      });
      return null;
    }
    
    const { count: refreshCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_laptop', true)
      .or('brand.is.null,model.is.null');

    if (countError) {
      console.error('Error counting laptops to refresh:', countError);
      throw countError;
    }

    if (!refreshCount || refreshCount === 0) {
      console.log('No laptops need refreshing');
      toast({
        title: "No refresh needed",
        description: "All laptops have brand and model information",
      });
      return null;
    }

    console.log(`Found ${refreshCount} laptops that need brand/model refresh`);
    
    const { error: statusError } = await supabase
      .from('products')
      .update({ collection_status: 'refreshing' })
      .eq('is_laptop', true)
      .or('brand.is.null,model.is.null');

    if (statusError) {
      console.error('Error updating refresh status:', statusError);
      throw statusError;
    }
    
    const { data, error } = await supabase.functions.invoke('collect-laptops', {
      body: { 
        action: 'refresh-brands',
        mode: 'brand_model_refresh',
        force_refresh: true
      }
    });
    
    if (error) {
      console.error('Error refreshing brands/models:', error);
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to start brand/model refresh",
        variant: "destructive"
      });
      throw new Error(error.message || 'Failed to refresh brands/models');
    }
    
    console.log('Brand/model refresh response:', data);
    toast({
      title: "Refresh started",
      description: `Starting brand/model refresh for ${refreshCount} laptops. This will take a few minutes to complete.`,
    });
    return data;
  } catch (error) {
    console.error('Failed to refresh brands/models:', error);
    try {
      await supabase
        .from('products')
        .update({ collection_status: 'pending' })
        .eq('collection_status', 'refreshing');
    } catch (resetError) {
      console.error('Error resetting refresh status:', resetError);
    }
    toast({
      title: "Refresh failed",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    throw error;
  }
};
