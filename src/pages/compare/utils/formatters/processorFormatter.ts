
import { normalizeProcessor } from "@/utils/laptop/normalizers/processorNormalizer";

// Enhanced processor formatting function
export const formatProcessor = (processor?: string, title?: string): string => {
  if (!processor || processor === 'Not Specified' || processor === 'N/A') {
    // Try to extract from title if processor is missing
    if (title) {
      const intelMatch = title.match(/Intel\s+Core\s+i[3579](?:\-\d{4,5})?|Intel\s+Core\s+Ultra\s+\d(?:\-\d{3})?/i);
      if (intelMatch) return normalizeProcessor(intelMatch[0]);
      
      const amdMatch = title.match(/AMD\s+Ryzen\s+[3579](?:\-\d{4})?/i);
      if (amdMatch) return normalizeProcessor(amdMatch[0]);
      
      const appleMatch = title.match(/Apple\s+M[123](?:\s+(?:Pro|Max|Ultra))?/i);
      if (appleMatch) return normalizeProcessor(appleMatch[0]);
    }
    return 'Not Specified';
  }
  
  // Handle generic processor entries
  if (processor === 'Intel' || processor === 'AMD' || processor === 'Apple') {
    if (title) {
      if (processor === 'Intel' && title.match(/i[3579]/i)) {
        const match = title.match(/Intel\s+Core\s+i[3579](?:\-\d{4,5})?|i[3579](?:\-\d{4,5})?/i);
        if (match) return normalizeProcessor(match[0]);
      } else if (processor === 'AMD' && title.match(/Ryzen/i)) {
        const match = title.match(/AMD\s+Ryzen\s+[3579](?:\-\d{4})?|Ryzen\s+[3579](?:\-\d{4})?/i);
        if (match) return normalizeProcessor(match[0]);
      } else if (processor === 'Apple' && title.match(/M[123]/i)) {
        const match = title.match(/Apple\s+M[123](?:\s+(?:Pro|Max|Ultra))?/i);
        if (match) return normalizeProcessor(match[0]);
      }
    }
  }
  
  // Use normalizeProcessor for consistent display
  return normalizeProcessor(processor);
};
