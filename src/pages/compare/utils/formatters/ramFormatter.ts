
import { normalizeRam } from "@/utils/laptop/normalizers/ramNormalizer";

export const formatRAM = (ram?: string, title?: string): string => {
  if (!ram || ram === 'Not Specified' || ram === 'N/A') {
    // Try to extract from title if RAM is missing
    if (title) {
      const ramMatch = title.match(/(\d+)\s*GB\s+(?:DDR\d+\s+)?RAM/i);
      if (ramMatch) return `${ramMatch[1]}GB`;
    }
    return 'Not Specified';
  }
  
  // Handle incomplete RAM entries
  if (ram === 'DDR4' || ram === 'DDR5' || ram === 'LPDDR5') {
    if (title) {
      const ramSizeMatch = title.match(/(\d+)\s*GB/i);
      if (ramSizeMatch) return `${ramSizeMatch[1]}GB ${ram}`;
    }
    return ram;
  }
  
  // Try to parse RAM size from string
  const ramSizeMatch = ram.match(/(\d+)\s*GB/i);
  if (ramSizeMatch) {
    // If there's already a size but no type, try to extract type from title
    if (!ram.match(/DDR\d+|LPDDR\d+/i) && title && title.match(/DDR\d+|LPDDR\d+/i)) {
      const ramTypeMatch = title.match(/(DDR\d+|LPDDR\d+)/i);
      if (ramTypeMatch) return `${ramSizeMatch[1]}GB ${ramTypeMatch[1]}`;
    }
  }
  
  return normalizeRam(ram);
};
