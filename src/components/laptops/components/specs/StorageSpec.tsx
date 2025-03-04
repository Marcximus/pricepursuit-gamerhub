
import { processStorage } from "@/utils/laptopUtils/processors/storageProcessor";

type StorageSpecProps = {
  title: string;
  storage?: string;
};

export function StorageSpec({ title, storage }: StorageSpecProps) {
  // If storage is not provided, try to extract it from the title
  const extractedStorage = !storage ? processStorage(undefined, title) : null;
  
  // Use provided storage or extracted storage, with a fallback
  const displayStorage = storage || extractedStorage || 'Not Specified';
  
  // Quick validation for commonly incorrect storage values (like 16GB listed as storage when it's likely RAM)
  const isLikelyRAM = displayStorage.match(/^(4|8|16|32|64)\s*GB$/i) && !displayStorage.toLowerCase().includes('ssd');
  
  // Display a warning for values that look like RAM being mistakenly used as storage
  const finalDisplayStorage = isLikelyRAM 
    ? `${displayStorage} (Likely RAM)`
    : displayStorage;
  
  return (
    <li>
      <span className="font-bold">Storage:</span>{" "}
      {finalDisplayStorage}
    </li>
  );
}
