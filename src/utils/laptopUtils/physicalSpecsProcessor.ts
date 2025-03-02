
/**
 * Functions for processing and normalizing physical specifications
 */

export const processScreenSize = (screenSize: string | undefined, title: string, description?: string): string | undefined => {
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    return screenSize;
  }
  
  // Combine title and description for better extraction chances
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for screen size patterns
  const screenSizePatterns = [
    /\b(\d{1,2}\.?\d*)[\-\s]?inch\b/i,
    /\b(\d{1,2}\.?\d*)[\-\s]?in\b/i,
    /\b(\d{1,2}\.?\d*)"(?:\s*display|\s*screen|\s*ips|\s*laptop)?\b/i,
    /\bscreen\s*size:?\s*(\d{1,2}\.?\d*)\s*(?:inch|in|")\b/i
  ];
  
  for (const pattern of screenSizePatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const size = parseFloat(match[1]);
      // Filter out unrealistic laptop screen sizes
      if (size < 10 || size > 21) {
        continue;
      }
      return `${size}"`;
    }
  }
  
  return undefined;
};

export const processWeight = (weight: string | undefined, title: string, description?: string): string | undefined => {
  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    return weight;
  }
  
  // Combine title and description for better extraction chances
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for weight patterns
  const weightPatterns = [
    /\b(\d+\.?\d*)\s*(?:pounds|pound|lbs|lb)\b/i,
    /\b(\d+\.?\d*)\s*(?:kg|kilograms|kilogram)\b/i,
    /\bweight:?\s*(\d+\.?\d*)\s*(?:pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i
  ];
  
  for (const pattern of weightPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const weightValue = parseFloat(match[1]);
      const unit = textToSearch.substring(match.index! + match[0].indexOf(match[1]) + match[1].length).match(/kg|kilograms|kilogram/i) ? 'kg' : 'lbs';
      
      // Convert kg to pounds for consistency
      if (unit === 'kg') {
        const poundsValue = weightValue * 2.20462;
        return `${poundsValue.toFixed(2)} lbs`;
      }
      
      return `${weightValue} lbs`;
    }
  }
  
  return undefined;
};

export const processBatteryLife = (batteryLife: string | undefined, title: string, description?: string): string | undefined => {
  if (batteryLife && typeof batteryLife === 'string' && !batteryLife.includes('undefined')) {
    return batteryLife;
  }
  
  // Combine title and description for better extraction chances
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for battery life patterns
  const batteryPatterns = [
    /\b(\d+\.?\d*)\s*(?:hours|hour|hrs|hr)(?:\s*battery|\s*battery\s*life)?\b/i,
    /\bbattery(?:\s*life)?:?\s*(?:up\s*to\s*)?(\d+\.?\d*)\s*(?:hours|hour|hrs|hr)\b/i,
    /\bbattery\s*life\s*of\s*(?:up\s*to\s*)?(\d+\.?\d*)\s*(?:hours|hour|hrs|hr)\b/i
  ];
  
  for (const pattern of batteryPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const hours = parseFloat(match[1]);
      if (hours > 0 && hours <= 24) { // Realistic battery life
        return `${hours} hours`;
      }
    }
  }
  
  return undefined;
};

export const processCamera = (camera: string | undefined, title: string, description?: string): string | undefined => {
  if (camera && typeof camera === 'string' && !camera.includes('undefined')) {
    return camera;
  }
  
  // Combine title and description for better extraction chances
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for camera quality patterns
  const cameraPatterns = [
    /\b(?:720p|1080p|HD|FHD|Full\s*HD|QHD|2K|4K)\s*(?:webcam|camera)\b/i,
    /\bwebcam:?\s*(?:720p|1080p|HD|FHD|Full\s*HD|QHD|2K|4K)\b/i,
    /\bcamera:?\s*(?:720p|1080p|HD|FHD|Full\s*HD|QHD|2K|4K)\b/i
  ];
  
  for (const pattern of cameraPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      return match[0].replace(/webcam:|camera:|\s+/gi, ' ').trim();
    }
  }
  
  // Basic webcam detection
  if (textToSearch.match(/\bwebcam\b|\bcamera\b/i)) {
    return 'HD Webcam';
  }
  
  return undefined;
};

// These functions duplicate featureProcessor ones for disambiguation in the main export
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
