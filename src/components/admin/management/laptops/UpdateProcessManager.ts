
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
        }
      } catch (err) {
        console.error('Error in checkActiveUpdates:', err);
      }
    };
    
    checkActiveUpdates();
  }, []);

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
        description: "Please wait for the current update to complete",
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      setUpdateStartTime(new Date());
      setUpdateSuccess(false);
      
      console.log('Update Laptops button clicked');
      console.log('Starting laptop update process...');
      
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
        
        // After 15 minutes, stop the update and do final refresh
        const finishTimeout = setTimeout(() => {
          if (isUpdating) {
            console.log('Scheduled final refresh after timeout');
            
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
        }, 15 * 60 * 1000); // 15 minutes
        
        // Cleanup timeout
        return () => clearTimeout(finishTimeout);
      } else {
        setUpdateSuccess(false);
        toast({
          title: "Update Status",
          description: result?.error || result?.message || "Failed to start laptop updates. Please check console for details.",
          variant: result?.success === false ? "destructive" : "default"
        });
        console.error('Update finished with result:', result);
        setIsUpdating(false);
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
      setIsUpdating(false);
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
