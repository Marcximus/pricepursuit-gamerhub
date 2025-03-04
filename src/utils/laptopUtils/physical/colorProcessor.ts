
/**
 * Processes and extracts color information
 */
export const processColor = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Common laptop colors
  const colorPatterns = [
    /\b(?:Silver|Gray|Grey|Black|White|Gold|Blue|Red|Pink|Purple|Green|Bronze|Copper|Rose\s*Gold|Space\s*Gray|Midnight|Starlight)\b/i,
    /\b(?:Obsidian|Platinum|Arctic|Onyx|Frost|Slate|Carbon|Shadow|Cosmic|Galaxy|Mystic)\s*(?:Silver|Gray|Grey)?\b/i,
    /\bAluminum\s*(?:Silver|Gray|Grey)?\b/i,
    /\bColor:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i
  ];
  
  for (const pattern of colorPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // If we matched a "Color: X" pattern, use X
      if (match[1]) {
        // Skip non-color words often found after "Color:"
        const nonColorWords = /laptop|computer|fast|performance|high|new|latest/i;
        if (!nonColorWords.test(match[1])) {
          return match[1].trim();
        }
      } else {
        return match[0].trim();
      }
    }
  }
  
  return undefined;
};
