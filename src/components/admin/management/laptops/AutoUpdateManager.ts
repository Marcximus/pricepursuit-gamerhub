
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AutoUpdateManagerProps {
  isUpdating: boolean;
  onUpdate: () => void;
}

export const useAutoUpdateManager = ({ isUpdating, onUpdate }: AutoUpdateManagerProps) => {
  // Auto-update state
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [lastScheduledTime, setLastScheduledTime] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(300); // 5 minutes in seconds
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  // Effect for managing the scheduled update status
  useEffect(() => {
    if (autoUpdateEnabled) {
      console.log('Auto-update enabled, checking for scheduled jobs');
      
      // Start countdown for display purposes
      const newCountdownInterval = setInterval(() => {
        setTimeUntilNextUpdate(prev => {
          if (prev <= 1) {
            // When countdown reaches zero, trigger a refresh to show latest data
            if (!isUpdating) {
              console.log('Countdown complete, refreshing data');
              onUpdate();
            }
            // Reset countdown to 5 minutes
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
      
      setCountdownInterval(newCountdownInterval);
      
      // Set last scheduled time
      setLastScheduledTime(new Date());
      
      toast({
        title: "Auto-Update Enabled",
        description: "Laptop updates are now scheduled to run automatically",
      });
      
      return () => {
        if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      };
    } else {
      // Clean up when disabled
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
      
      if (lastScheduledTime) {
        toast({
          title: "Auto-Update Disabled",
          description: "Automatic updates have been turned off",
        });
        
        setLastScheduledTime(null);
      }
    }
  }, [autoUpdateEnabled, isUpdating, onUpdate]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [countdownInterval]);

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
