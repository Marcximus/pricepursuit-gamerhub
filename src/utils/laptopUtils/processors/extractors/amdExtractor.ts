
import { amdRyzenPatterns } from '../patterns/processorPatterns';

/**
 * Extracts and processes AMD Ryzen processors
 */
export function extractAmdProcessor(text: string): string | null {
  if (!text) return null;
  
  const normalizedText = text.toLowerCase();
  
  // Check for full AMD Ryzen format with model number
  const fullRyzenMatch = normalizedText.match(amdRyzenPatterns.fullRyzen);
  if (fullRyzenMatch) {
    return `AMD Ryzen ${fullRyzenMatch[1]}-${fullRyzenMatch[2]}`;
  }
  
  // Check for plain "Ryzen X XXXX" format (like "Ryzen 3 7330U")
  const plainRyzenMatch = normalizedText.match(amdRyzenPatterns.plainRyzen);
  if (plainRyzenMatch) {
    return `AMD Ryzen ${plainRyzenMatch[1]}-${plainRyzenMatch[2]}`;
  }
  
  // Check for Ryzen with dashes, underscores or spaces
  const ryzenDashMatch = normalizedText.match(amdRyzenPatterns.ryzenWithDash);
  if (ryzenDashMatch) {
    return `AMD Ryzen ${ryzenDashMatch[1]}-${ryzenDashMatch[2]}`;
  }
  
  // Check for AMD R5, R7 format
  const amdRMatch = normalizedText.match(amdRyzenPatterns.amdR);
  if (amdRMatch) {
    return `AMD Ryzen ${amdRMatch[1]}-${amdRMatch[2]}`;
  }
  
  // Check for Ryzen with core count
  const ryzenCoreMatch = normalizedText.match(amdRyzenPatterns.ryzenCore);
  if (ryzenCoreMatch) {
    return `AMD Ryzen ${ryzenCoreMatch[1]} (${ryzenCoreMatch[2]}-core)`;
  }
  
  // Check for AMD Ryzen with core count
  const amdRyzenCoreMatch = normalizedText.match(amdRyzenPatterns.amdRyzenCore);
  if (amdRyzenCoreMatch) {
    return `AMD Ryzen ${amdRyzenCoreMatch[1]} (${amdRyzenCoreMatch[2]}-core)`;
  }
  
  // Generic Ryzen mention
  if (normalizedText.includes('ryzen')) {
    // Try to extract Ryzen series number
    const seriesMatch = normalizedText.match(/\bryzen\s+([3579])\b/i);
    if (seriesMatch) {
      return `AMD Ryzen ${seriesMatch[1]}`;
    }
    return 'AMD Ryzen';
  }
  
  // Check for explicit AMD without Ryzen
  if (normalizedText.includes('amd') && !normalizedText.includes('graphics')) {
    return 'AMD';
  }
  
  return null;
}
