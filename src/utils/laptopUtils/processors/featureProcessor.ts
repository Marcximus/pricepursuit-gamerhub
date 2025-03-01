
/**
 * Functions for processing and detecting laptop features
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

export const processOperatingSystem = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for OS patterns
  const osPatterns = [
    /\b(?:Windows|Win)\s*(?:11|10)\s*(?:Home|Pro|Education|Enterprise|S\s*Mode)?\b/i,
    /\b(?:macOS|OS\s*X|MacOS)\b/i,
    /\b(?:Chrome\s*OS|ChromeOS)\b/i,
    /\b(?:Linux|Ubuntu|Fedora|Debian)\b/i,
    /\b(?:DOS|FreeDOS)\b/i
  ];
  
  for (const pattern of osPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      let os = match[0].trim();
      
      // Standardize OS names
      os = os.replace(/\bWin\s*11\b/i, 'Windows 11')
             .replace(/\bWin\s*10\b/i, 'Windows 10')
             .replace(/\bOS\s*X\b/i, 'macOS');
      
      // Add Home/Pro for Windows if not specified
      if (os.match(/\bWindows\s*\d+\b/i) && !os.match(/Home|Pro|Education|Enterprise|S\s*Mode/i)) {
        if (os.toLowerCase().includes('pro') || textToSearch.toLowerCase().includes('business')) {
          os += ' Pro';
        } else {
          os += ' Home';
        }
      }
      
      return os;
    }
  }
  
  // For Apple products, default to macOS
  if (textToSearch.match(/\b(?:MacBook|Mac\s*Book|Apple)\b/i)) {
    return 'macOS';
  }
  
  // Default for most laptops is Windows
  if (!textToSearch.match(/\b(?:Chrome\s*Book|ChromeOS)\b/i)) {
    return 'Windows';
  }
  
  return undefined;
};

export const processColor = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Common laptop colors
  const colorPatterns = [
    /\b(?:Silver|Gray|Grey|Black|White|Gold|Blue|Red|Pink|Purple|Green|Bronze|Copper|Rose\s*Gold|Space\s*Gray|Midnight|Starlight)\b/i,
    /\b(?:Obsidian|Platinum|Arctic|Onyx|Frost|Slate|Carbon|Shadow|Cosmic|Galaxy|Mystic)\s*(?:Silver|Gray|Grey|Black|Blue)?\b/i,
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

export const processWarranty = (title: string, description?: string): string | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for warranty patterns
  const warrantyPatterns = [
    /\b(\d+)[\s-](?:Year|Yr)s?\s*(?:Warranty|Limited\s*Warranty)\b/i,
    /\bWarranty:?\s*(\d+)[\s-](?:Year|Yr)s?\b/i,
    /\b(\d+)[\s-](?:Year|Yr)s?\s*(?:Manufacturer['']?s?\s*Warranty)\b/i
  ];
  
  for (const pattern of warrantyPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const years = parseInt(match[1], 10);
      if (years > 0 && years <= 5) { // Reasonable warranty periods
        return `${years} Year${years > 1 ? 's' : ''}`;
      }
    }
  }
  
  return undefined;
};

export const processOfficeIncluded = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Check for Microsoft Office mentions
  const officePatterns = [
    /\b(?:Microsoft|MS)\s*Office\s*(?:Home|Student|Professional|Business|365)?\s*(?:20\d\d|Included|Pre-installed)\b/i,
    /\b(?:Includes|Bundled\s*with|With)\s*(?:Microsoft|MS)\s*Office\b/i,
    /\bOffice\s*(?:Home|Student|Professional|Business|365)?\s*(?:20\d\d|Included|License)\b/i
  ];
  
  for (const pattern of officePatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  return undefined;
};
