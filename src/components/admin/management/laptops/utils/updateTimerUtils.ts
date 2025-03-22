
import { toast } from "@/components/ui/use-toast";

/**
 * Format time display (mm:ss)
 */
export const formatElapsedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Creates timeout that shows a warning toast after a specified delay
 */
export const createLongUpdateWarningTimeout = (
  setShowLongUpdateMessage: (show: boolean) => void, 
  delay: number = 2 * 60 * 1000
): NodeJS.Timeout => {
  return setTimeout(() => {
    console.log('Update taking longer than expected (2 minutes). Showing warning...');
    setShowLongUpdateMessage(true);
    
    toast({
      title: "Updates Taking Longer Than Expected",
      description: "Updates are still in progress but taking longer than expected. You can refresh the page to reset.",
      variant: "destructive",
      duration: 10000
    });
  }, delay);
};

/**
 * Creates timeout that automatically resets update after a specified delay
 */
export const createMaxUpdateTimeout = (
  forceResetUpdateState: () => void,
  delay: number = 15 * 60 * 1000
): NodeJS.Timeout => {
  return setTimeout(() => {
    console.log('Update timed out after 15 minutes. Auto-resetting...');
    forceResetUpdateState();
    
    toast({
      title: "Update Process Timed Out",
      description: "The update process took too long and was automatically reset.",
      variant: "destructive",
      duration: 10000
    });
  }, delay);
};

/**
 * Clear interval/timeout safely
 */
export const clearIntervalSafely = (intervalRef: NodeJS.Timeout | null): void => {
  if (intervalRef) {
    clearInterval(intervalRef);
  }
};

/**
 * Clear timeout safely
 */
export const clearTimeoutSafely = (timeoutRef: NodeJS.Timeout | null): void => {
  if (timeoutRef) {
    clearTimeout(timeoutRef);
  }
};
