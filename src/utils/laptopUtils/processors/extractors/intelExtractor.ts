
import { intelCorePatterns, intelBudgetPatterns } from '../patterns/processorPatterns';

/**
 * Extracts and processes Intel processors
 */
export function extractIntelProcessor(text: string): string | null {
  if (!text) return null;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Core Ultra patterns
  const coreUltraMatch = normalizedText.match(intelCorePatterns.coreUltra);
  if (coreUltraMatch) {
    return `Intel Core Ultra ${coreUltraMatch[1]}`;
  }
  
  // Check for generation prefix (e.g. "12th Gen Intel Core i7")
  const genPrefixMatch = normalizedText.match(intelCorePatterns.genPrefix);
  if (genPrefixMatch) {
    return `${genPrefixMatch[1]} Gen Intel Core i${genPrefixMatch[2]}`;
  }
  
  // Check for core i-series with model
  const coreIMatch = normalizedText.match(intelCorePatterns.coreI);
  if (coreIMatch) {
    const model = coreIMatch[2] ? `-${coreIMatch[2]}` : '';
    return `Intel Core i${coreIMatch[1]}${model}`;
  }
  
  // Check for i-series shorthand
  const iSeriesMatch = normalizedText.match(intelCorePatterns.iSeries);
  if (iSeriesMatch) {
    const model = iSeriesMatch[2] ? `-${iSeriesMatch[2]}` : '';
    return `Intel Core i${iSeriesMatch[1]}${model}`;
  }
  
  // Check for Intel budget processors
  if (intelBudgetPatterns.celeronWithModel.test(normalizedText)) {
    const match = normalizedText.match(/\b(?:intel\s+)?celeron\s+([a-z0-9]+)\b/i);
    if (match) {
      return `Intel Celeron ${match[1]}`;
    }
  }
  
  if (intelBudgetPatterns.celeron.test(normalizedText)) {
    return 'Intel Celeron';
  }
  
  if (intelBudgetPatterns.pentiumGold.test(normalizedText)) {
    return 'Intel Pentium Gold';
  }
  
  if (intelBudgetPatterns.pentiumSilver.test(normalizedText)) {
    return 'Intel Pentium Silver';
  }
  
  if (intelBudgetPatterns.pentium.test(normalizedText)) {
    return 'Intel Pentium';
  }
  
  // Generic Intel mention
  if (normalizedText.includes('intel') && !normalizedText.includes('graphics')) {
    return 'Intel';
  }
  
  return null;
}
