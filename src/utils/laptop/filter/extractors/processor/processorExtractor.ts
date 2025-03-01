import {
  intelUltraPatterns,
  intelCorePatterns,
  intelBudgetPatterns,
  appleSiliconPatterns,
  amdRyzenPatterns,
  mobileProcessorPatterns
} from './processorPatterns';

/**
 * Extracts processor information from laptop title
 * First tries to find specific patterns, then falls back to general extraction
 */
export const extractProcessorFromTitle = (
  title: string | undefined,
  existingProcessor?: string | null
): string | null => {
  if (!title) return existingProcessor || null;
  
  const normalizedTitle = title.toLowerCase();
  
  // Special handling for MacBook M2 titles
  if ((normalizedTitle.includes('macbook') || normalizedTitle.includes('mac book')) && 
      normalizedTitle.includes('m2')) {
    // Check for variants
    if (normalizedTitle.includes('pro') && !normalizedTitle.includes('m2 pro')) {
      return 'Apple M2 Pro chip';
    } else if (normalizedTitle.includes('max') && !normalizedTitle.includes('m2 max')) {
      return 'Apple M2 Max chip';
    } else if (normalizedTitle.includes('ultra') && !normalizedTitle.includes('m2 ultra')) {
      return 'Apple M2 Ultra chip';
    } else {
      return 'Apple M2 Chip';
    }
  }
  
  // Special case for when the processor is just "Apple" in a MacBook context
  if (existingProcessor === 'Apple' && 
      (normalizedTitle.includes('macbook') || normalizedTitle.includes('mac book'))) {
    if (normalizedTitle.includes('m2')) {
      return 'Apple M2 Chip';
    } else if (normalizedTitle.includes('m1')) {
      return 'Apple M1 Chip';
    } else if (normalizedTitle.includes('m3')) {
      return 'Apple M3 Chip';
    }
  }
  
  // Try to extract Apple Silicon
  const appleMatch = normalizedTitle.match(appleSiliconPatterns.appleWithVariant);
  if (appleMatch) {
    const variant = appleMatch[2] ? ` ${appleMatch[2].charAt(0).toUpperCase() + appleMatch[2].slice(1)}` : '';
    return `Apple M${appleMatch[1]}${variant} Chip`;
  }
  
  // Try to extract M-series without Apple prefix
  const mSeriesMatch = normalizedTitle.match(appleSiliconPatterns.mSeriesWithVariant);
  if (mSeriesMatch && !normalizedTitle.includes('ram') && !normalizedTitle.includes('memory')) {
    const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
    return `Apple M${mSeriesMatch[1]}${variant} Chip`;
  }
  
  // Try to extract Intel Core Ultra processors
  const ultraMatch = normalizedTitle.match(intelUltraPatterns.coreUltra);
  if (ultraMatch) {
    return `Intel Core Ultra ${ultraMatch[1]}`;
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
  
  // Try to extract MediaTek
  const mediatekMatch = normalizedTitle.match(mobileProcessorPatterns.mediatek);
  if (mediatekMatch) {
    return `MediaTek ${mediatekMatch[1]}`;
  }
  
  // Try to extract Snapdragon
  const snapdragonMatch = normalizedTitle.match(mobileProcessorPatterns.snapdragon);
  if (snapdragonMatch) {
    return `Qualcomm Snapdragon ${snapdragonMatch[1]}`;
  }
  
  // If we have an existing processor value, return that
  if (existingProcessor) {
    // But if it's just "Apple" and we're in a MacBook context, attempt to specify the M-series
    if (existingProcessor === 'Apple' && 
        (normalizedTitle.includes('macbook') || normalizedTitle.includes('mac book'))) {
      if (normalizedTitle.includes('m2')) {
        return 'Apple M2 Chip';
      } else if (normalizedTitle.includes('m1')) {
        return 'Apple M1 Chip';
      } else if (normalizedTitle.includes('m3')) {
        return 'Apple M3 Chip';
      }
    }
    return existingProcessor;
  }
  
  return null;
};
