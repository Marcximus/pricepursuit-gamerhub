
import { useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useAutoRefreshManager } from './AutoRefreshManager';
import { useAutoUpdateManager } from './AutoUpdateManager';
import { formatElapsedTime, formatTimeUntilNextUpdate } from './utils/updateTimer';

interface UpdateProcessManagerProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

export const useUpdateProcessManager = ({ 
  updateLaptops, 
  refreshStats 
}: UpdateProcessManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const [updateStartTime, setUpdateStartTime] = useState<Date | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  
  // Initialize auto-refresh functionality
  const { 
    elapsedTime, 
    startAutoRefresh, 
    stopAutoRefresh 
  } = useAutoRefreshManager({
    isUpdating,
    updateStartTime,
    refreshStats
  });
  
  // Initialize auto-update functionality
  const { 
    autoUpdateEnabled, 
    timeUntilNextUpdate, 
    toggleAutoUpdate 
  } = useAutoUpdateManager({
    isUpdating,
    onUpdate: handleUpdateLaptops
  });

  // Main function to handle laptop updates
  async function handleUpdateLaptops() {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      setUpdateStartTime(new Date());
      setUpdateSuccess(false);
      
      console.log('Update Laptops button clicked');
      console.log('Starting laptop update process...');
      
      // Immediately refresh stats to get current state
      try {
        await refreshStats();
      } catch (err) {
        console.error('Error refreshing stats before update:', err);
        // Continue with update process despite refresh error
      }
      
      const result = await updateLaptops();
      console.log('Update result:', result);
      
      if (result && result.success) {
        const countMatch = result.message.match(/Started updating (\d+) laptops/);
        const count = countMatch ? parseInt(countMatch[1]) : 0;
        setUpdateCount(count);
        setUpdateSuccess(true);
        
        toast({
          title: "Update Started",
          description: `${result.message || "Started updating laptop information."} The progress will be updated automatically.`,
        });

        // Start auto-refreshing stats
        startAutoRefresh();
        
        // After 20 minutes (increased from 12 minutes), stop the auto-refresh and do one final refresh
        // This accounts for the larger batch sizes and potential longer processing time
        setTimeout(() => {
          if (isUpdating) {
            console.log('Scheduled final refresh after timeout');
            stopAutoRefresh();
            
            refreshStats()
              .then(() => {
                console.log('Final refresh completed');
                setIsUpdating(false);
              })
              .catch(err => {
                console.error('Error during final refresh:', err);
                setIsUpdating(false);
              });
          }
        }, 20 * 60 * 1000); // 20 minutes
      } else {
        setUpdateSuccess(false);
        toast({
          title: "Update Status",
          description: result?.error || result?.message || "Failed to start laptop updates. Please check console for details.",
          variant: result?.success === false ? "destructive" : "default"
        });
        console.error('Update finished with result:', result);
        setIsUpdating(false);
        stopAutoRefresh();
      }
      
      // Refresh stats again after starting updates
      try {
        await refreshStats();
      } catch (err) {
        console.error('Error refreshing stats after update:', err);
      }
    } catch (error: any) {
      console.error('Error updating laptops:', error);
      setUpdateSuccess(false);
      toast({
        title: "Error",
        description: "Failed to start laptop updates: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
      stopAutoRefresh();
      setIsUpdating(false);
    }
  }

  // Get descriptive status text
  const getDescription = (elapsedTime: number, timeUntilNextUpdate: number) => {
    if (isUpdating && updateCount > 0) {
      return `Currently updating ${updateCount} laptops in batches of 20. Process has been running for ${formatElapsedTime(elapsedTime)}. Updates prioritize oldest check date, missing prices and images.`;
    }
    
    if (autoUpdateEnabled && !isUpdating) {
      return `Auto-update enabled. Next update in ${formatTimeUntilNextUpdate(timeUntilNextUpdate)}. Updates prioritize oldest check date, missing prices and images.`;
    }
    
    return "Update prices and information for all laptops - prioritizes by oldest check date, missing prices and images";
  };

  return {
    isUpdating,
    updateSuccess,
    updateCount,
    elapsedTime,
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate,
    handleUpdateLaptops,
    getDescription
  };
}
