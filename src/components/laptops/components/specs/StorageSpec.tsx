
import { processStorage } from "@/utils/laptopUtils/processors/storageProcessor";
import { isRealisticStorageValue } from "@/utils/laptopUtils/processors/storageProcessor";

type StorageSpecProps = {
  title: string;
  storage?: string;
};

export function StorageSpec({ title, storage }: StorageSpecProps) {
  // If storage is not provided, try to extract it from the title
  const extractedStorage = !storage ? processStorage(undefined, title) : null;
  
  // Use provided storage or extracted storage, with a fallback
  const displayStorage = storage || extractedStorage || 'Not Specified';
  
  // Enhanced validation for storage values
  const isLikelyRAM = (value: string): boolean => {
    // Common RAM sizes that might be confused with storage
    const commonRamSizes = [4, 8, 12, 16, 24, 32, 64];
    
    // Check if it's a standalone GB value matching common RAM sizes
    const gbMatch = value.match(/^(\d+)\s*GB$/i);
    if (gbMatch) {
      const size = parseInt(gbMatch[1], 10);
      return commonRamSizes.includes(size) && !value.toLowerCase().includes('ssd');
    }
    
    // Check for DDR mentions which definitely indicate RAM not storage
    return /\bDDR\d*\b/i.test(value);
  };
  
  // Check if the value is unrealistically large for a laptop storage
  const isUnrealisticStorage = (value: string): boolean => {
    if (value === 'Not Specified') return false;
    
    // Check for common TB typos that should be GB
    if (/\b(128|256|512)\s*TB\b/i.test(value)) {
      return true;
    }
    
    // Use the existing validation function if available
    if (typeof isRealisticStorageValue === 'function') {
      return !isRealisticStorageValue(value);
    }
    
    return false;
  };
  
  // Apply the enhanced validation
  let finalDisplayStorage = displayStorage;
  let warningMessage = null;
  
  if (isLikelyRAM(displayStorage)) {
    warningMessage = "(Likely RAM)";
  } else if (isUnrealisticStorage(displayStorage)) {
    // For unrealistic storage values, attempt to correct common mistakes
    if (/\b(128|256|512)\s*TB\b/i.test(displayStorage)) {
      // Replace TB with GB for these common values
      finalDisplayStorage = displayStorage.replace(/(\b(?:128|256|512))\s*TB\b/i, '$1 GB');
      warningMessage = "(Corrected from TB → GB)";
    } else {
      warningMessage = "(Unusual storage size)";
    }
  }
  
  return (
    <li>
      <span className="font-bold">Storage:</span>{" "}
      {finalDisplayStorage}
      {warningMessage && (
        <span className="text-yellow-600 text-xs ml-1">{warningMessage}</span>
      )}
    </li>
  );
}
