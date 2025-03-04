
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
  
  return (
    <li>
      <span className="font-bold">Storage:</span>{" "}
      {displayStorage}
    </li>
  );
}
