
import { useState, useEffect, useRef } from 'react';
import { AUTO_UPDATE_CONFIG } from "@/utils/laptop/config";

interface CountdownTimerProps {
  enabled: boolean;
  onComplete?: () => void;
  initialSeconds?: number;
}

export const useCountdownTimer = ({ 
  enabled, 
  onComplete,
  initialSeconds = AUTO_UPDATE_CONFIG.INTERVAL_SECONDS
}: CountdownTimerProps) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start or stop timer based on enabled state
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (enabled) {
      // Start the countdown
      intervalRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // When countdown reaches zero
            console.log('Countdown complete, resetting timer');
            
            // Call the onComplete callback if provided
            if (onComplete) {
              onComplete();
            }
            
            // Reset to initial time
            return initialSeconds;
          }
          return prev - 1;
        });
      }, AUTO_UPDATE_CONFIG.CHECK_DELAY_MS);
      
      console.log(`Countdown timer started with ${secondsRemaining} seconds`);
    }
    
    // Cleanup on unmount or when disabled
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, initialSeconds, onComplete]);
  
  // Reset timer function
  const resetTimer = (newTime?: number) => {
    setSecondsRemaining(newTime !== undefined ? newTime : initialSeconds);
  };

  return {
    secondsRemaining,
    resetTimer
  };
};
