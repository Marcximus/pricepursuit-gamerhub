
import { amdRyzenPatterns } from '../processorPatterns';

/**
 * Extracts AMD Ryzen processors from a laptop title
 */
export const extractAmdProcessor = (normalizedTitle: string): string | null => {
  // Try to extract AMD Ryzen with model numbers
  const ryzenMatch = normalizedTitle.match(amdRyzenPatterns.ryzenWithModel);
  if (ryzenMatch) {
    const model = ryzenMatch[2] ? `-${ryzenMatch[2]}` : '';
    return `AMD Ryzen ${ryzenMatch[1]}${model}`;
  }
  
  // Try to extract Ryzen without AMD prefix
  const ryzenWithoutAmdMatch = normalizedTitle.match(amdRyzenPatterns.ryzenWithoutAmd);
  if (ryzenWithoutAmdMatch) {
    const model = ryzenWithoutAmdMatch[2] ? `-${ryzenWithoutAmdMatch[2]}` : '';
    return `AMD Ryzen ${ryzenWithoutAmdMatch[1]}${model}`;
  }
  
  // Try to extract Ryzen with underscore format (ryzen_5_3500u)
  const ryzenUnderscoreMatch = normalizedTitle.match(amdRyzenPatterns.ryzenUnderscore);
  if (ryzenUnderscoreMatch) {
    return `AMD Ryzen ${ryzenUnderscoreMatch[1]}-${ryzenUnderscoreMatch[2]}`;
  }
  
  // Enhanced: Check for AMD R5, R7 patterns (like AMD R5-3500U)
  const amdRPattern = /\b(?:amd\s+)?r([3579])[-\s](\d{4}[a-z]*)\b/i;
  const amdRMatch = normalizedTitle.match(amdRPattern);
  if (amdRMatch) {
    return `AMD Ryzen ${amdRMatch[1]}-${amdRMatch[2]}`;
  }
  
  // Check for AMD with trademark symbols
  const amdTrademarkPattern = /\bamd\s+ryzen(?:™|\s+™)?\s+(\d)(?:\s+|-)(\d{4}[a-z]*)\b/i;
  const amdTrademarkMatch = normalizedTitle.match(amdTrademarkPattern);
  if (amdTrademarkMatch) {
    return `AMD Ryzen ${amdTrademarkMatch[1]}-${amdTrademarkMatch[2]}`;
  }
  
  return null;
};
