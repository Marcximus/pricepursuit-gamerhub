import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAutoRefreshManager } from './AutoRefreshManager';
import { useAutoUpdateManager } from './AutoUpdateManager';
import { clearIntervalSafely } from './utils/updateTimer';

interface UpdateProcessManagerProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

export const useUpdateProcessManager = ({ 
  updateLaptops, 
  refreshStats 
}: UpdateProcessManagerProps) => {
  // State for update tracking
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateStartTime, setUpdateStartTime] = useState<Date | null>(null);
  const [showLongUpdateMessage, setShowLongUpdateMessage] = useState(false);
  const [longUpdateWarningTimeout, setLongUpdateWarningTimeout] = useState<NodeJS.Timeout | null>(null);
  const [maxUpdateWarningTimeout, setMaxUpdateWarningTimeout] = useState<NodeJS.Timeout | null>(null);

  // Initialize auto-refresh manager
  const { 
    elapsedTime,
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefreshManager({
    isUpdating,
    updateStartTime,
    refreshStats
  });
  
  // Initialize auto-update manager
  const {
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate,
    schedulerStatus
  } = useAutoUpdateManager({
    isUpdating,
    onUpdate: handleUpdateLaptops
  });

  // Effect to check for stuck update status
  useEffect(() => {
    if (!isUpdating) return;
    
    // Set timeout for showing warning after 2 minutes
    const warningTimeout = setTimeout(() => {
      console.log('Update taking longer than expected (2 minutes). Showing warning...');
      setShowLongUpdateMessage(true);
      
      toast({
        title: "Updates Taking Longer Than Expected",
        description: "Updates are still in progress but taking longer than expected. You can refresh the page to reset.",
        variant: "destructive",
        duration: 10000
      });
    }, 2 * 60 * 1000); // 2 minutes
    
    // Set timeout for max update time (15 minutes)
    const maxTimeout = setTimeout(() => {
      console.log('Update timed out after 15 minutes. Auto-resetting...');
      forceResetUpdateState();
      
      toast({
        title: "Update Process Timed Out",
        description: "The update process took too long and was automatically reset.",
        variant: "destructive",
        duration: 10000
      });
    }, 15 * 60 * 1000); // 15 minutes
    
    setLongUpdateWarningTimeout(warningTimeout);
    setMaxUpdateWarningTimeout(maxTimeout);
    
    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(maxTimeout);
      setLongUpdateWarningTimeout(null);
      setMaxUpdateWarningTimeout(null);
    };
  }, [isUpdating]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      clearIntervalSafely(longUpdateWarningTimeout);
      clearIntervalSafely(maxUpdateWarningTimeout);
    };
  }, [longUpdateWarningTimeout, maxUpdateWarningTimeout]);

  // Handle update laptops button click
  async function handleUpdateLaptops() {
    if (isUpdating) {
      console.log('Already updating laptops, ignoring request');
      return;
    }
    
    console.log('Starting laptop update process');
    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateStartTime(new Date());
    setShowLongUpdateMessage(false);
    
    try {
      // Start auto-refreshing stats during update
      const autoRefreshInterval = startAutoRefresh();
      
      // Call the update function
      console.log('Calling updateLaptops function');
      await updateLaptops();
      
      // Final refresh of stats after update
      console.log('Update complete, refreshing stats one final time');
      await refreshStats();
      
      setUpdateSuccess(true);
      console.log('Laptop update process completed successfully');
      
      toast({
        title: "Update Complete",
        description: "All laptop data has been successfully updated.",
        duration: 5000
      });
    } catch (error) {
      console.error('Error updating laptops:', error);
      
      toast({
        title: "Update Failed",
        description: "There was an error updating laptop data. Please try again.",
        variant: "destructive",
        duration: 10000
      });
    } finally {
      // Clear any timeouts and stop auto-refresh
      clearIntervalSafely(longUpdateWarningTimeout);
      clearIntervalSafely(maxUpdateWarningTimeout);
      stopAutoRefresh();
      
      // Reset state
      setIsUpdating(false);
      setUpdateStartTime(null);
      setShowLongUpdateMessage(false);
    }
  }

  // Force reset update state (for manual reset button)
  const forceResetUpdateState = async () => {
    console.log('Manually resetting update state');
    
    // Clear any timeouts and stop auto-refresh
    clearIntervalSafely(longUpdateWarningTimeout);
    clearIntervalSafely(maxUpdateWarningTimeout);
    stopAutoRefresh();
    
    // Reset UI state
    setIsUpdating(false);
    setUpdateStartTime(null);
    setShowLongUpdateMessage(false);
    
    // Attempt to reset any hung database records
    try {
      console.log('Resetting any stuck products in the database');
      const { data, error } = await supabase
        .from('products')
        .update({ update_status: 'error' })
        .eq('update_status', 'pending_update');
      
      if (error) {
        console.error('Error resetting pending_update products:', error);
      } else {
        const resetCount = data ? data.length : 0;
        console.log(`Reset ${resetCount} pending_update products to error state`);
        
        // Refresh stats to show updated status
        await refreshStats();
      }
    } catch (err) {
      console.error('Error in database reset operation:', err);
    }
    
    toast({
      title: "Update Reset",
      description: "The update process has been manually reset.",
      duration: 5000
    });
  };

  // Generate button description based on current state
  const getDescription = (elapsedTime: number, timeUntilNextUpdate: number) => {
    if (isUpdating) {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      return `Updating product data... (${timeString})`;
    }
    
    if (autoUpdateEnabled) {
      const minutes = Math.floor(timeUntilNextUpdate / 60);
      const seconds = timeUntilNextUpdate % 60;
      const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      return `Auto-update enabled. Next update in ${timeString}`;
    }
    
    return "Update laptop prices, images, and specifications";
  };

  return {
    isUpdating,
    updateSuccess,
    elapsedTime,
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate,
    handleUpdateLaptops,
    getDescription,
    forceResetUpdateState
  };
};
