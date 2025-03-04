
import {
  extractAppleProcessor,
  extractAmdProcessor,
  extractIntelProcessor,
  extractMobileProcessor,
  extractGenericProcessor
} from './index';

/**
 * Main processor extraction function that tries different specialized extractors
 */
export function extractProcessor(text: string): string | null {
  if (!text) return null;
  
  // Try each specialized extractor in order of priority
  return extractAppleProcessor(text) ||
         extractIntelProcessor(text) ||
         extractAmdProcessor(text) ||
         extractMobileProcessor(text) ||
         extractGenericProcessor(text);
}

/**
 * Cleans processor text by removing unrelated specs
 */
export function cleanProcessorText(processor: string): string {
  if (!processor) return '';
  
  return processor
    .replace(/(\d+\s*GB\s*(RAM|Memory|DDR\d*))/i, '')
    .replace(/(\d+\s*(GB|TB)\s*(SSD|HDD|Storage))/i, '')
    .replace(/(\d+(\.\d+)?\s*inch)/i, '')
    .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standard process for normalizing processor information
 */
export function standardizeProcessor(processor: string): string {
  if (!processor) return processor;
  
  let standardized = processor
    // Normalize Intel naming
    .replace(/intel core/i, 'Intel Core')
    .replace(/intel core ultra/i, 'Intel Core Ultra')
    .replace(/intel celeron/i, 'Intel Celeron')
    .replace(/intel pentium gold/i, 'Intel Pentium Gold')
    .replace(/intel pentium silver/i, 'Intel Pentium Silver')
    .replace(/intel pentium/i, 'Intel Pentium')
    // Normalize AMD naming
    .replace(/amd ryzen/i, 'AMD Ryzen')
    .replace(/\br([3579])[-\s](\d{4}[a-z]*)/i, 'AMD Ryzen $1-$2')
    .replace(/\bryzen\s+(\d)\s+(\d{4}[a-z]*)/i, 'AMD Ryzen $1-$2')
    // Normalize Apple naming
    .replace(/apple\s*m(\d)/i, 'Apple M$1')
    // Normalize mobile processors
    .replace(/qualcomm snapdragon/i, 'Qualcomm Snapdragon')
    .replace(/mediatek dimensity/i, 'MediaTek Dimensity')
    .replace(/mediatek helio/i, 'MediaTek Helio');
  
  // Remove duplicate prefixes
  standardized = standardized
    .replace(/(Intel Core)\s+Intel Core/i, '$1')
    .replace(/(Intel Core Ultra)\s+Intel Core Ultra/i, '$1')
    .replace(/(AMD Ryzen)\s+AMD Ryzen/i, '$1');
  
  // Expand short-hand notations
  if (/^i[3579]/i.test(standardized)) {
    standardized = `Intel Core ${standardized}`;
  }
  
  // Clean up trademark symbols
  standardized = standardized.replace(/[™®©]/g, '');
  
  return standardized;
}
