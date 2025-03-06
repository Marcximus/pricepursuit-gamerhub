
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
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  // Separate effect for countdown timer
  useEffect(() => {
    // Clear any existing countdown interval
    if (countdownInterval) {
      clearIntervalSafely(countdownInterval);
    }

    // Only start countdown if auto-update is enabled and we have a next update time
    if (autoUpdateEnabled && nextUpdateTime) {
      console.log('Starting countdown timer for auto-update');
      
      // Initial calculation
      const initialSeconds = calculateSecondsUntilNextUpdate(nextUpdateTime);
      setTimeUntilNextUpdate(initialSeconds);
      
      // Set up countdown interval (every second)
      const interval = setInterval(() => {
        const secondsUntilNext = calculateSecondsUntilNextUpdate(nextUpdateTime);
        console.log('Countdown update: seconds until next update:', secondsUntilNext);
        setTimeUntilNextUpdate(secondsUntilNext);
        
        // If time is up, trigger update
        if (secondsUntilNext <= 0 && !isUpdating) {
          console.log('Auto-update timer reached zero, triggering update...');
          onUpdate();
        }
      }, 1000);
      
      setCountdownInterval(interval);
      
      return () => {
        clearIntervalSafely(interval);
      };
    }
    
    return () => {};
  }, [autoUpdateEnabled, nextUpdateTime, isUpdating, onUpdate]);

  // Auto-update effect (separate from countdown)
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
        if (countdownInterval) {
          clearIntervalSafely(countdownInterval);
        }
      };
    } else if (!autoUpdateEnabled) {
      if (autoUpdateInterval) {
        clearIntervalSafely(autoUpdateInterval);
        setAutoUpdateInterval(null);
        setNextUpdateTime(null);
        console.log('Auto-update disabled');
        
        // Also clear countdown interval
        if (countdownInterval) {
          clearIntervalSafely(countdownInterval);
          setCountdownInterval(null);
        }
        
        toast({
          title: "Auto-Update Disabled",
          description: "Automatic updates have been turned off",
        });
      }
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoUpdateEnabled, isUpdating, onUpdate]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      clearIntervalSafely(autoUpdateInterval);
      clearIntervalSafely(countdownInterval);
    };
  }, [autoUpdateInterval, countdownInterval]);

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
