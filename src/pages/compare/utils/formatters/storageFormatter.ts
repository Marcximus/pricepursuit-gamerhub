
export const formatStorage = (storage?: string, title?: string): string => {
  if (!storage || storage === 'Not Specified' || storage === 'N/A') {
    // Try to extract from title if storage is missing
    if (title) {
      const ssdMatch = title.match(/(\d+)\s*(?:TB|GB)\s+(?:SSD|NVMe|PCIe)/i);
      if (ssdMatch) return ssdMatch[0];
    }
    return 'Not Specified';
  }
  
  // Handle incomplete storage entries
  if (storage === 'SSD' || storage === 'HDD' || storage === 'eMMC') {
    if (title) {
      const storageMatch = title.match(/(\d+)\s*(?:TB|GB)/i);
      if (storageMatch) return `${storageMatch[0]} ${storage}`;
    }
    return storage;
  }
  
  return storage;
};
