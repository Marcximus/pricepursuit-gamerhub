
import React, { useState, useContext, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw, Clock } from "lucide-react";
import ManagementCard from "./ManagementCard";
import { StatsRefreshContext } from "@/components/admin/LaptopStats";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface UpdateLaptopsSectionProps {
  updateLaptops: () => Promise<any>;
  refreshStats: () => Promise<void>;
}

const UpdateLaptopsSection: React.FC<UpdateLaptopsSectionProps> = ({ 
  updateLaptops, 
  refreshStats 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateCount, setUpdateCount] = useState(0);
  const statsRefresh = useContext(StatsRefreshContext);
  const [updateStartTime, setUpdateStartTime] = useState<Date | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Auto-update state
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [nextUpdateTime, setNextUpdateTime] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(300); // 5 minutes in seconds
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
      if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
      }
    };
  }, [autoRefreshInterval, autoUpdateInterval]);

  // Update elapsed time counter
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isUpdating && updateStartTime) {
      timer = setInterval(() => {
        const currentTime = new Date();
        const secondsElapsed = Math.floor((currentTime.getTime() - updateStartTime.getTime()) / 1000);
        setElapsedTime(secondsElapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isUpdating, updateStartTime]);

  // Update time until next auto-update
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (autoUpdateEnabled && nextUpdateTime && !isUpdating) {
      timer = setInterval(() => {
        const currentTime = new Date();
        const secondsUntilNext = Math.max(0, Math.floor((nextUpdateTime.getTime() - currentTime.getTime()) / 1000));
        setTimeUntilNextUpdate(secondsUntilNext);
        
        // If time is up, trigger update
        if (secondsUntilNext === 0 && !isUpdating) {
          handleUpdateLaptops();
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoUpdateEnabled, nextUpdateTime, isUpdating]);

  // Auto-update effect
  useEffect(() => {
    if (autoUpdateEnabled && !isUpdating) {
      // Set next update time
      const nextUpdate = new Date();
      nextUpdate.setMinutes(nextUpdate.getMinutes() + 5);
      setNextUpdateTime(nextUpdate);
      
      console.log('Auto-update enabled, scheduling next update in 5 minutes');
      
      const interval = setInterval(() => {
        if (!isUpdating) {
          console.log('Auto-update triggered');
          handleUpdateLaptops();
          
          // Reset next update time after triggering
          const newNextUpdate = new Date();
          newNextUpdate.setMinutes(newNextUpdate.getMinutes() + 5);
          setNextUpdateTime(newNextUpdate);
        } else {
          console.log('Skipping auto-update: update already in progress');
        }
      }, 5 * 60 * 1000); // 5 minutes
      
      setAutoUpdateInterval(interval);
      
      toast({
        title: "Auto-Update Enabled",
        description: "Laptop prices will be automatically updated every 5 minutes",
      });
      
      return () => {
        clearInterval(interval);
        setAutoUpdateInterval(null);
      };
    } else if (!autoUpdateEnabled) {
      if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        setAutoUpdateInterval(null);
        setNextUpdateTime(null);
        console.log('Auto-update disabled');
        
        toast({
          title: "Auto-Update Disabled",
          description: "Automatic updates have been turned off",
        });
      }
    }
  }, [autoUpdateEnabled, isUpdating]);

  // Function to start auto-refreshing stats during updates
  const startAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    // Use statsRefresh from context instead of refreshStats prop
    const refreshFunction = statsRefresh || refreshStats;
    
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats while updates are in progress...');
      if (refreshFunction) {
        refreshFunction()
          .then(() => console.log('Auto-refresh successful'))
          .catch(err => console.error('Error during auto-refresh:', err));
      }
    }, 5000); // Refresh every 5 seconds during active updates
    
    setAutoRefreshInterval(intervalId);
    return intervalId;
  };

  // Function to stop auto-refreshing
  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      console.log('Stopping auto-refresh interval');
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  };

  // Check if updates seem stuck and reset if necessary
  useEffect(() => {
    if (isUpdating && updateStartTime) {
      const maxUpdateTime = 15 * 60 * 1000; // 15 minutes
      const interval = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = currentTime.getTime() - updateStartTime.getTime();
        
        if (elapsedTime > maxUpdateTime) {
          console.log('Update process seems stuck. Resetting state...');
          stopAutoRefresh();
          setIsUpdating(false);
          setUpdateStartTime(null);
          setUpdateSuccess(false);
          toast({
            title: "Update process timed out",
            description: "The update process took too long and was reset. You may try again.",
            variant: "destructive"
          });
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(interval);
    }
  }, [isUpdating, updateStartTime]);

  const handleUpdateLaptops = async () => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      setUpdateStartTime(new Date());
      setUpdateSuccess(false);
      
      console.log('Update Laptops button clicked');
      console.log('Starting laptop update process...');
      
      // Immediately refresh stats to get current state
      // Use statsRefresh from context instead of refreshStats prop
      const refreshFunction = statsRefresh || refreshStats;
      if (refreshFunction) {
        try {
          await refreshFunction();
        } catch (err) {
          console.error('Error refreshing stats before update:', err);
          // Continue with update process despite refresh error
        }
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
        
        // After 12 minutes, stop the auto-refresh and do one final refresh
        setTimeout(() => {
          if (isUpdating) {
            console.log('Scheduled final refresh after timeout');
            stopAutoRefresh();
            
            if (refreshFunction) {
              refreshFunction()
                .then(() => {
                  console.log('Final refresh completed');
                  setIsUpdating(false);
                })
                .catch(err => {
                  console.error('Error during final refresh:', err);
                  setIsUpdating(false);
                });
            } else {
              setIsUpdating(false);
            }
          }
        }, 12 * 60 * 1000); // 12 minutes
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
  };

  // Toggle auto-update function
  const toggleAutoUpdate = () => {
    setAutoUpdateEnabled(!autoUpdateEnabled);
  };

  // Format time display (mm:ss)
  const formatElapsedTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format time until next update (mm:ss)
  const formatTimeUntilNextUpdate = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getDescription = () => {
    if (isUpdating && updateCount > 0) {
      return `Currently updating ${updateCount} laptops. Process has been running for ${formatElapsedTime(elapsedTime)}. Updates prioritize oldest check date, missing prices and images.`;
    }
    
    if (autoUpdateEnabled && nextUpdateTime && !isUpdating) {
      return `Auto-update enabled. Next update in ${formatTimeUntilNextUpdate(timeUntilNextUpdate)}. Updates prioritize oldest check date, missing prices and images.`;
    }
    
    return "Update prices and information for all laptops - prioritizes by oldest check date, missing prices and images";
  };

  return (
    <ManagementCard
      title="Update Laptops"
      description={getDescription()}
      icon={RefreshCw}
      buttonText={isUpdating ? "Updating..." : "Update Prices"}
      onClick={handleUpdateLaptops}
      variant={updateSuccess ? "success" : "outline"}
      disabled={isUpdating}
      customActions={
        <div className="flex items-center gap-2">
          <Switch
            checked={autoUpdateEnabled}
            onCheckedChange={toggleAutoUpdate}
            disabled={isUpdating}
            id="auto-update-switch"
          />
          <label 
            htmlFor="auto-update-switch" 
            className="text-sm cursor-pointer flex items-center gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            Auto-update
          </label>
        </div>
      }
    />
  );
};

export default UpdateLaptopsSection;
