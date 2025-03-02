
/**
 * Processes and normalizes screen size information
 * Extracts screen size value from text
 */
export const processScreenSize = (screenSize: string | undefined, title: string, description?: string): string | undefined => {
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    // Clean up existing screen size string to remove unrelated specs
    const cleanedScreenSize = screenSize
      .replace(/\d+\s*(GB|TB)\s*(RAM|SSD|HDD|Memory|Storage)/i, '')
      .replace(/\b(USB|HDMI|Windows|WiFi|Bluetooth)\b/gi, '')
      .trim();
      
    if (cleanedScreenSize.length > 1) {
      return cleanedScreenSize;
    }
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for screen size patterns in the text (more specific patterns first)
  // Express pattern with decimal numbers and inch keyword
  const sizePatterns = [
    // Match specific screen size with decimal + inch
    /\b(\d{1,2}(?:\.\d{1,2})?)[- ](?:inch|in|"|''|inches)\b/i,
    
    // Match screen size with just the double quote as inch indicator
    /\b(\d{1,2}(?:\.\d{1,2})?)\s*["″]\b/i,
    
    // Match screen size in the format 15.6-inch or similar
    /\b(\d{1,2}(?:\.\d{1,2})?)[- ](?:inch(?:es)?)\b/i,
    
    // Match screen size mentioned with a double quote symbol
    /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:inch(?:es)?|["″])\b/i,
    
    // Match screen size mentioned with "Screen" or "Display"
    /\b(?:screen|display)?\s*(?:size)?:?\s*(\d{1,2}(?:\.\d{1,2})?)\s*(?:inch|in|"|''|inches)\b/i,
    
    // Less specific patterns (only use if more specific ones don't match)
    /\b(\d{1,2}(?:\.\d{1,2})?)\s*(?:in|inch|inches)\b/i,
    
    // Common laptop/notebook sizes - without inch keyword but at the start of text
    /^(?:notebook|laptop)\s*(\d{1,2}(?:\.\d{1,2})?)\b/i,
  ];
  
  for (const pattern of sizePatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const sizeValue = parseFloat(match[1]);
      
      // Validate that this looks like a realistic screen size for a laptop
      if (sizeValue >= 10 && sizeValue <= 22) {
        return `${sizeValue}″`;
      }
    }
  }
  
  // Look for common laptop screen sizes
  const commonSizes = textToSearch.match(/\b(11\.6|12\.5|13\.3|14|15\.6|16|17\.3)\b/);
  if (commonSizes && commonSizes[1]) {
    const sizeValue = parseFloat(commonSizes[1]);
    if (sizeValue >= 10 && sizeValue <= 22) {
      return `${sizeValue}″`;
    }
  }
  
  // Match MacBook specific sizes
  if (textToSearch.toLowerCase().includes('macbook')) {
    if (textToSearch.match(/\b(air|pro)\s*13\b/i)) return '13.3″';
    if (textToSearch.match(/\b(air|pro)\s*14\b/i)) return '14.2″';
    if (textToSearch.match(/\b(air|pro)\s*15\b/i)) return '15.3″';
    if (textToSearch.match(/\b(air|pro)\s*16\b/i)) return '16.2″';
  }
  
  return undefined;
};

/**
 * Processes and normalizes weight information
 */
export const processWeight = (weight: string | undefined, title: string, description?: string): string | undefined => {
  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    return weight.trim();
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for weight in the text using common weight patterns
  const weightPatterns = [
    // Match weight with pounds/lbs
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(pounds|pound|lbs|lb)\b/i,
    
    // Match weight with kilograms/kg
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(kg|kilograms|kilogram)\b/i,
    
    // Match weight with grams
    /\b(\d{3,4})(?:\s*|-)(g|grams|gram)\b/i,
    
    // Match weight with "weighs" verb
    /\bweighs\s+(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i,
    
    // Match weight mentioned with "weight"
    /\bweight:?\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i,
  ];
  
  for (const pattern of weightPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1] && match[2]) {
      const weightValue = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('lb') || unit.includes('pound')) {
        // Validate that this looks like a realistic weight for a laptop
        if (weightValue > 0.5 && weightValue < 12) {
          return `${weightValue} lbs`;
        }
      } else if (unit.includes('kg') || unit.includes('kilo')) {
        // Convert kg to lbs for standardization if needed
        if (weightValue > 0.2 && weightValue < 5) {
          return `${weightValue} kg`;
        }
      } else if (unit.includes('g')) {
        // Convert grams to kg for standardization
        const kgValue = weightValue / 1000;
        if (kgValue > 0.2 && kgValue < 5) {
          return `${kgValue.toFixed(2)} kg`;
        }
      }
    }
  }
  
  return undefined;
};

/**
 * Processes and normalizes battery life information
 */
export const processBatteryLife = (batteryLife: string | undefined, title: string, description?: string): string | undefined => {
  if (batteryLife && typeof batteryLife === 'string' && !batteryLife.includes('undefined')) {
    return batteryLife.trim();
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for battery life in the text using common battery life patterns
  const batteryPatterns = [
    // Match battery life with hours mention
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\s*(?:battery|runtime|battery life)\b/i,
    
    // Match battery life with "up to" pattern
    /\bup\s*to\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\b/i,
    
    // Match battery life with "lasts" verb
    /\bbattery\s*(?:life|runtime)?\s*(?:lasts|of)\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\b/i,
    
    // Match battery life mentioned with "battery life" or "battery"
    /\bbattery\s*(?:life|runtime)?:?\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\b/i,
    
    // More generic pattern for battery hours
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-|–|—)(?:hour|hr|h)s?\s*(?:of|on)?\s*(?:battery|runtime)?\b/i,
  ];
  
  for (const pattern of batteryPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const hours = parseFloat(match[1]);
      
      // Validate that this looks like a realistic battery life for a laptop
      if (hours > 0 && hours <= 24) {
        return `${hours} hours`;
      }
    }
  }
  
  return undefined;
};

