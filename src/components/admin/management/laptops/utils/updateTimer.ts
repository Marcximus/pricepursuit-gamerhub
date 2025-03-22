
/**
 * Clear interval safely
 * 
 * @deprecated Use clearIntervalSafely from updateTimerUtils.ts instead
 */
export const clearIntervalSafely = (intervalRef: NodeJS.Timeout | null): void => {
  if (intervalRef) {
    clearInterval(intervalRef);
  }
};
