
import React, { useState, useContext, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw } from "lucide-react";
import ManagementCard from "./ManagementCard";
import { StatsRefreshContext } from "@/components/admin/LaptopStats";

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

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [autoRefreshInterval]);

  // Function to start auto-refreshing stats during updates
  const startAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats while updates are in progress...');
      if (statsRefresh) {
        statsRefresh()
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
      const maxUpdateTime = 10 * 60 * 1000; // 10 minutes
      const interval = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = currentTime.getTime() - updateStartTime.getTime();
        
        if (elapsedTime > maxUpdateTime) {
          console.log('Update process seems stuck. Resetting state...');
          stopAutoRefresh();
          setIsUpdating(false);
          setUpdateStartTime(null);
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
      
      console.log('Update Laptops button clicked');
      console.log('Starting laptop update process...');
      
      // Immediately refresh stats to get current state
      if (statsRefresh) {
        await statsRefresh();
      }
      
      const result = await updateLaptops();
      console.log('Update result:', result);
      
      if (result && result.success) {
        const countMatch = result.message.match(/Started updating (\d+) laptops/);
        const count = countMatch ? parseInt(countMatch[1]) : 0;
        setUpdateCount(count);
        
        toast({
          title: "Update Started",
          description: `${result.message || "Started updating laptop information."} The progress will be updated automatically.`,
        });

        // Start auto-refreshing stats
        startAutoRefresh();
        
        // After 5 minutes, stop the auto-refresh and do one final refresh
        setTimeout(() => {
          if (isUpdating) {
            console.log('Scheduled final refresh after timeout');
            stopAutoRefresh();
            
            if (statsRefresh) {
              statsRefresh()
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
        }, 5 * 60 * 1000); // 5 minutes
      } else {
        toast({
          title: "Update Status",
          description: result?.error || result?.message || "Failed to start laptop updates. Please check console for details.",
          variant: result?.success === false ? "destructive" : "default"
        });
        console.error('Update finished with result:', result);
        setIsUpdating(false);
      }
      
      // Refresh stats again after starting updates
      await refreshStats();
    } catch (error: any) {
      console.error('Error updating laptops:', error);
      toast({
        title: "Error",
        description: "Failed to start laptop updates: " + (error.message || "Unknown error"),
        variant: "destructive"
      });
      stopAutoRefresh();
      setIsUpdating(false);
    }
  };

  const getDescription = () => {
    if (isUpdating && updateCount > 0) {
      const elapsedTime = updateStartTime 
        ? Math.floor((new Date().getTime() - updateStartTime.getTime()) / 1000) 
        : 0;
      
      return `Currently updating ${updateCount} laptops. Process has been running for ${elapsedTime} seconds. Updates prioritize oldest check date, missing prices and images.`;
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
      variant="outline"
      disabled={isUpdating}
    />
  );
};

export default UpdateLaptopsSection;
