
/**
 * Format time display (mm:ss)
 */
export const formatElapsedTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format time until next update (mm:ss)
 */
export const formatTimeUntilNextUpdate = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Clear interval safely
 */
export const clearIntervalSafely = (intervalRef: NodeJS.Timeout | null): void => {
  if (intervalRef) {
    clearInterval(intervalRef);
  }
};

/**
 * Schedule next update time (5 minutes from now)
 */
export const scheduleNextUpdateTime = (): Date => {
  const nextUpdate = new Date();
  nextUpdate.setMinutes(nextUpdate.getMinutes() + 5);
  return nextUpdate;
};

/**
 * Calculate seconds until next update
 */
export const calculateSecondsUntilNextUpdate = (nextUpdateTime: Date): number => {
  const currentTime = new Date();
  return Math.max(0, Math.floor((nextUpdateTime.getTime() - currentTime.getTime()) / 1000));
};
