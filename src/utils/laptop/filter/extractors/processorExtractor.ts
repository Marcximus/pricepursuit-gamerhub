
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
  
  // Try to extract Intel Core Ultra processors
  const ultraMatch = normalizedTitle.match(/(?:intel\s+)?(?:\d+[-\s]core\s+)?(?:core\s+)?ultra\s+([579])(?:\s+\d{3}[a-z]*)?/i);
  if (ultraMatch) {
    return `Intel Core Ultra ${ultraMatch[1]}`;
  }
  
  // Try to extract Intel Core i-series processors with model numbers
  const intelCoreMatch = normalizedTitle.match(/(?:intel\s+)?core\s+i([3579])(?:[- ](\d{4,5}[a-z]*))?/i);
  if (intelCoreMatch) {
    const model = intelCoreMatch[2] ? `-${intelCoreMatch[2]}` : '';
    return `Intel Core i${intelCoreMatch[1]}${model}`;
  }
  
  // Try to extract just i-series mentions (i5, i7, etc.)
  const iSeriesMatch = normalizedTitle.match(/\bi([3579])(?:[- ](\d{4,5}[a-z]*))?/i);
  if (iSeriesMatch) {
    const model = iSeriesMatch[2] ? `-${iSeriesMatch[2]}` : '';
    return `Intel Core i${iSeriesMatch[1]}${model}`;
  }
  
  // Try to extract GHz with core_i patterns
  const ghzCoreMatch = normalizedTitle.match(/(\d+(?:\.\d+)?)\s*ghz\s*(?:core_i|i)([3579])/i);
  if (ghzCoreMatch) {
    return `Intel Core i${ghzCoreMatch[2]} ${ghzCoreMatch[1]}GHz`;
  }
  
  // Try to extract Celeron with model numbers
  const celeronMatch = normalizedTitle.match(/(?:intel\s+)?celeron\s+(n\d{4})/i);
  if (celeronMatch) {
    return `Intel Celeron ${celeronMatch[1].toUpperCase()}`;
  }
  
  // Try to extract generic Celeron mentions
  if (normalizedTitle.includes('celeron')) {
    return 'Intel Celeron';
  }
  
  // Try to extract Pentium with model numbers
  const pentiumMatch = normalizedTitle.match(/(?:intel\s+)?pentium\s+([a-z0-9]+)/i);
  if (pentiumMatch) {
    return `Intel Pentium ${pentiumMatch[1].toUpperCase()}`;
  }
  
  // Try to extract generic Pentium mentions
  if (normalizedTitle.includes('pentium')) {
    return 'Intel Pentium';
  }
  
  // Try to extract Apple Silicon
  const appleMatch = normalizedTitle.match(/apple\s+m([1234])(?:\s+(pro|max|ultra))?/i);
  if (appleMatch) {
    const variant = appleMatch[2] ? ` ${appleMatch[2].charAt(0).toUpperCase() + appleMatch[2].slice(1)}` : '';
    return `Apple M${appleMatch[1]}${variant}`;
  }
  
  // Try to extract M-series without Apple prefix
  const mSeriesMatch = normalizedTitle.match(/\bm([1234])(?:\s+(pro|max|ultra))?\b/i);
  if (mSeriesMatch && !normalizedTitle.includes('ram') && !normalizedTitle.includes('memory')) {
    const variant = mSeriesMatch[2] ? ` ${mSeriesMatch[2].charAt(0).toUpperCase() + mSeriesMatch[2].slice(1)}` : '';
    return `Apple M${mSeriesMatch[1]}${variant}`;
  }
  
  // Try to extract AMD Ryzen
  const ryzenMatch = normalizedTitle.match(/amd\s+ryzen\s+([3579])(?:[- ](\d{4}[a-z]*))?/i);
  if (ryzenMatch) {
    const model = ryzenMatch[2] ? `-${ryzenMatch[2]}` : '';
    return `AMD Ryzen ${ryzenMatch[1]}${model}`;
  }
  
  // Try to extract Ryzen without AMD prefix
  const ryzenWithoutAmdMatch = normalizedTitle.match(/\bryzen\s+([3579])(?:[- ](\d{4}[a-z]*))?/i);
  if (ryzenWithoutAmdMatch) {
    const model = ryzenWithoutAmdMatch[2] ? `-${ryzenWithoutAmdMatch[2]}` : '';
    return `AMD Ryzen ${ryzenWithoutAmdMatch[1]}${model}`;
  }
  
  // Try to extract MediaTek
  const mediatekMatch = normalizedTitle.match(/mediatek\s+([a-z0-9]+)/i);
  if (mediatekMatch) {
    return `MediaTek ${mediatekMatch[1]}`;
  }
  
  // Try to extract Snapdragon
  const snapdragonMatch = normalizedTitle.match(/(?:qualcomm\s+)?snapdragon\s+([a-z0-9]+)/i);
  if (snapdragonMatch) {
    return `Qualcomm Snapdragon ${snapdragonMatch[1]}`;
  }
  
  // If we have an existing processor value, return that
  if (existingProcessor) {
    return existingProcessor;
  }
  
  return null;
};

