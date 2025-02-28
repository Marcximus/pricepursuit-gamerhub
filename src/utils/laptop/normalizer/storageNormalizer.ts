
import { getRamValue, getStorageValue } from '../valueParser';

/**
 * Normalizes RAM strings for consistent display
 */
export const normalizeRam = (ram: string): string => {
  if (!ram) return '';
  
  const gbValue = getRamValue(ram);
  if (gbValue === 0) return ram;
  
  // Format as integer if it's a whole number, otherwise show decimal
  const formattedGB = Number.isInteger(gbValue) ? gbValue.toString() : gbValue.toFixed(1);
  return `${formattedGB} GB`;
};

/**
 * Normalizes storage strings for consistent display
 */
export const normalizeStorage = (storage: string): string => {
  if (!storage) return '';
  
  // Get storage value in GB
  const gbValue = getStorageValue(storage);
  
  // Filter out invalid or unrealistic storage values (less than 32GB)
  if (gbValue < 32) {
    return '';
  }
  
  // Convert to TB if ≥ 1000 GB
  if (gbValue >= 1000) {
    const tbValue = gbValue / 1024;
    return `${tbValue.toFixed(tbValue % 1 === 0 ? 0 : 1)} TB`;
  }
  
  return `${Math.round(gbValue)} GB`;
};
