
export const useUpdateDescription = () => {
  const getDescription = (isUpdating: boolean, elapsedTime: number, autoUpdateEnabled: boolean, timeUntilNextUpdate: number): string => {
    if (isUpdating) {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      return `Updating product data... (${timeString})`;
    }
    
    if (autoUpdateEnabled) {
      const minutes = Math.floor(timeUntilNextUpdate / 60);
      const seconds = timeUntilNextUpdate % 60;
      const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      return `Auto-update enabled. Next update in ${timeString}`;
    }
    
    return "Update laptop prices, images, and specifications";
  };

  return {
    getDescription
  };
};
