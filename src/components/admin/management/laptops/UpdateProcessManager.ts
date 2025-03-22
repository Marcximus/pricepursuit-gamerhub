
import { useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useAutoRefreshManager } from './AutoRefreshManager';
import { useAutoUpdateManager } from './AutoUpdateManager';
import { useUpdateState } from './hooks/useUpdateState';
import { useDbResetHandler } from './hooks/useDbResetHandler';
import { useUpdateDescription } from './hooks/useUpdateDescription';
import { 
  clearIntervalSafely, 
  clearTimeoutSafely,
  createLongUpdateWarningTimeout,
  createMaxUpdateTimeout
} from './utils/updateTimerUtils';

interface UpdateProcessManagerProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

export const useUpdateProcessManager = ({ 
  updateLaptops, 
  refreshStats 
}: UpdateProcessManagerProps) => {
  // Use the update state hook
  const {
    isUpdating,
    updateSuccess,
    updateStartTime,
    showLongUpdateMessage,
    longUpdateWarningTimeout,
    maxUpdateWarningTimeout,
    setIsUpdating,
    setUpdateSuccess,
    setUpdateStartTime,
    setShowLongUpdateMessage,
    setLongUpdateWarningTimeout,
    setMaxUpdateWarningTimeout,
    resetState
  } = useUpdateState();

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

  // Initialize database reset handler
  const { handleReset } = useDbResetHandler(refreshStats);

  // Use the description generator
  const { getDescription } = useUpdateDescription();

  // Effect to check for stuck update status
  useEffect(() => {
    if (!isUpdating) return;
    
    // Set timeout for showing warning after 2 minutes
    const warningTimeout = createLongUpdateWarningTimeout(setShowLongUpdateMessage);
    
    // Set timeout for max update time (15 minutes)
    const maxTimeout = createMaxUpdateTimeout(forceResetUpdateState);
    
    setLongUpdateWarningTimeout(warningTimeout);
    setMaxUpdateWarningTimeout(maxTimeout);
    
    return () => {
      clearTimeoutSafely(warningTimeout);
      clearTimeoutSafely(maxTimeout);
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
      clearTimeoutSafely(longUpdateWarningTimeout);
      clearTimeoutSafely(maxUpdateWarningTimeout);
      stopAutoRefresh();
      
      // Reset state
      setIsUpdating(false);
      setUpdateStartTime(null);
      setShowLongUpdateMessage(false);
    }
  }

  // Force reset update state (for manual reset button)
  const forceResetUpdateState = async () => {
    // Clear any timeouts and stop auto-refresh
    clearTimeoutSafely(longUpdateWarningTimeout);
    clearTimeoutSafely(maxUpdateWarningTimeout);
    stopAutoRefresh();
    
    // Reset UI state
    resetState();
    
    // Reset database records
    await handleReset();
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