/**
 * Processes and normalizes webcam/camera information
 */
export const processCamera = (camera: string | undefined, title: string, description?: string): string | undefined => {
  if (camera && typeof camera === 'string' && !camera.includes('undefined')) {
    return camera.trim();
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for camera in the text using common camera patterns
  const cameraPatterns = [
    // Match HD/FHD camera mention
    /\b(HD|FHD|720p|1080p)\s*(?:webcam|camera)\b/i,
    
    // Match megapixel camera mention
    /\b(\d+(?:\.\d+)?MP|megapixel)\s*(?:webcam|camera)\b/i,
    
    // Match camera with special features
    /\b(?:IR|infrared|face recognition|windows hello)\s*(?:webcam|camera)\b/i,
    
    // Match privacy camera mentions
    /\b(?:privacy|physical shutter)\s*(?:webcam|camera)\b/i,
    
    // Match "with webcam" or similar
    /\bwith\s*(?:built-in|integrated)?\s*(?:webcam|camera)\b/i,
    
    // Match any webcam mention
    /\b(?:webcam|camera)\b/i,
  ];
  
  for (const pattern of cameraPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // Extract the camera spec
      let cameraSpec = match[0].trim();
      
      // Standardize common terms
      cameraSpec = cameraSpec
        .replace(/web\s*cam/i, 'webcam')
        .replace(/built-in|integrated/i, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Add HD if webcam is mentioned but no quality is specified
      if (cameraSpec.toLowerCase() === 'webcam' || cameraSpec.toLowerCase() === 'camera') {
        cameraSpec = 'HD Webcam';
      }
      
      return cameraSpec;
    }
  }
  
  // Check specifically for no webcam
  if (textToSearch.match(/\bno\s*(?:webcam|camera)\b/i)) {
    return 'No webcam';
  }
  
  return undefined;
};

/**
 * Processes and extracts color information
 */
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

/**
 * Detects backlit keyboard feature
 */
export const processBacklitKeyboard = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Check for backlit keyboard mentions
  const backlitPatterns = [
    /\b(?:backlit|backlight(?:ed)?)\s*(?:keyboard|keys|key\s*board)\b/i,
    /\b(?:keyboard\s*with\s*backlight(?:ing)?)\b/i,
    /\bKB\s*Backlight(?:ed)?\b/i,
    /\bBacklit\s*KB\b/i
  ];
  
  for (const pattern of backlitPatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  return undefined;
};

/**
 * Extracts information about ports
 */
export const processPorts = (title: string, description?: string): Record<string, number> | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  const ports: Record<string, number> = {};
  
  // Check for USB ports (all types)
  const usbPatterns = [
    /\b(\d+)\s*(?:x\s*)?USB(?:\s*Type[\s-])?(?:A|C)?\s*(?:3\.[01]|3|2\.0|2)?\b/i,
    /\bUSB(?:\s*Type[\s-])?(?:A|C)?\s*(?:3\.[01]|3|2\.0|2)?\s*(?:x\s*)?(\d+)\b/i,
    /\b(\d+)\s*USB(?:\s*Type[\s-])?(?:A|C)?\s*ports\b/i
  ];
  
  // Check for HDMI ports
  const hdmiPatterns = [
    /\b(\d+)\s*(?:x\s*)?HDMI\b/i,
    /\bHDMI\s*(?:x\s*)?(\d+)\b/i,
    /\bHDMI\s*port(?:s)?\b/i
  ];
  
  // Check for Thunderbolt ports
  const thunderboltPatterns = [
    /\b(\d+)\s*(?:x\s*)?Thunderbolt\s*(?:3|4)?\b/i,
    /\bThunderbolt\s*(?:3|4)?\s*(?:x\s*)?(\d+)\b/i,
    /\bThunderbolt\s*(?:3|4)?\s*port(?:s)?\b/i
  ];
  
  // Extract USB ports
  for (const pattern of usbPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 10) { // Reasonable number of ports
        ports.USB = (ports.USB || 0) + count;
      }
    } else if (textToSearch.match(/\bUSB\b/i)) {
      // If USB is mentioned but no count, assume at least 1
      ports.USB = (ports.USB || 0) + 1;
    }
  }
  
  // Extract HDMI ports
  for (const pattern of hdmiPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 4) { // Reasonable number of HDMI ports
        ports.HDMI = count;
      }
    } else if (textToSearch.match(/\bHDMI\b/i)) {
      // If HDMI is mentioned but no count, assume 1
      ports.HDMI = 1;
    }
  }
  
  // Extract Thunderbolt ports
  for (const pattern of thunderboltPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 4) { // Reasonable number of Thunderbolt ports
        ports.Thunderbolt = count;
      }
    } else if (textToSearch.match(/\bThunderbolt\b/i)) {
      // If Thunderbolt is mentioned but no count, assume 1
      ports.Thunderbolt = 1;
    }
  }
  
  // Only return if we found any ports
  return Object.keys(ports).length > 0 ? ports : undefined;
};

/**
 * Detects fingerprint reader feature
 */
export const processFingerprint = (title: string, description?: string): boolean | undefined => {
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Check for fingerprint reader mentions
  const fingerprintPatterns = [
    /\b(?:fingerprint|finger\s*print)\s*(?:reader|scanner|sensor)\b/i,
    /\bFP\s*(?:reader|scanner|sensor)\b/i,
    /\bTouch\s*(?:ID|Identity)\b/i
  ];
  
  for (const pattern of fingerprintPatterns) {
    if (textToSearch.match(pattern)) {
      return true;
    }
  }
  
  return undefined;
};
