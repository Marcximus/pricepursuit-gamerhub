
import { genericPatterns } from '../patterns/processorPatterns';

/**
 * Extracts and processes generic processor mentions
 */
export function extractGenericProcessor(text: string): string | null {
  if (!text) return null;
  
  const normalizedText = text.toLowerCase();
  
  // Check explicit processor/CPU label
  const processorLabelMatch = normalizedText.match(genericPatterns.processorLabel);
  if (processorLabelMatch && processorLabelMatch[1] && processorLabelMatch[1].length > 5) {
    const extractedText = processorLabelMatch[1].trim();
    // Only accept if it looks valid
    if (/intel|amd|ryzen|core|celeron|pentium|snapdragon|mediatek|apple/i.test(extractedText)) {
      return extractedText;
    }
  }
  
  // Check for octa-core processors
  if (genericPatterns.octaCore.test(normalizedText)) {
    if (normalizedText.includes('intel')) {
      return 'Intel Octa-core Processor';
    } else if (normalizedText.includes('amd')) {
      return 'AMD Octa-core Processor';
    }
    return 'Octa-core Processor';
  }
  
  // Check for N-core processors
  const coreCountMatch = normalizedText.match(genericPatterns.coreCount);
  if (coreCountMatch) {
    if (normalizedText.includes('intel')) {
      return `Intel ${coreCountMatch[1]}-core Processor`;
    } else if (normalizedText.includes('amd')) {
      return `AMD ${coreCountMatch[1]}-core Processor`;
    }
    // Only return generic core count if significant
    if (parseInt(coreCountMatch[1]) >= 4) {
      return `${coreCountMatch[1]}-core Processor`;
    }
  }
  
  return null;
}
