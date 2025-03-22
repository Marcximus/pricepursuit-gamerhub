
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
        return 0;
      } else {
        // Safely determine the count of reset records
        const resetCount = Array.isArray(data) ? data.length : 0;
        console.log(`Reset ${resetCount} pending_update products to error state`);
        return resetCount;
      }
    } catch (err) {
      console.error('Error in database reset operation:', err);
      return 0;
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
        description: `The update process has been manually reset. ${resetCount > 0 ? `Reset ${resetCount} pending updates.` : ''}`,
        duration: 5000
      });
    } catch (err) {
      console.error('Error in reset operation:', err);
      
      toast({
        title: "Reset Error",
        description: "Failed to reset update process. Please try again.",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return {
    resetPendingUpdates,
    handleReset
  };
};
