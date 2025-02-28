
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { clearIntervalSafely } from './utils/updateTimer';

interface AutoRefreshManagerProps {
  isUpdating: boolean;
  updateStartTime: Date | null;
  refreshStats: () => Promise<void>;
}

export const useAutoRefreshManager = ({ 
  isUpdating, 
  updateStartTime, 
  refreshStats 
}: AutoRefreshManagerProps) => {
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

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

  // Function to start auto-refreshing stats during updates
  const startAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
    
    console.log('Starting auto-refresh for stats during update process');
    
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing stats while updates are in progress...');
      refreshStats()
        .then(() => console.log('Auto-refresh successful'))
        .catch(err => console.error('Error during auto-refresh:', err));
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

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      clearIntervalSafely(autoRefreshInterval);
    };
  }, [autoRefreshInterval]);

  return {
    elapsedTime,
    startAutoRefresh,
    stopAutoRefresh
  };
};
