
/**
 * Parser utility for screen size values
 */

/**
 * Gets screen size value in inches from a string
 * Validates that the screen size is within a realistic range for laptops
 */
export const getScreenSizeValue = (size: string): number => {
  if (!size) return 0;
  
  const match = size.match(/(\d+\.?\d*)/);
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  
  // Validate screen size to be realistic for laptops (10" to 21")
  if (value < 10 || value > 21) {
    return 0;
  }
  
  return value;
};
