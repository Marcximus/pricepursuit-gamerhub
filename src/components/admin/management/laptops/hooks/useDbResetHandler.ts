
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const useDbResetHandler = (refreshStats: () => Promise<void>) => {
  const resetPendingUpdates = async (): Promise<number> => {
    console.log('Resetting any stuck products in the database');
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ update_status: 'error' })
        .eq('update_status', 'pending_update')
        .select();
      
      if (error) {
        console.error('Error resetting pending_update products:', error);
        throw new Error(`Database error: ${error.message}`);
      } else {
        // Safely determine the count of reset records
        const resetCount = Array.isArray(data) ? data.length : 0;
        console.log(`Reset ${resetCount} pending_update products to error state`);
        return resetCount;
      }
    } catch (err) {
      console.error('Error in database reset operation:', err);
      // Convert any error to a more descriptive message
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Unknown database error occurred';
      throw new Error(`Failed to reset products: ${errorMessage}`);
    }
  };

  const handleReset = async (): Promise<void> => {
    console.log('Manually resetting update state');
    
    // Attempt to reset any hung database records
    try {
      const resetCount = await resetPendingUpdates();
      
      // Refresh stats to show updated status
      await refreshStats();
      
      toast({
        title: "Update Reset",
        description: `The update process has been manually reset. ${resetCount > 0 ? `Reset ${resetCount} pending updates.` : 'No pending updates were found.'}`,
        duration: 5000
      });
    } catch (err) {
      console.error('Error in reset operation:', err);
      
      // Provide more specific error messages based on the error type
      const errorMessage = err instanceof Error
        ? err.message
        : 'An unknown error occurred while resetting the update process';
      
      toast({
        title: "Reset Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
      });
      
      // Attempt to refresh stats even after error to ensure UI is up-to-date
      try {
        await refreshStats();
      } catch (refreshErr) {
        console.error('Failed to refresh stats after reset error:', refreshErr);
      }
    }
  };

  return {
    resetPendingUpdates,
    handleReset
  };
};
