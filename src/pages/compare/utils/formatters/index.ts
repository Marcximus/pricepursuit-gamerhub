
export { formatProcessor } from './processorFormatter';
export { formatRAM } from './ramFormatter';
export { formatStorage } from './storageFormatter';
export { formatGraphics } from './graphicsFormatter';
export { extractRefreshRate } from './screenFormatter';
export { formatOS } from './osFormatter';
export { extractPorts } from './portsFormatter';
export { estimateReleaseYear } from './releaseYearEstimator';

// Helper to safely format values
export const formatValue = (value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  return String(value);
};
