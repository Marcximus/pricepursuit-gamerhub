
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
  
  // Check for explicit R5, R7 format without AMD prefix
  const explicitRPattern = /\br([3579])[-\s](\d{4}[a-z]*)\s+cpu\b/i;
  const explicitRMatch = normalizedTitle.match(explicitRPattern);
  if (explicitRMatch) {
    return `AMD Ryzen ${explicitRMatch[1]}-${explicitRMatch[2]}`;
  }
  
  // NEW: Check for plain Ryzen X XXXXXX format (like "Ryzen 3 7330U")
  const plainRyzenPattern = /\bryzen\s+(\d)\s+(\d{4}[a-z]*)\b/i;
  const plainRyzenMatch = normalizedTitle.match(plainRyzenPattern);
  if (plainRyzenMatch) {
    return `AMD Ryzen ${plainRyzenMatch[1]}-${plainRyzenMatch[2]}`;
  }
  
  // NEW: Check for AMD Ryzen X XXXXXX format (like "AMD Ryzen 7 5800HS")
  const fullRyzenPattern = /\bamd\s+ryzen\s+(\d)\s+(\d{4}[a-z]*)\b/i;
  const fullRyzenMatch = normalizedTitle.match(fullRyzenPattern);
  if (fullRyzenMatch) {
    return `AMD Ryzen ${fullRyzenMatch[1]}-${fullRyzenMatch[2]}`;
  }
  
  // NEW: Check for "Ryzen X" without model number but with core count
  const ryzenCorePattern = /\bryzen\s+(\d)(?:\s+|-)(\d+)[-\s]core\b/i;
  const ryzenCoreMatch = normalizedTitle.match(ryzenCorePattern);
  if (ryzenCoreMatch) {
    return `AMD Ryzen ${ryzenCoreMatch[1]} (${ryzenCoreMatch[2]}-core)`;
  }
  
  // NEW: Expanded pattern for AMD with core count
  const amdCorePattern = /\bamd\s+ryzen\s+(\d)(?:\s+|-)(\d+)[-\s]core\b/i;
  const amdCoreMatch = normalizedTitle.match(amdCorePattern);
  if (amdCoreMatch) {
    return `AMD Ryzen ${amdCoreMatch[1]} (${amdCoreMatch[2]}-core)`;
  }
  
  return null;
};
