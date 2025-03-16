
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { useAutoUpdateManager } from './AutoUpdateManager';
import { supabase } from "@/integrations/supabase/client";

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapsedInterval, setElapsedInterval] = useState<NodeJS.Timeout | null>(null);
  const [stuckTimeout, setStuckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Initialize auto-update functionality
  const { 
    autoUpdateEnabled, 
    timeUntilNextUpdate, 
    toggleAutoUpdate,
    schedulerStatus
  } = useAutoUpdateManager({
    isUpdating,
    onUpdate: () => handleUpdateLaptops() // Use the same function for scheduled updates
  });

  // Reset any stuck update state on component load
  useEffect(() => {
    const resetStuckState = async () => {
      // Check if it's been stuck for more than 15 minutes
      if (updateStartTime) {
        const now = new Date();
        const diffMinutes = (now.getTime() - updateStartTime.getTime()) / (1000 * 60);
        
        if (diffMinutes > 15 && isUpdating) {
          console.log('Update has been stuck for more than 15 minutes, resetting state...');
          
          try {
            // Force reset any in-progress laptops
            await supabase
              .from('products')
              .update({ update_status: 'pending' })
              .in('update_status', ['pending_update', 'in_progress']);
            
            // Clear the updating state
            setIsUpdating(false);
            setUpdateStartTime(null);
            
            toast({
              title: "Update Reset",
              description: "The update process was stuck and has been reset. You can try updating again.",
              variant: "destructive"
            });
            
            // Refresh stats to get the latest status
            await refreshStats();
          } catch (error) {
            console.error('Error resetting stuck update state:', error);
          }
        }
      }
    };
    
    resetStuckState();
  }, []);

  // Check update status on load
  useEffect(() => {
    const checkActiveUpdates = async () => {
      try {
        // Check if there are active updates in progress
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('is_laptop', true)
          .in('update_status', ['pending_update', 'in_progress']);
          
        if (error) {
          console.error('Error checking active updates:', error);
          return;
        }
        
        if (count && count > 0) {
          console.log(`Found ${count} laptops with active update status`);
          setIsUpdating(true);
          setUpdateCount(count);
          setUpdateStartTime(new Date());
          setUpdateSuccess(true);
          
          // Set up a stuck update detection timeout
          setupStuckUpdateDetection();
        }
      } catch (err) {
        console.error('Error in checkActiveUpdates:', err);
      }
    };
    
    checkActiveUpdates();
  }, []);

  // Setup detection for stuck updates
  const setupStuckUpdateDetection = () => {
    // Clear any existing timeout
    if (stuckTimeout) {
      clearTimeout(stuckTimeout);
    }
    
    // Set a new timeout - if updates are still running after 10 minutes, consider them stuck
    const timeout = setTimeout(async () => {
      console.log('Checking for stuck updates...');
      
      if (isUpdating) {
        try {
          // Check if there are actually still updates in progress
          const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_laptop', true)
            .in('update_status', ['pending_update', 'in_progress']);
            
          if (error) {
            console.error('Error checking for stuck updates:', error);
            return;
          }
          
          if (count === 0) {
            // No more updates in progress, but UI still shows updating
            console.log('UI shows updating but no updates in progress. Resetting state...');
            setIsUpdating(false);
            toast({
              title: "Update Completed",
              description: "The update process has completed.",
            });
          } else {
            // Still have updates in progress after timeout, offer reset option
            console.log(`${count} updates still in progress after timeout`);
            toast({
              title: "Updates Taking Too Long",
              description: "Updates are still in progress but taking longer than expected. You can refresh the page to reset.",
              variant: "warning",
              duration: 10000
            });
          }
        } catch (err) {
          console.error('Error checking for stuck updates:', err);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes
    
    setStuckTimeout(timeout);
  };

  // Effect to track elapsed time during updates
  useEffect(() => {
    if (isUpdating && updateStartTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - updateStartTime.getTime()) / 1000);
        setElapsedTime(seconds);
      }, 1000);
      
      setElapsedInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    } else {
      if (elapsedInterval) {
        clearInterval(elapsedInterval);
        setElapsedInterval(null);
      }
      
      if (!isUpdating) {
        setElapsedTime(0);
      }
    }
  }, [isUpdating, updateStartTime, elapsedInterval]);

  // Auto-refresh stats when updates are in progress
  useEffect(() => {
    if (isUpdating) {
      const interval = setInterval(async () => {
        console.log('Auto-refreshing stats while updates are in progress...');
        try {
          await refreshStats();
          console.log('Auto-refresh successful');
          
          // Also check if updates are still in progress
          const { count, error } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_laptop', true)
            .in('update_status', ['pending_update', 'in_progress']);
            
          if (error) {
            console.error('Error checking if updates are still in progress:', error);
            return;
          }
          
          // If no more updates in progress, set isUpdating to false
          if (count === 0) {
            console.log('No more laptops being updated, ending update session');
            setIsUpdating(false);
            
            // Clear the stuck update detection timeout
            if (stuckTimeout) {
              clearTimeout(stuckTimeout);
              setStuckTimeout(null);
            }
            
            toast({
              title: "Update Complete",
              description: "All laptop updates have completed.",
            });
          }
        } catch (err) {
          console.error('Auto-refresh error:', err);
        }
      }, 5000); // Refresh every 5 seconds during updates
      
      return () => clearInterval(interval);
    }
  }, [isUpdating, refreshStats]);

  // Main function to handle laptop updates
  async function handleUpdateLaptops() {
    if (isUpdating) {
      console.log("Update already in progress, skipping request");
      toast({
        title: "Update in Progress",
        description: "Please wait for the current update to complete. If it appears stuck, refresh the page and try again.",
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      setUpdateStartTime(new Date());
      setUpdateSuccess(false);
      
      console.log('Update Laptops button clicked');
      console.log('Starting laptop update process...');
      
      // Setup stuck update detection
      setupStuckUpdateDetection();
      
      // Initial stats refresh
      try {
        await refreshStats();
      } catch (err) {
        console.error('Error refreshing stats before update:', err);
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
        
        // If we're using auto-update, call the edge function to record the current time 
        if (autoUpdateEnabled) {
          try {
            await supabase.functions.invoke('toggle-scheduler', {
              body: { 
                enabled: true,
                updateLastScheduledTime: true
              }
            });
          } catch (err) {
            console.error('Error updating last scheduled time:', err);
          }
        }
      } else {
        // Update failed or didn't start
        setUpdateSuccess(false);
        setIsUpdating(false); // Reset updating state
        
        toast({
          title: "Update Status",
          description: result?.error || result?.message || "Failed to start laptop updates. Please check console for details.",
          variant: result?.success === false ? "destructive" : "default"
        });
        
        console.error('Update finished with result:', result);
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
      setIsUpdating(false); // Reset updating state
      
      toast({
        title: "Error",
        description: "Failed to start laptop updates: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
    }
  }

  // Get descriptive status text
  const getDescription = (elapsedTime: number, timeUntilNextUpdate: number) => {
    const formatElapsedTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    const formatTimeUntilNextUpdate = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    if (isUpdating && updateCount > 0) {
      return `Currently updating ${updateCount} laptops. Process has been running for ${formatElapsedTime(elapsedTime)}. Updates prioritize oldest check date, missing prices and images.`;
    }
    
    if (autoUpdateEnabled && !isUpdating) {
      if (schedulerStatus === 'checking') {
        return "Checking auto-update status...";
      }
      return `Auto-update enabled. Next update in ${formatTimeUntilNextUpdate(timeUntilNextUpdate)}. Updates prioritize oldest check date, missing prices and images.`;
    }
    
    return "Update prices and information for all laptops - prioritizes by oldest check date, missing prices and images";
  };

  // Function to force reset update state - could be called from a UI element
  const forceResetUpdateState = async () => {
    if (!isUpdating) return;
    
    console.log('Manually resetting update state...');
    try {
      // Reset any in-progress laptops
      await supabase
        .from('products')
        .update({ update_status: 'pending' })
        .in('update_status', ['pending_update', 'in_progress']);
      
      // Clear the updating state
      setIsUpdating(false);
      setUpdateStartTime(null);
      
      // Clear any timeouts
      if (stuckTimeout) {
        clearTimeout(stuckTimeout);
        setStuckTimeout(null);
      }
      
      toast({
        title: "Update Reset",
        description: "The update process has been manually reset. You can now update again.",
      });
      
      // Refresh stats to get the latest status
      await refreshStats();
    } catch (error) {
      console.error('Error forcing reset of update state:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset update state. Please try refreshing the page.",
        variant: "destructive"
      });
    }
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
    getDescription,
    forceResetUpdateState
  };
}
