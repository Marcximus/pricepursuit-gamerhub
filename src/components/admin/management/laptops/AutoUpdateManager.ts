
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { clearIntervalSafely, scheduleNextUpdateTime, calculateSecondsUntilNextUpdate } from './utils/updateTimer';

interface AutoUpdateManagerProps {
  isUpdating: boolean;
  onUpdate: () => void;
}

export const useAutoUpdateManager = ({ isUpdating, onUpdate }: AutoUpdateManagerProps) => {
  // Auto-update state
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [autoUpdateInterval, setAutoUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [nextUpdateTime, setNextUpdateTime] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(300); // 5 minutes in seconds

  // Update time until next auto-update
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (autoUpdateEnabled && nextUpdateTime && !isUpdating) {
      timer = setInterval(() => {
        const secondsUntilNext = calculateSecondsUntilNextUpdate(nextUpdateTime);
        setTimeUntilNextUpdate(secondsUntilNext);
        
        // If time is up, trigger update
        if (secondsUntilNext <= 0 && !isUpdating) {
          console.log('Auto-update timer reached zero, triggering update...');
          onUpdate();
        }
      }, 1000);
    }
    
    return () => {
      clearIntervalSafely(timer);
    };
  }, [autoUpdateEnabled, nextUpdateTime, isUpdating, onUpdate]);

  // Auto-update effect
  useEffect(() => {
    if (autoUpdateEnabled && !isUpdating) {
      // Set next update time
      const nextUpdate = scheduleNextUpdateTime();
      setNextUpdateTime(nextUpdate);
      
      console.log('Auto-update enabled, scheduling next update in 5 minutes');
      console.log('Next update scheduled for:', nextUpdate.toLocaleTimeString());
      
      const interval = setInterval(() => {
        if (!isUpdating) {
          console.log('Auto-update interval triggered');
          onUpdate();
          
          // Reset next update time after triggering
          const newNextUpdate = scheduleNextUpdateTime();
          setNextUpdateTime(newNextUpdate);
          console.log('Next update scheduled for:', newNextUpdate.toLocaleTimeString());
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
        clearIntervalSafely(interval);
      };
    } else if (!autoUpdateEnabled) {
      if (autoUpdateInterval) {
        clearIntervalSafely(autoUpdateInterval);
        setAutoUpdateInterval(null);
        setNextUpdateTime(null);
        console.log('Auto-update disabled');
        
        toast({
          title: "Auto-Update Disabled",
          description: "Automatic updates have been turned off",
        });
      }
    }
  }, [autoUpdateEnabled, isUpdating, onUpdate]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      clearIntervalSafely(autoUpdateInterval);
    };
  }, [autoUpdateInterval]);

  // Toggle auto-update function
  const toggleAutoUpdate = () => {
    console.log('Toggle auto-update called, current state:', autoUpdateEnabled);
    setAutoUpdateEnabled(prevState => !prevState);
  };

  return {
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate
  };
};
