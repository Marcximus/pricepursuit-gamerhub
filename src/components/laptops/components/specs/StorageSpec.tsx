
import { processStorage } from "@/utils/laptopUtils/processors/storageProcessor";

type StorageSpecProps = {
  title: string;
  storage?: string;
};

export function StorageSpec({ title, storage }: StorageSpecProps) {
  const extractedStorage = !storage ? processStorage(undefined, title) : null;
  const displayStorage = storage || extractedStorage || 'Not Specified';
  
  return (
    <li>
      <span className="font-bold">Storage:</span>{" "}
      {displayStorage}
    </li>
  );
}
