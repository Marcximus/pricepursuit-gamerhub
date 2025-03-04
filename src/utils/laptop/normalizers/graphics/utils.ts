/**
 * Common utility functions for graphics card normalization
 */

/**
 * Cleans up common inconsistencies in graphics card strings
 */
export const cleanGraphicsString = (graphics: string): string => {
  if (!graphics) return '';
  
  return graphics
    .replace(/\s+/g, ' ')               // Normalize multiple spaces
    .replace(/graphics\s+card:?/i, '')  // Remove "Graphics Card:" prefix
    .replace(/integrated\s+graphics:?/i, '') // Remove "Integrated Graphics:" prefix
    .replace(/gpu:?/i, '')              // Remove "GPU:" prefix
    .replace(/video:?/i, '')            // Remove "Video:" prefix
    .trim();
};

/**
 * Extracts just the graphics card info if mixed with other specs
 */
export const extractGraphicsFromMixedSpecs = (normalizedString: string): string => {
  if (normalizedString.includes('Brand:') || 
      normalizedString.includes('Screen Size:') || 
      normalizedString.includes('Type:') ||
      normalizedString.includes('Memory:') ||
      normalizedString.includes('Storage:')) {
    // Keep only the part before these common delimiter phrases
    const parts = normalizedString.split(/Brand:|Screen Size:|Type:|Memory:|RAM|Hard Drive|Storage:/i);
    return parts[0].trim();
  }
  
  return normalizedString.replace(/(\d+)\s*GB\s*(?:RAM|Memory|DDR\d*)/i, '')
    .replace(/(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|Storage)/i, '')
    .replace(/(\d+(?:\.\d+)?)\s*inch/i, '')
    .replace(/\b(?:USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
    .replace(/\b(?:Touchscreen|Backlit|Keyboard)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};
