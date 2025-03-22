
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { COLLECTION_CONFIG } from "@/utils/laptop/config";

interface AutoUpdateManagerProps {
  isUpdating: boolean;
  onUpdate: () => void;
}

export const useAutoUpdateManager = ({ isUpdating, onUpdate }: AutoUpdateManagerProps) => {
  // Auto-update state - initialize to null/undefined until we get server status
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState<boolean>(false);
  const [lastScheduledTime, setLastScheduledTime] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial check for existing schedule
  useEffect(() => {
    const checkSchedulerStatus = async () => {
      try {
        console.log('Checking scheduler status...');
        setSchedulerStatus('checking');
        
        // Call the edge function to check the current status
        const { data, error } = await supabase.functions.invoke('toggle-scheduler', {
          method: 'GET'
        });
          
        if (error) {
          console.error('Error checking scheduler status:', error);
          setSchedulerStatus('inactive');
          setAutoUpdateEnabled(false);
          toast({
            title: "Error",
            description: "Failed to check auto-update status",
            variant: "destructive"
          });
          setIsInitialized(true);
          return;
        }
        
        // Update state based on response - explicitly check for true
        const isEnabled = data?.enabled === true;
        console.log('Server reports auto-update status:', isEnabled);
        setAutoUpdateEnabled(isEnabled);
        setSchedulerStatus(isEnabled ? 'active' : 'inactive');
        
        if (data?.lastScheduled) {
          const lastRun = new Date(data.lastScheduled);
          setLastScheduledTime(lastRun);
          
          // Calculate time until next update based on config
          const nextUpdateTime = new Date(
            lastRun.getTime() + COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60 * 1000
          );
          const now = new Date();
          const secondsUntilNext = Math.max(0, Math.floor((nextUpdateTime.getTime() - now.getTime()) / 1000));
          
          // If time has passed, use the default interval
          setTimeUntilNextUpdate(
            secondsUntilNext > 0 ? 
            secondsUntilNext : 
            COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60
          );
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error in checkSchedulerStatus:', err);
        setSchedulerStatus('inactive');
        setAutoUpdateEnabled(false);
        setIsInitialized(true);
      }
    };
    
    checkSchedulerStatus();
  }, []);

  // Effect for managing the countdown timer based on autoUpdateEnabled state
  useEffect(() => {
    // Skip if not initialized yet
    if (!isInitialized) {
      return;
    }
    
    console.log('Auto-update state changed to:', autoUpdateEnabled);
    
    // Always clean up existing interval when this effect runs
    if (countdownInterval) {
      console.log('Clearing existing countdown interval');
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }

    if (autoUpdateEnabled) {
      console.log('Auto-update is enabled, starting UI countdown from', timeUntilNextUpdate, 'seconds');
      
      // Start new countdown interval
      const newCountdownInterval = setInterval(() => {
        setTimeUntilNextUpdate(prev => {
          if (prev <= 1) {
            // When countdown reaches zero, reset to configured interval
            console.log('UI countdown complete, resetting to', COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60, 'seconds');
            
            // Optionally trigger update when countdown completes
            if (!isUpdating) {
              onUpdate();
            }
            
            return COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60;
          }
          return prev - 1;
        });
      }, 1000);
      
      setCountdownInterval(newCountdownInterval);
      
      // Return cleanup function
      return () => {
        console.log('Cleaning up countdown interval on unmount/disable');
        clearInterval(newCountdownInterval);
      };
    } else {
      console.log('Auto-update is disabled, no countdown needed');
      // Reset the countdown to default when disabled
      setTimeUntilNextUpdate(COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60);
    }
  }, [autoUpdateEnabled, isUpdating, onUpdate, timeUntilNextUpdate, isInitialized]);

  // Toggle auto-update function - communicates with the server
  const toggleAutoUpdate = async () => {
    try {
      console.log('Toggle auto-update called, current state:', autoUpdateEnabled);
      
      // Set scheduler status to checking during toggle
      setSchedulerStatus('checking');
      
      const newState = !autoUpdateEnabled;
      console.log('Attempting to set auto-update to:', newState);
      
      // Call edge function to enable/disable the server-side scheduler
      const { data, error } = await supabase.functions.invoke('toggle-scheduler', {
        body: { 
          enabled: newState,
          updateLastScheduledTime: true // Always update the timestamp when toggling
        }
      });
      
      if (error) {
        console.error('Error toggling scheduler:', error);
        toast({
          title: "Error",
          description: `Failed to ${newState ? 'enable' : 'disable'} auto-update: ${error.message}`,
          variant: "destructive"
        });
        
        // On error, revert back to checking server state
        const statusCheck = await supabase.functions.invoke('toggle-scheduler', {
          method: 'GET'
        });
        
        if (!statusCheck.error) {
          setAutoUpdateEnabled(statusCheck.data?.enabled === true);
          setSchedulerStatus(statusCheck.data?.enabled === true ? 'active' : 'inactive');
        } else {
          setSchedulerStatus('inactive');
        }
        
        return;
      }
      
      console.log('Server responded successfully:', data);
      
      // Only update state after successful server response
      setAutoUpdateEnabled(newState);
      setLastScheduledTime(newState ? new Date() : null);
      setSchedulerStatus(newState ? 'active' : 'inactive');
      
      // Reset countdown timer to full interval when enabling
      if (newState) {
        setTimeUntilNextUpdate(COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES * 60);
      }
      
      toast({
        title: newState ? "Auto-Update Enabled" : "Auto-Update Disabled",
        description: newState 
          ? `Laptop updates will run automatically every ${COLLECTION_CONFIG.AUTO_UPDATE_INTERVAL_MINUTES} minutes` 
          : "Automatic updates have been turned off",
      });
      
      // If enabling, trigger an immediate update
      if (newState && !isUpdating) {
        console.log('Auto-update enabled, triggering immediate update');
        onUpdate();
      }
    } catch (err) {
      console.error('Error in toggleAutoUpdate:', err);
      setSchedulerStatus('inactive');
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
