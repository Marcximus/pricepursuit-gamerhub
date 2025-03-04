/**
 * Regular expression patterns for processor extraction
 */

// Intel Core Ultra patterns
export const intelUltraPatterns = {
  coreUltra: /(?:intel\s+)?(?:\d+[-\s]core\s+)?(?:core\s+)?ultra\s+([579])(?:\s+\d{3}[a-z]*)?/i
};

// Intel Core i-series patterns
export const intelCorePatterns = {
  coreWithModel: /(?:intel\s+)?core\s+i([3579])(?:[- ](\d{4,5}[a-z]*))?/i,
  iSeriesWithModel: /\bi([3579])(?:[- ](\d{4,5}[a-z]*))?/i,
  coreI: /core_i([3579])/i,
  ghzWithCore: /(\d+(?:\.\d+)?)\s*ghz\s*(?:core_i|core\s+i|i)([3579])/i,
  coreWithGhz: /(?:core_i|core\s+i|i)([3579]).*?(\d+(?:\.\d+)?)\s*ghz/i,
  intelModelDash: /\bi([3579])-(\d{5}[a-z]*)/i
};

// Intel budget processor patterns
export const intelBudgetPatterns = {
  celeronWithModel: /(?:intel\s+)?celeron\s+(n\d{4})/i,
  ghzWithCeleron: /(\d+(?:\.\d+)?)\s*ghz\s*(?:intel\s+)?celeron/i,
  celeronWithGhz: /(?:intel\s+)?celeron\s+.*?(\d+(?:\.\d+)?)\s*ghz/i,
  pentiumWithModel: /(?:intel\s+)?pentium\s+([a-z0-9]+)/i,
  ghzWithPentium: /(\d+(?:\.\d+)?)\s*ghz\s*(?:intel\s+)?pentium/i,
  pentiumWithGhz: /(?:intel\s+)?pentium\s+.*?(\d+(?:\.\d+)?)\s*ghz/i
};

// Apple Silicon patterns - enhanced to catch more variants and formats
export const appleSiliconPatterns = {
  appleWithVariant: /apple\s+m([1234])(?:\s+(pro|max|ultra))?/i,
  mSeriesWithVariant: /\bm([1234])(?:\s+(pro|max|ultra))?\b/i,
  macbookWithM: /macbook.*m([1234])(?:\s+(pro|max|ultra))?/i,
  mWithCore: /m([1234])(?:\s+(pro|max|ultra))?\s+(?:with\s+)?(\d+)[\s-]core/i,
  mSeriesWithRam: /m([1234])(?:\s+(pro|max|ultra))?\s+(?:chip)?\s+(?:with\s+)?(\d+)\s*gb/i
};

// AMD Ryzen patterns
export const amdRyzenPatterns = {
  ryzenWithModel: /amd\s+ryzen\s+([3579])(?:[- _](\d{4}[a-z]*))?/i,
  ryzenWithoutAmd: /\bryzen\s+([3579])(?:[- _](\d{4}[a-z]*))?/i,
  ryzenUnderscore: /ryzen_([3579])_(\d{4}[a-z]*)/i
};

// Mobile processor patterns
export const mobileProcessorPatterns = {
  mediatek: /mediatek\s+([a-z0-9]+)/i,
  snapdragon: /(?:qualcomm\s+)?snapdragon\s+([a-z0-9]+)/i
};

// Generation identification patterns
export const generationPatterns = {
  gen13or14: /13th|14th|i[3579]-13|i[3579]-14/,
  gen11or12: /11th|12th|i[3579]-11|i[3579]-12/,
  gen10: /10th|i[3579]-10/
};
