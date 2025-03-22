
import { useEffect, useState } from 'react';
import { toast } from "@/components/ui/use-toast";
import { AUTO_UPDATE_CONFIG } from "@/utils/laptop/config";
import { useCountdownTimer } from "./hooks/useCountdownTimer";
import { 
  fetchSchedulerStatus, 
  toggleSchedulerState, 
  type SchedulerResponse 
} from "./utils/schedulerService";

interface AutoUpdateManagerProps {
  isUpdating: boolean;
  onUpdate: () => void;
}

export const useAutoUpdateManager = ({ isUpdating, onUpdate }: AutoUpdateManagerProps) => {
  // Auto-update state
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(false);
  const [lastScheduledTime, setLastScheduledTime] = useState<Date | null>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  // Initialize the countdown timer
  const { secondsRemaining, resetTimer } = useCountdownTimer({
    enabled: autoUpdateEnabled && !isUpdating,
    onComplete: () => {
      if (!isUpdating) {
        onUpdate();
      }
    },
    initialSeconds: AUTO_UPDATE_CONFIG.INTERVAL_SECONDS
  });

  // Initial check for existing schedule
  useEffect(() => {
    const initializeSchedulerStatus = async () => {
      const response = await fetchSchedulerStatus();
      
      if (response) {
        // Update state based on response
        setAutoUpdateEnabled(response.enabled);
        setSchedulerStatus(response.enabled ? 'active' : 'inactive');
        
        if (response.enabled && response.lastScheduled) {
          const lastRun = new Date(response.lastScheduled);
          setLastScheduledTime(lastRun);
          
          // Calculate time until next update
          const nextUpdateTime = new Date(lastRun.getTime() + AUTO_UPDATE_CONFIG.INTERVAL_MINUTES * 60 * 1000);
          const now = new Date();
          const secondsUntilNext = Math.max(0, Math.floor((nextUpdateTime.getTime() - now.getTime()) / 1000));
          
          if (secondsUntilNext > 0 && secondsUntilNext < AUTO_UPDATE_CONFIG.INTERVAL_SECONDS) {
            resetTimer(secondsUntilNext);
          }
        }
      } else {
        setSchedulerStatus('inactive');
      }
    };
    
    initializeSchedulerStatus();
  }, []);

  // Toggle auto-update function
  const toggleAutoUpdate = async () => {
    const newState = !autoUpdateEnabled;
    
    // Set UI state optimistically
    setAutoUpdateEnabled(newState);
    
    // Call server to toggle state
    const success = await toggleSchedulerState(newState);
    
    if (success) {
      // Update last scheduled time if enabling
      if (newState) {
        const now = new Date();
        setLastScheduledTime(now);
        resetTimer(AUTO_UPDATE_CONFIG.INTERVAL_SECONDS);
        
        // Trigger an immediate update if enabled and not already updating
        if (!isUpdating) {
          console.log('Auto-update enabled, triggering immediate update');
          onUpdate();
        }
      }
    } else {
      // Revert state on error
      setAutoUpdateEnabled(!newState);
    }
  };

  return {
    autoUpdateEnabled,
    timeUntilNextUpdate: secondsRemaining,
    toggleAutoUpdate,
    schedulerStatus
  };
};
