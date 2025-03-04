
/**
 * Processes touchscreen information
 */
export const processTouchscreen = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for touchscreen indicators
  const touchPatterns = [
    /\b(?:touchscreen|touch\s*screen|touch\s*display|touch\s*enabled)\b/i,
    /\b(?:touch|touchscreen)(?:-|\s*)(?:enabled|capable|ready)\b/i
  ];
  
  for (const pattern of touchPatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  // Specific models known to be touchscreen
  if (textToSearch.match(/\b(?:Surface|Yoga|Flex|Spectre x360|Envy x360|XPS 2-in-1|Flip)\b/i)) {
    if (textToSearch.match(/\b(?:2-in-1|convertible|360|tablet\s*mode)\b/i)) {
      return true;
    }
  }
  
  // If not explicitly mentioned, we can't determine
  return undefined;
};