/**
 * Standardizes processor information into categories for filtering
 */
export const standardizeProcessorForFiltering = (processor: string | null | undefined): string => {
  if (!processor) return 'Other Processor';
  
  const normalizedProcessor = processor.toLowerCase();
  
  // Detect Apple Silicon
  if (normalizedProcessor.includes('apple m4 ultra') || normalizedProcessor.includes('m4 ultra')) {
    return 'Apple M4 Ultra';
  }
  if (normalizedProcessor.includes('apple m4 max') || normalizedProcessor.includes('m4 max')) {
    return 'Apple M4 Max';
  }
  if (normalizedProcessor.includes('apple m4 pro') || normalizedProcessor.includes('m4 pro')) {
    return 'Apple M4 Pro';
  }
  if (normalizedProcessor.includes('apple m4') || normalizedProcessor.includes('m4 chip')) {
    return 'Apple M4';
  }
  
  if (normalizedProcessor.includes('apple m3 ultra') || normalizedProcessor.includes('m3 ultra')) {
    return 'Apple M3 Ultra';
  }
  if (normalizedProcessor.includes('apple m3 max') || normalizedProcessor.includes('m3 max')) {
    return 'Apple M3 Max';
  }
  if (normalizedProcessor.includes('apple m3 pro') || normalizedProcessor.includes('m3 pro')) {
    return 'Apple M3 Pro';
  }
  if (normalizedProcessor.includes('apple m3') || normalizedProcessor.includes('m3 chip')) {
    return 'Apple M3';
  }
  
  if (normalizedProcessor.includes('apple m2 ultra') || normalizedProcessor.includes('m2 ultra')) {
    return 'Apple M2 Ultra';
  }
  if (normalizedProcessor.includes('apple m2 max') || normalizedProcessor.includes('m2 max')) {
    return 'Apple M2 Max';
  }
  if (normalizedProcessor.includes('apple m2 pro') || normalizedProcessor.includes('m2 pro')) {
    return 'Apple M2 Pro';
  }
  if (normalizedProcessor.includes('apple m2') || normalizedProcessor.includes('m2 chip')) {
    return 'Apple M2';
  }
  
  if (normalizedProcessor.includes('apple m1 ultra') || normalizedProcessor.includes('m1 ultra')) {
    return 'Apple M1 Ultra';
  }
  if (normalizedProcessor.includes('apple m1 max') || normalizedProcessor.includes('m1 max')) {
    return 'Apple M1 Max';
  }
  if (normalizedProcessor.includes('apple m1 pro') || normalizedProcessor.includes('m1 pro')) {
    return 'Apple M1 Pro';
  }
  if (normalizedProcessor.includes('apple m1') || normalizedProcessor.includes('m1 chip')) {
    return 'Apple M1';
  }
  
  // Detect Intel Core Ultra
  if (normalizedProcessor.match(/core\s+ultra\s+9|ultra\s+9|\d+-core\s+ultra\s+9/)) {
    return 'Intel Core Ultra 9';
  }
  if (normalizedProcessor.match(/core\s+ultra\s+7|ultra\s+7|\d+-core\s+ultra\s+7/)) {
    return 'Intel Core Ultra 7';
  }
  if (normalizedProcessor.match(/core\s+ultra\s+5|ultra\s+5|\d+-core\s+ultra\s+5/)) {
    return 'Intel Core Ultra 5';
  }
  if (normalizedProcessor.includes('core ultra') || normalizedProcessor.includes('intel ultra')) {
    return 'Intel Core Ultra';
  }
  
  // Detect Intel Core i-series with generation info
  const intelGenMatch = normalizedProcessor.match(/i([3579])[\s-](\d{4,5})/i);
  if (intelGenMatch) {
    const coreNumber = intelGenMatch[1];
    const modelNumber = intelGenMatch[2];
    
    if (modelNumber.startsWith('13') || modelNumber.startsWith('14')) {
      return `Intel Core i${coreNumber} (13th/14th Gen)`;
    }
    if (modelNumber.startsWith('11') || modelNumber.startsWith('12')) {
      return `Intel Core i${coreNumber} (11th/12th Gen)`;
    }
    if (modelNumber.startsWith('10')) {
      return `Intel Core i${coreNumber} (10th Gen)`;
    }
  }
  
  // Check explicit generation mentions
  if (normalizedProcessor.includes('13th gen') || normalizedProcessor.includes('14th gen')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9')) {
      return 'Intel Core i9 (13th/14th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7')) {
      return 'Intel Core i7 (13th/14th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5')) {
      return 'Intel Core i5 (13th/14th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3')) {
      return 'Intel Core i3 (13th/14th Gen)';
    }
  }
  
  if (normalizedProcessor.includes('11th gen') || normalizedProcessor.includes('12th gen')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9')) {
      return 'Intel Core i9 (11th/12th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7')) {
      return 'Intel Core i7 (11th/12th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5')) {
      return 'Intel Core i5 (11th/12th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3')) {
      return 'Intel Core i3 (11th/12th Gen)';
    }
  }
  
  if (normalizedProcessor.includes('10th gen')) {
    if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9')) {
      return 'Intel Core i9 (10th Gen)';
    }
    if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7')) {
      return 'Intel Core i7 (10th Gen)';
    }
    if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5')) {
      return 'Intel Core i5 (10th Gen)';
    }
    if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3')) {
      return 'Intel Core i3 (10th Gen)';
    }
  }
  
  // Detect generic Intel Core i-series
  if (normalizedProcessor.includes('i9') || normalizedProcessor.includes('core i9') || 
      normalizedProcessor.match(/\bcore_i9\b/)) {
    return 'Intel Core i9';
  }
  if (normalizedProcessor.includes('i7') || normalizedProcessor.includes('core i7') || 
      normalizedProcessor.match(/\bcore_i7\b/)) {
    return 'Intel Core i7';
  }
  if (normalizedProcessor.includes('i5') || normalizedProcessor.includes('core i5') || 
      normalizedProcessor.match(/\bcore_i5\b/)) {
    return 'Intel Core i5';
  }
  if (normalizedProcessor.includes('i3') || normalizedProcessor.includes('core i3') || 
      normalizedProcessor.match(/\bcore_i3\b/)) {
    return 'Intel Core i3';
  }
  
  // Detect AMD Ryzen
  if (normalizedProcessor.includes('ryzen 9')) {
    return 'AMD Ryzen 9';
  }
  if (normalizedProcessor.includes('ryzen 7')) {
    return 'AMD Ryzen 7';
  }
  if (normalizedProcessor.includes('ryzen 5')) {
    return 'AMD Ryzen 5';
  }
  if (normalizedProcessor.includes('ryzen 3')) {
    return 'AMD Ryzen 3';
  }
  
  // Detect other common processor types
  if (normalizedProcessor.includes('celeron')) {
    return 'Intel Celeron';
  }
  if (normalizedProcessor.includes('pentium')) {
    return 'Intel Pentium';
  }
  if (normalizedProcessor.includes('snapdragon')) {
    return 'Qualcomm Snapdragon';
  }
  if (normalizedProcessor.includes('mediatek')) {
    return 'MediaTek';
  }
  
  // If we can't categorize it, mark it as "Other"
  return 'Other Processor';
};
