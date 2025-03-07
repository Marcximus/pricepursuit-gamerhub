
import { intelCorePatterns, intelBudgetPatterns } from '../patterns/processorPatterns';

/**
 * Extracts and processes Intel processors
 */
export function extractIntelProcessor(text: string): string | null {
  if (!text) return null;
  
  const normalizedText = text.toLowerCase();
  
  // Remove redundant Intel Core prefixes first
  const cleanedText = normalizedText.replace(/(intel\s+core\s+)+/gi, 'intel core ');
  
  // Check for specific model format like i7-1355U
  const specificModelMatch = cleanedText.match(intelCorePatterns.specificIntelModel);
  if (specificModelMatch) {
    return `Intel Core i${specificModelMatch[1]}-${specificModelMatch[2]}`;
  }
  
  // Check for "Intel Xth Gen iY" format (e.g., "Intel 12th Gen i7")
  const intelGenMatch = cleanedText.match(intelCorePatterns.intelGenFormat);
  if (intelGenMatch) {
    return `Intel Core i${intelGenMatch[2]} ${intelGenMatch[1]}th Gen`;
  }
  
  // Check for "Intel Core 7-150U" format (without "i")
  const coreWithoutIMatch = cleanedText.match(intelCorePatterns.coreWithoutI);
  if (coreWithoutIMatch) {
    const model = coreWithoutIMatch[2] ? `-${coreWithoutIMatch[2]}` : '';
    return `Intel Core i${coreWithoutIMatch[1]}${model}`;
  }
  
  // Enhanced check for Intel Ultra with model numbers
  const coreUltraMatch = cleanedText.match(intelCorePatterns.coreUltra);
  if (coreUltraMatch) {
    return `Intel Core Ultra ${coreUltraMatch[1]}-${coreUltraMatch[2]}`;
  }
  
  // Fallback to simpler Ultra pattern (without model numbers)
  const coreUltraSimpleMatch = cleanedText.match(intelCorePatterns.coreUltraSimple);
  if (coreUltraSimpleMatch) {
    return `Intel Core Ultra ${coreUltraSimpleMatch[1]}`;
  }
  
  // Check for generation prefix (e.g. "12th Gen Intel Core i7")
  const genPrefixMatch = cleanedText.match(intelCorePatterns.genPrefix);
  if (genPrefixMatch) {
    return `${genPrefixMatch[1]} Gen Intel Core i${genPrefixMatch[2]}`;
  }
  
  // Check for core i-series with model
  const coreIMatch = cleanedText.match(intelCorePatterns.coreI);
  if (coreIMatch) {
    const model = coreIMatch[2] ? `-${coreIMatch[2]}` : '';
    return `Intel Core i${coreIMatch[1]}${model}`;
  }
  
  // Check for i-series shorthand
  const iSeriesMatch = cleanedText.match(intelCorePatterns.iSeries);
  if (iSeriesMatch) {
    const model = iSeriesMatch[2] ? `-${iSeriesMatch[2]}` : '';
    return `Intel Core i${iSeriesMatch[1]}${model}`;
  }
  
  // Check for Intel budget processors
  if (intelBudgetPatterns.celeron.test(cleanedText)) {
    const match = cleanedText.match(/\b(?:intel\s+)?celeron\s+([a-z0-9]+)\b/i);
    if (match && match[1]) {
      return `Intel Celeron ${match[1]}`;
    }
    return 'Intel Celeron';
  }
  
  if (intelBudgetPatterns.pentiumGold.test(cleanedText)) {
    return 'Intel Pentium Gold';
  }
  
  if (intelBudgetPatterns.pentiumSilver.test(cleanedText)) {
    return 'Intel Pentium Silver';
  }
  
  if (intelBudgetPatterns.pentium.test(cleanedText)) {
    return 'Intel Pentium';
  }
  
  // Generic Intel mention
  if (cleanedText.includes('intel') && !cleanedText.includes('graphics')) {
    return 'Intel';
  }
  
  return null;
}
