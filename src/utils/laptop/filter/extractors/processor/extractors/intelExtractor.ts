
import {
  intelUltraPatterns,
  intelCorePatterns,
  intelBudgetPatterns,
  generationPatterns
} from '../processorPatterns';

/**
 * Extracts Intel Ultra processors from a laptop title
 */
export const extractIntelUltraProcessor = (normalizedTitle: string): string | null => {
  const ultraMatch = normalizedTitle.match(intelUltraPatterns.coreUltra);
  if (ultraMatch) {
    return `Intel Core Ultra ${ultraMatch[1]}`;
  }
  return null;
};

/**
 * Extracts Intel Core i-series processors from a laptop title
 */
export const extractIntelCoreProcessor = (normalizedTitle: string): string | null => {
  // Check for Intel i5-13420H style notation (priority)
  const intelModelDashMatch = normalizedTitle.match(intelCorePatterns.intelModelDash);
  if (intelModelDashMatch) {
    // This will match patterns like "i5-13420H"
    return `Intel Core i${intelModelDashMatch[1]}-${intelModelDashMatch[2]}`;
  }
  
  // Try to extract Intel Core i-series processors with model numbers
  const intelCoreMatch = normalizedTitle.match(intelCorePatterns.coreWithModel);
  if (intelCoreMatch) {
    const model = intelCoreMatch[2] ? `-${intelCoreMatch[2]}` : '';
    return `Intel Core i${intelCoreMatch[1]}${model}`;
  }
  
  // Try to extract just i-series mentions (i5, i7, etc.)
  const iSeriesMatch = normalizedTitle.match(intelCorePatterns.iSeriesWithModel);
  if (iSeriesMatch) {
    const model = iSeriesMatch[2] ? `-${iSeriesMatch[2]}` : '';
    return `Intel Core i${iSeriesMatch[1]}${model}`;
  }
  
  // Try to extract core_i patterns from title
  const coreIMatch = normalizedTitle.match(intelCorePatterns.coreI);
  if (coreIMatch) {
    return `Intel Core i${coreIMatch[1]}`;
  }
  
  // Try to extract GHz with core_i or i-series patterns
  const ghzCoreMatch = normalizedTitle.match(intelCorePatterns.ghzWithCore);
  if (ghzCoreMatch) {
    return `Intel Core i${ghzCoreMatch[2]} ${ghzCoreMatch[1]}GHz`;
  }
  
  // Try to extract core_i with GHz
  const coreGhzMatch = normalizedTitle.match(intelCorePatterns.coreWithGhz);
  if (coreGhzMatch) {
    return `Intel Core i${coreGhzMatch[1]} ${coreGhzMatch[2]}GHz`;
  }

  return null;
};

/**
 * Extracts Intel budget processors (Celeron, Pentium) from a laptop title
 */
export const extractIntelBudgetProcessor = (normalizedTitle: string): string | null => {
  // Try to extract GHz with Celeron
  const ghzCeleronMatch = normalizedTitle.match(intelBudgetPatterns.ghzWithCeleron) || 
                          normalizedTitle.match(intelBudgetPatterns.celeronWithGhz);
  if (ghzCeleronMatch) {
    return `Intel Celeron ${ghzCeleronMatch[1]}GHz`;
  }
  
  // Try to extract GHz with Pentium
  const ghzPentiumMatch = normalizedTitle.match(intelBudgetPatterns.ghzWithPentium) || 
                          normalizedTitle.match(intelBudgetPatterns.pentiumWithGhz);
  if (ghzPentiumMatch) {
    return `Intel Pentium ${ghzPentiumMatch[1]}GHz`;
  }
  
  // Try to extract Celeron with model numbers
  const celeronMatch = normalizedTitle.match(intelBudgetPatterns.celeronWithModel);
  if (celeronMatch) {
    return `Intel Celeron ${celeronMatch[1].toUpperCase()}`;
  }
  
  // Try to extract generic Celeron mentions
  if (normalizedTitle.includes('celeron')) {
    return 'Intel Celeron';
  }
  
  // Try to extract Pentium with model numbers
  const pentiumMatch = normalizedTitle.match(intelBudgetPatterns.pentiumWithModel);
  if (pentiumMatch) {
    return `Intel Pentium ${pentiumMatch[1].toUpperCase()}`;
  }
  
  // Try to extract generic Pentium mentions
  if (normalizedTitle.includes('pentium')) {
    return 'Intel Pentium';
  }

  return null;
};

/**
 * Primary extractor for all Intel processors
 */
export const extractIntelProcessor = (normalizedTitle: string): string | null => {
  // Try different Intel processor categories in order of priority
  return extractIntelUltraProcessor(normalizedTitle) ||
         extractIntelCoreProcessor(normalizedTitle) ||
         extractIntelBudgetProcessor(normalizedTitle);
};
