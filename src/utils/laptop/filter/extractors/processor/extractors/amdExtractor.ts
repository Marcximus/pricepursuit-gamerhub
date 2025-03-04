
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
  
  return null;
};
