
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
  const [schedulerStatus, setSchedulerStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  // Initial check for existing schedule
  useEffect(() => {
    const checkSchedulerStatus = async () => {
      try {
        // Check if the scheduler is already enabled in the database
        const { data, error } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'auto_update_enabled')
          .single();
          
        if (error) {
          console.error('Error checking scheduler status:', error);
          return;
        }
        
        const isEnabled = data?.value === 'true';
        setAutoUpdateEnabled(isEnabled);
        setSchedulerStatus(isEnabled ? 'active' : 'inactive');
        
        if (isEnabled) {
          // Get the next scheduled run time
          const { data: scheduleData, error: scheduleError } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'last_scheduled_update')
            .single();
            
          if (!scheduleError && scheduleData) {
            const lastRun = new Date(scheduleData.value);
            setLastScheduledTime(lastRun);
            
            // Calculate time until next update (5 minutes after last run)
            const nextUpdateTime = new Date(lastRun.getTime() + 5 * 60 * 1000);
            const now = new Date();
            const secondsUntilNext = Math.max(0, Math.floor((nextUpdateTime.getTime() - now.getTime()) / 1000));
            setTimeUntilNextUpdate(secondsUntilNext > 0 ? secondsUntilNext : 300);
          }
        }
      } catch (err) {
        console.error('Error in checkSchedulerStatus:', err);
      }
    };
    
    checkSchedulerStatus();
  }, []);

  // Effect for managing the scheduled update status and UI countdown
  useEffect(() => {
    if (autoUpdateEnabled) {
      console.log('Auto-update enabled, UI countdown started');
      
      // Start countdown for display purposes only
      const newCountdownInterval = setInterval(() => {
        setTimeUntilNextUpdate(prev => {
          if (prev <= 1) {
            // When countdown reaches zero, reset to 5 minutes
            // The actual update is handled by the server-side scheduler
            console.log('UI countdown complete, resetting to 5 minutes');
            
            // Optionally, we can refresh stats to show latest progress
            if (!isUpdating) {
              onUpdate();
            }
            
            return 300;
          }
          return prev - 1;
        });
      }, 1000);
      
      setCountdownInterval(newCountdownInterval);
      
      // Set last scheduled time if not set
      if (!lastScheduledTime) {
        setLastScheduledTime(new Date());
      }
      
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
    }
  }, [autoUpdateEnabled, isUpdating, onUpdate, lastScheduledTime]);

  // Toggle auto-update function - now communicates with the server
  const toggleAutoUpdate = async () => {
    try {
      console.log('Toggle auto-update called, current state:', autoUpdateEnabled);
      
      const newState = !autoUpdateEnabled;
      setAutoUpdateEnabled(newState);
      
      // Call edge function to enable/disable the server-side scheduler
      const { error } = await supabase.functions.invoke('toggle-scheduler', {
        body: { enabled: newState }
      });
      
      if (error) {
        console.error('Error toggling scheduler:', error);
        toast({
          title: "Error",
          description: `Failed to ${newState ? 'enable' : 'disable'} auto-update: ${error.message}`,
          variant: "destructive"
        });
        
        // Revert state on error
        setAutoUpdateEnabled(!newState);
        return;
      }
      
      setLastScheduledTime(newState ? new Date() : null);
      
      toast({
        title: newState ? "Auto-Update Enabled" : "Auto-Update Disabled",
        description: newState 
          ? "Laptop updates are now scheduled to run automatically every 5 minutes" 
          : "Automatic updates have been turned off",
      });
      
      // If enabling, trigger an immediate update
      if (newState && !isUpdating) {
        console.log('Auto-update enabled, triggering immediate update');
        onUpdate();
      }
    } catch (err) {
      console.error('Error in toggleAutoUpdate:', err);
      toast({
        title: "Error",
        description: "Failed to toggle auto-update mode",
        variant: "destructive"
      });
    }
  };

  return {
    autoUpdateEnabled,
    timeUntilNextUpdate,
    toggleAutoUpdate,
    schedulerStatus
  };
};
