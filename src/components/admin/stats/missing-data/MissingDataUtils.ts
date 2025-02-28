
/**
 * Calculate the average missing data percentage from multiple data points
 */
export const calculateAverageMissingPercentage = (
  processorPercentage: number,
  ramPercentage: number,
  storagePercentage: number,
  graphicsPercentage: number,
  screenSizePercentage: number
): number => {
  return (
    processorPercentage +
    ramPercentage +
    storagePercentage +
    graphicsPercentage +
    screenSizePercentage
  ) / 5;
};
