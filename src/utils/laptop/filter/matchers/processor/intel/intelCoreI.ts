
/**
 * Intel Core i-series matcher with generation info
 */
export function matchesIntelCoreWithGeneration(
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  // Extract core i-series number (3/5/7/9) from filter
  const coreSeriesMatch = filterValue.match(/Core\s+i([3579])/);
  if (!coreSeriesMatch) return false;
  
  const coreSeries = coreSeriesMatch[1];
  
  // Extract generation range from filter (e.g., 11th-14th Gen)
  const generationMatch = filterValue.match(/\((\d+)(?:th|rd|nd)-(\d+)(?:th|rd|nd)\s+Gen\)/);
  if (!generationMatch) return false;
  
  const minGen = parseInt(generationMatch[1], 10);
  const maxGen = parseInt(generationMatch[2], 10);
  
  // Check the processor value
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    // First look for direct generation mentions
    const processorGenMatch = normalizedProcessor.match(/(\d+)(?:th|rd|nd)\s*gen/i);
    if (processorGenMatch) {
      const processorGen = parseInt(processorGenMatch[1], 10);
      
      // Check if processor contains the right core i-series
      if (normalizedProcessor.match(new RegExp(`\\bi${coreSeries}\\b`, 'i')) && 
          processorGen >= minGen && processorGen <= maxGen) {
        return true;
      }
    }
    
    // Look for model number pattern (e.g., i5-1135G7, i7-10750H)
    const modelMatch = normalizedProcessor.match(/i${coreSeries}[- ](\d{4,5})/i);
    if (modelMatch) {
      const model = modelMatch[1];
      // First digit of 4-digit model number often indicates generation
      if (model.length >= 4) {
        const modelGen = parseInt(model[0], 10);
        // For 10th+ gen, model number starts with 10, 11, 12, etc.
        // For older gens, we need special mapping
        if (modelGen >= 10) {
          // Direct mapping for 10th+ gen
          if (modelGen >= minGen && modelGen <= maxGen) {
            return true;
          }
        } else {
          // Handle 1st-9th gen mapping
          // For example, 8th gen might have models starting with 8 (i7-8565U)
          // or sometimes other numbers based on product line
          if (minGen <= 9 && modelGen >= 1 && modelGen <= 9) {
            return true;
          }
        }
      }
    }
  }
  
  // Check the product title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    // First look for direct generation mentions
    const titleGenMatch = normalizedTitle.match(/(\d+)(?:th|rd|nd)\s*gen/i);
    if (titleGenMatch) {
      const titleGen = parseInt(titleGenMatch[1], 10);
      
      // Check if title contains the right core i-series
      if (normalizedTitle.match(new RegExp(`\\bi${coreSeries}\\b`, 'i')) && 
          titleGen >= minGen && titleGen <= maxGen) {
        return true;
      }
    }
    
    // Look for model number pattern in title
    const titleModelMatch = normalizedTitle.match(/i${coreSeries}[- ](\d{4,5})/i);
    if (titleModelMatch) {
      const model = titleModelMatch[1];
      if (model.length >= 4) {
        const modelGen = parseInt(model[0], 10);
        if (modelGen >= 10) {
          if (modelGen >= minGen && modelGen <= maxGen) {
            return true;
          }
        } else {
          if (minGen <= 9 && modelGen >= 1 && modelGen <= 9) {
            return true;
          }
        }
      }
    }
  }
  
  return false;
}
