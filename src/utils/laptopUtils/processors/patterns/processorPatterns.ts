/**
 * Regular expression patterns for processor extraction
 */

// Apple M-series processor patterns
export const appleSiliconPatterns = {
  appleChip: /\b(?:Apple\s*)?M[123]\s*(?:Pro|Max|Ultra)?\s*(?:chip)?\b/i,
  macbookM: /\bmacbook.*m[123]\s*(?:pro|max|ultra)?\b/i,
  mSeries: /\bm([123])\s*(?:pro|max|ultra)?\b/i,
  mChip: /\bm[123]\s*chip\b/i
};

// AMD Ryzen processor patterns
export const amdRyzenPatterns = {
  fullRyzen: /\bamd\s+ryzen(?:™|\s+™)?\s+([3579])[- ](\d{4}[a-z]*(?:\s*hx)?)\b/i,
  plainRyzen: /\bryzen\s+(\d)\s+(\d{4}[a-z]*)\b/i,
  ryzenWithDash: /\bryzen[_\s-]*([3579])[_\s-](\d{4}[a-z]*)\b/i,
  amdR: /\b(?:amd\s+)?r([3579])[_\s-](\d{4}[a-z]*)\b/i,
  ryzenCore: /\bryzen\s+(\d)(?:\s+|-)(\d+)[-\s]core\b/i,
  amdRyzenCore: /\bamd\s+ryzen\s+(\d)(?:\s+|-)(\d+)[-\s]core\b/i
};

// Intel Core patterns
export const intelCorePatterns = {
  // Direct specific model format (e.g., "i7-1355U")
  specificIntelModel: /i([3579])-(\d{4}[a-z]?)/i,
  // Intel Generation format (e.g., "Intel 12th Gen i7")
  intelGenFormat: /\bintel\s+(\d+)(?:th|nd|rd)\s+gen\s+i([3579])\b/i,
  // Improved Intel Ultra pattern to match "Ultra 7-155H" format
  coreUltra: /\b(?:intel\s+)?(?:core\s+)?ultra\s+([579])(?:-|_|\s+)(\d{3}[a-z]*)\b/i,
  // Original Ultra pattern as fallback
  coreUltraSimple: /\b(?:intel\s+)?core\s+ultra\s+([579])\s*(?:[0-9]{3}[a-z]*)?/i,
  // Completely new pattern for Intel Core 7-150U style naming (without i)
  coreWithoutI: /\b(?:intel\s+)?core\s+([3579])(?:[- ](\d{3}[a-z]*))?/i,
  // Existing core i patterns
  coreI: /\b(?:intel\s+)?core\s+i([3579])(?:[- ](\d{4,5}[a-z]*))?/i,
  iSeries: /\bi([3579])(?:[- ](\d{4,5}[a-z]*))?/i,
  genPrefix: /\b(1[0-4]th)[\s-]gen(?:\s+(?:intel\s+)?core\s+)?i([3579])/i
};

// Intel budget processor patterns
export const intelBudgetPatterns = {
  celeron: /\b(?:intel\s+)?celeron\s+([a-z0-9]+)?\b/i,
  pentiumGold: /\b(?:intel\s+)?pentium\s+gold\b/i,
  pentiumSilver: /\b(?:intel\s+)?pentium\s+silver\b/i,
  pentium: /\b(?:intel\s+)?pentium\b/i
};

// Mobile processor patterns
export const mobileProcessorPatterns = {
  snapdragon: /\b(?:qualcomm\s+)?snapdragon\s+([a-z0-9]+)?\b/i,
  mediatek: /\bmediatek\s+(?:dimensity|helio)?\s*([a-z0-9]+)?\b/i
};

// Generic processor patterns
export const genericPatterns = {
  processorLabel: /\b(?:processor|cpu):\s*([^,;.]*)/i,
  octaCore: /\bocta[-\s]core\b/i,
  coreCount: /\b(\d{1,2})[-\s]core\b/i
};
