
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const collectLaptops = async () => {
  try {
    console.log('Triggering laptop collection...');
    
    const { data: existingLaptops, error: checkError } = await supabase
      .from('products')
      .select('id, last_collection_attempt')
      .eq('is_laptop', true)
      .order('last_collection_attempt', { ascending: true })
      .limit(1);

    if (checkError) {
      console.error('Error checking existing laptops:', checkError);
      throw checkError;
    }

    // Check if we've attempted collection recently (within last 5 minutes)
    const lastAttempt = existingLaptops?.[0]?.last_collection_attempt;
    if (lastAttempt && new Date(lastAttempt).getTime() > Date.now() - 5 * 60 * 1000) {
      console.log('Collection attempted too recently, waiting...');
      toast({
        title: "Collection in progress",
        description: "Please wait a few minutes before starting another collection",
      });
      return null;
    }
    
    // First update all existing laptops to pending status
    const { data: updatedLaptops, error: updateError } = await supabase
      .from('products')
      .update({ 
        collection_status: 'pending',
        last_collection_attempt: new Date().toISOString()
      })
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
        mode: 'discovery',
        force_refresh: true // Force a fresh collection
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
    
    // Check if an update is already in progress
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
    
    const { data, error } = await supabase.functions.invoke('update-laptops', {
      body: { 
        count: updateCount,
        force_refresh: true // Force refresh of all data
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
      description: `Starting updates for ${data.updated_count} laptops. This will take a few minutes to complete.`,
    });
    return data;
  } catch (error) {
    console.error('Failed to update laptops:', error);
    // Reset update status on error
    try {
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

export const refreshBrandModels = async () => {
  try {
    console.log('Initiating brand and model refresh...');
    
    // Check if a refresh is already in progress
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
    
    // First get count of laptops that need brand/model refresh
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
    
    // Mark laptops as being refreshed
    const { error: statusError } = await supabase
      .from('products')
      .update({ collection_status: 'refreshing' })
      .eq('is_laptop', true)
      .or('brand.is.null,model.is.null');

    if (statusError) {
      console.error('Error updating refresh status:', statusError);
      throw statusError;
    }
    
    // Call edge function to handle the refresh
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
    // Reset refresh status on error
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


