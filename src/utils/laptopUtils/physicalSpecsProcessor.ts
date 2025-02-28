
/**
 * Process and extract screen size information from laptop text
 */
export const processScreenSize = (screenSize: string | undefined, title: string, description?: string): string | undefined => {
  if (screenSize && typeof screenSize === 'string' && screenSize.length > 0) {
    return screenSize;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for screen size patterns
  const screenSizePatterns = [
    // Match patterns like "15.6 inch", "15.6-inch", "15.6\"", etc.
    /\b(\d{1,2}(?:\.\d)?)\s*(?:inch|in|"|''|inches)\b/i,
    /\b(\d{1,2}(?:\.\d)?)-inch\b/i,
    /\b(\d{1,2}(?:\.\d)?)\s*in(?:ch)?\b/i,
    /\b(\d{1,2}(?:\.\d)?)"\b/i,
    
    // Match screen size in description patterns
    /\bScreen(?:\s*Size)?:?\s*(\d{1,2}(?:\.\d)?)\s*(?:inch|in|"|''|inches)\b/i,
    /\bDisplay(?:\s*Size)?:?\s*(\d{1,2}(?:\.\d)?)\s*(?:inch|in|"|''|inches)\b/i
  ];
  
  for (const pattern of screenSizePatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const size = parseFloat(match[1]);
      
      // Validate the size is a reasonable laptop screen size (10" to 18")
      if (size >= 10 && size <= 18) {
        return `${size}"`;
      }
    }
  }
  
  // Check for common screen sizes in brand-specific models
  const macbookMatch = textToSearch.match(/\bMacBook\s+(?:Air|Pro)\s+(\d{1,2}(?:\.\d)?)\b/i);
  if (macbookMatch && macbookMatch[1]) {
    const size = parseFloat(macbookMatch[1]);
    if (size >= 10 && size <= 18) {
      return `${size}"`;
    }
  }
  
  return undefined;
};

/**
 * Process and extract laptop weight information
 */
export const processWeight = (weight: string | undefined, title: string, description?: string): string | undefined => {
  if (weight && typeof weight === 'string' && weight.length > 0) {
    return weight;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for weight patterns
  const weightPatterns = [
    // Match weight in pounds
    /\b(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb)\b/i,
    /\b(\d+(?:\.\d+)?)\s*(?:kg|kilograms|kilogram)\b/i,
    /\bweight:?\s*(\d+(?:\.\d+)?)\s*(?:lbs|lb|kg)\b/i,
    
    // Match specific weight statements
    /\bWeighs\s*(?:only|just)?\s*(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i,
    /\bUltra\s*(?:light|lightweight)(?:\s*at)?\s*(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i
  ];
  
  for (const pattern of weightPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const weightValue = parseFloat(match[1]);
      
      // Check if the weight is in a reasonable range for laptops
      // For pounds: typically 2-8 pounds
      // For kg: typically 1-4 kg
      if (match[0].toLowerCase().includes('kg') || match[0].toLowerCase().includes('kilogram')) {
        if (weightValue >= 0.5 && weightValue <= 4) {
          return `${weightValue} kg`;
        }
      } else {
        if (weightValue >= 1 && weightValue <= 10) {
          return `${weightValue} lbs`;
        }
      }
    }
  }
  
  // Special case for ultralight laptops that might be mentioned differently
  if (textToSearch.match(/\bultrabook\b/i) || 
      textToSearch.match(/\bultra\s*light\b/i) || 
      textToSearch.match(/\bsuper\s*thin\b/i)) {
    // Assume a reasonable lightweight value if laptop is described as ultralight but no specific weight is given
    return '3.0 lbs';
  }
  
  return undefined;
};

/**
 * Process and extract battery life information
 */
export const processBatteryLife = (batteryLife: string | undefined, title: string, description?: string): string | undefined => {
  if (batteryLife && typeof batteryLife === 'string' && batteryLife.length > 0) {
    return batteryLife;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for battery life patterns
  const batteryPatterns = [
    // Standard patterns for battery life
    /\b(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)(?:\s*battery\s*life)?\b/i,
    /\bbattery\s*life:?\s*(?:up\s*to)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)\b/i,
    /\b(?:up\s*to)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)(?:\s*of)?\s*battery\b/i,
    
    // Additional patterns for battery capacity
    /\b(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)(?:\s*of)?\s*(?:usage|use|runtime)\b/i,
    /\blasts?\s*(?:up\s*to)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)\b/i,
    
    // Match watt-hour (Wh) capacity which could be converted to hours
    /\b(\d+)(?:\s*Wh|\s*WHr)\s*battery\b/i,
    
    // Match "all-day battery" type descriptions
    /\ball[\s-]day\s*battery(?:\s*life)?\b/i
  ];
  
  for (const pattern of batteryPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      if (match[0].toLowerCase().includes('all-day')) {
        // Interpret "all-day battery" as a standard workday (8 hours)
        return '8 hours';
      }
      
      if (match[1]) {
        const hours = parseFloat(match[1]);
        
        // Handle Wh capacity approximately (assuming ~10Wh per hour for typical laptop)
        if (match[0].toLowerCase().includes('wh') || match[0].toLowerCase().includes('whr')) {
          const whCapacity = parseInt(match[1], 10);
          const estimatedHours = Math.round(whCapacity / 10);
          if (estimatedHours >= 2 && estimatedHours <= 24) {
            return `${estimatedHours} hours`;
          }
        }
        
        // Validate the hours is a reasonable battery life
        if (hours >= 2 && hours <= 24) {
          return `${hours} hours`;
        }
      }
    }
  }
  
  // Check for MIL-STD or rugged laptops which typically have good battery life
  if (textToSearch.match(/\bmil[\s-]std\b/i) || 
      textToSearch.match(/\brugged\b/i) || 
      textToSearch.match(/\bmilitary\s*grade\b/i)) {
    // Assume a good battery life for rugged laptops
    return '10 hours';
  }
  
  return undefined;
};

/**
 * Process and extract ports information from laptop text
 */
export const processPorts = (ports: string | undefined, title: string, description?: string): string | undefined => {
  if (ports && typeof ports === 'string' && ports.length > 0) {
    return ports;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Create an array to hold all found ports
  const foundPorts = [];
  
  // Look for USB ports (A, C, 3.0, 3.1, 3.2, 2.0, etc.)
  const usbPatterns = [
    /(\d+)\s*(?:x\s*)?USB(?:[\s-]*Type[\s-])?C/i,
    /(\d+)\s*(?:x\s*)?USB(?:[\s-]*Type[\s-])?A/i,
    /(\d+)\s*(?:x\s*)?USB[\s-]*3(?:\.(?:0|1|2))?/i,
    /(\d+)\s*(?:x\s*)?USB[\s-]*2(?:\.0)?/i,
    /USB(?:[\s-]*Type[\s-])?C\s*(?:x\s*)?(\d+)/i,
    /USB(?:[\s-]*Type[\s-])?A\s*(?:x\s*)?(\d+)/i,
    /USB[\s-]*3(?:\.(?:0|1|2))?\s*(?:x\s*)?(\d+)/i,
    /USB[\s-]*2(?:\.0)?\s*(?:x\s*)?(\d+)/i
  ];
  
  for (const pattern of usbPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0 && count <= 10) {
        if (match[0].toLowerCase().includes('type-c') || match[0].toLowerCase().includes('typec') || match[0].toLowerCase().includes('type c')) {
          foundPorts.push(`${count} USB-C`);
        } else if (match[0].toLowerCase().includes('3.2')) {
          foundPorts.push(`${count} USB 3.2`);
        } else if (match[0].toLowerCase().includes('3.1')) {
          foundPorts.push(`${count} USB 3.1`);
        } else if (match[0].toLowerCase().includes('3.0') || match[0].toLowerCase().includes('3')) {
          foundPorts.push(`${count} USB 3.0`);
        } else if (match[0].toLowerCase().includes('2.0') || match[0].toLowerCase().includes('2')) {
          foundPorts.push(`${count} USB 2.0`);
        } else if (match[0].toLowerCase().includes('type-a') || match[0].toLowerCase().includes('typea') || match[0].toLowerCase().includes('type a')) {
          foundPorts.push(`${count} USB-A`);
        } else {
          foundPorts.push(`${count} USB`);
        }
      }
    }
  }
  
  // Look for HDMI ports
  const hdmiMatch = textToSearch.match(/(\d+)\s*(?:x\s*)?HDMI|HDMI\s*(?:x\s*)?(\d+)/i);
  if (hdmiMatch) {
    const count = parseInt(hdmiMatch[1] || hdmiMatch[2], 10) || 1;
    if (count > 0 && count <= 4) {
      foundPorts.push(`${count} HDMI`);
    }
  } else if (textToSearch.toLowerCase().includes('hdmi')) {
    foundPorts.push('1 HDMI');
  }
  
  // Look for Thunderbolt ports
  const thunderboltMatch = textToSearch.match(/(\d+)\s*(?:x\s*)?Thunderbolt[\s-]*(\d)?|Thunderbolt[\s-]*(\d)?\s*(?:x\s*)?(\d+)/i);
  if (thunderboltMatch) {
    const tbVersion = thunderboltMatch[2] || thunderboltMatch[3] || '3';
    const count = parseInt(thunderboltMatch[1] || thunderboltMatch[4], 10) || 1;
    if (count > 0 && count <= 4) {
      foundPorts.push(`${count} Thunderbolt ${tbVersion}`);
    }
  } else if (textToSearch.toLowerCase().includes('thunderbolt')) {
    foundPorts.push('1 Thunderbolt');
  }
  
  // Look for DisplayPort
  if (textToSearch.toLowerCase().includes('displayport') || textToSearch.toLowerCase().includes('display port')) {
    foundPorts.push('DisplayPort');
  }
  
  // Look for SD card reader
  if (textToSearch.toLowerCase().includes('sd card') || 
      textToSearch.toLowerCase().includes('sd-card') || 
      textToSearch.toLowerCase().includes('sdcard') || 
      textToSearch.toLowerCase().includes('card reader')) {
    foundPorts.push('SD Card Reader');
  }
  
  // Look for audio jack
  if (textToSearch.toLowerCase().includes('audio jack') || 
      textToSearch.toLowerCase().includes('headphone') || 
      textToSearch.toLowerCase().includes('3.5mm') || 
      textToSearch.toLowerCase().includes('headset')) {
    foundPorts.push('Audio Jack');
  }
  
  // If we found any ports, join them with commas and return
  if (foundPorts.length > 0) {
    return foundPorts.join(', ');
  }
  
  return undefined;
};

/**
 * Process and extract color information from laptop text
 */
export const processColor = (color: string | undefined, title: string, description?: string): string | undefined => {
  if (color && typeof color === 'string' && color.length > 0) {
    return color;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Common laptop colors
  const colorPatterns = [
    /\b(Silver|Gray|Grey|Black|White|Gold|Blue|Red|Pink|Purple|Green|Bronze|Copper|Rose\s*Gold|Space\s*Gray|Midnight|Starlight)\b/i,
    /\b(Obsidian|Platinum|Arctic|Onyx|Frost|Slate|Carbon|Shadow|Cosmic|Galaxy|Mystic)\s*(Silver|Gray|Grey|Black|Blue)?\b/i,
    /\bAluminum\s*(Silver|Gray|Grey)?\b/i,
    /\bColor:?\s*([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\b/i
  ];
  
  for (const pattern of colorPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      // If we matched a "Color: X" pattern, use X
      if (match[0].toLowerCase().includes('color:') && match[1]) {
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
  
  // Special case for MacBooks which often have distinct colors
  if (textToSearch.toLowerCase().includes('macbook')) {
    if (textToSearch.toLowerCase().includes('space gray') || textToSearch.toLowerCase().includes('spacegray')) {
      return 'Space Gray';
    } else if (textToSearch.toLowerCase().includes('silver')) {
      return 'Silver';
    } else if (textToSearch.toLowerCase().includes('gold')) {
      return 'Gold';
    } else if (textToSearch.toLowerCase().includes('midnight')) {
      return 'Midnight';
    } else if (textToSearch.toLowerCase().includes('starlight')) {
      return 'Starlight';
    }
  }
  
  return undefined;
};

/**
 * Process and extract touchscreen capability
 */
export const processTouchscreen = (touchscreen: string | undefined, title: string, description?: string): boolean | undefined => {
  if (touchscreen && typeof touchscreen === 'string') {
    return touchscreen.toLowerCase() === 'yes' || touchscreen.toLowerCase() === 'true';
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for touchscreen indicators
  const touchPatterns = [
    /\b(?:touchscreen|touch\s*screen|touch\s*display|touch\s*enabled)\b/i,
    /\b(?:touch|touchscreen)(?:-|\s*)(?:enabled|capable|ready)\b/i,
    /\bmulti-touch\b/i,
    /\btouch\s*control\b/i
  ];
  
  for (const pattern of touchPatterns) {
    if (pattern.test(textToSearch)) {
      return true;
    }
  }
  
  // Look for 2-in-1 or convertible laptop indicators which often imply touchscreen
  const convertiblePatterns = [
    /\b2[-\s]in[-\s]1\b/i,
    /\bconvertible\b/i,
    /\b360[\s-]degree\b/i,
    /\bflip\b/i,
    /\bfoldable\b/i,
    /\btablet\s*mode\b/i
  ];
  
  // Count how many convertible patterns match
  let convertibleMatches = 0;
  for (const pattern of convertiblePatterns) {
    if (pattern.test(textToSearch)) {
      convertibleMatches++;
    }
  }
  
  // If at least two convertible patterns match, it's likely a touchscreen
  if (convertibleMatches >= 2) {
    return true;
  }
  
  // Specific models known to be touchscreen
  if (textToSearch.match(/\b(?:Surface|Yoga|Flex|Spectre x360|Envy x360|XPS 2-in-1|Flip)\b/i)) {
    if (textToSearch.match(/\b(?:2-in-1|convertible|360|tablet\s*mode)\b/i)) {
      return true;
    }
  }
  
  // If explicitly mentioned as "non-touch" or similar
  if (textToSearch.match(/\bnon[\s-]touch\b/i) || textToSearch.match(/\bno\s*touch\b/i)) {
    return false;
  }
  
  // If not explicitly mentioned, we can't determine
  return undefined;
};

/**
 * Process and extract backlit keyboard information
 */
export const processBacklitKeyboard = (backlit: string | undefined, title: string, description?: string): boolean | undefined => {
  if (backlit && typeof backlit === 'string') {
    return backlit.toLowerCase() === 'yes' || backlit.toLowerCase() === 'true';
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for backlit keyboard indicators
  const backlitPatterns = [
    /\b(?:backlit|backlight(?:ed)?)\s*(?:keyboard|keys|key\s*board)\b/i,
    /\b(?:keyboard\s*with\s*backlight(?:ing)?)\b/i,
    /\bKB\s*Backlight(?:ed)?\b/i,
    /\bBacklit\s*KB\b/i,
    /\billuminated\s*keyboard\b/i,
    /\bRGB\s*(?:keyboard|keys|key\s*board)\b/i
  ];
  
  for (const pattern of backlitPatterns) {
    if (pattern.test(textToSearch)) {
      return true;
    }
  }
  
  // Look for gaming laptop indicators which often imply backlit keyboards
  if ((textToSearch.toLowerCase().includes('gaming') || 
       textToSearch.toLowerCase().includes('gamer')) && 
      (textToSearch.toLowerCase().includes('rgb') || 
       textToSearch.toLowerCase().includes('led'))) {
    return true;
  }
  
  // Check for premium laptop brands/models that typically include backlit keyboards
  const premiumModels = [
    /\bMacBook\s*(?:Air|Pro)\b/i,
    /\bXPS\b/i,
    /\bSpectre\b/i,
    /\bYoga\b/i,
    /\bThinkPad\s*X1\b/i,
    /\bZenBook\b/i,
    /\bSurface\s*(?:Laptop|Book)\b/i
  ];
  
  for (const pattern of premiumModels) {
    if (pattern.test(textToSearch)) {
      return true;
    }
  }
  
  // If explicitly mentioned as "non-backlit" or similar
  if (textToSearch.match(/\bnon[\s-]backlit\b/i) || textToSearch.match(/\bno\s*backlight\b/i)) {
    return false;
  }
  
  // If not explicitly mentioned, we can't determine
  return undefined;
};

/**
 * Process and extract fingerprint reader information
 */
export const processFingerprint = (fingerprint: string | undefined, title: string, description?: string): boolean | undefined => {
  if (fingerprint && typeof fingerprint === 'string') {
    return fingerprint.toLowerCase() === 'yes' || fingerprint.toLowerCase() === 'true';
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for fingerprint reader indicators
  const fingerprintPatterns = [
    /\b(?:fingerprint|finger\s*print)\s*(?:reader|scanner|sensor)\b/i,
    /\bFP\s*(?:reader|scanner|sensor)\b/i,
    /\bTouch\s*(?:ID|Identity)\b/i,
    /\bfingerprint\s*recognition\b/i,
    /\bbiometric\s*(?:authentication|login|security)\b/i
  ];
  
  for (const pattern of fingerprintPatterns) {
    if (pattern.test(textToSearch)) {
      return true;
    }
  }
  
  // Check for premium business laptops that typically include fingerprint readers
  const businessModels = [
    /\bThinkPad\b/i,
    /\bEliteBook\b/i,
    /\bLatitude\b/i,
    /\bProBook\b/i,
    /\bTravelMate\b/i
  ];
  
  // Also check for security-focused descriptions
  const securityFocused = textToSearch.match(/\bsecurity\s*feature/i) || 
                         textToSearch.match(/\bbusiness\s*security/i) ||
                         textToSearch.match(/\benterprise\s*security/i);
  
  // If it's a business model and mentions security, it likely has a fingerprint reader
  for (const pattern of businessModels) {
    if (pattern.test(textToSearch) && securityFocused) {
      return true;
    }
  }
  
  // If explicitly mentioned as "no fingerprint" or similar
  if (textToSearch.match(/\bno\s*fingerprint\b/i) || textToSearch.match(/\bwithout\s*fingerprint\b/i)) {
    return false;
  }
  
  // If not explicitly mentioned, we can't determine
  return undefined;
};

/**
 * Process and extract camera/webcam information
 */
export const processCamera = (camera: string | undefined, title: string, description?: string): string | undefined => {
  if (camera && typeof camera === 'string' && camera.length > 0) {
    return camera;
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for camera resolution patterns
  const cameraPatterns = [
    /\b(\d+(?:\.\d+)?)\s*(?:MP|megapixel)\s*(?:webcam|camera)\b/i,
    /\b(?:webcam|camera)(?:\s*resolution)?:?\s*(\d+(?:\.\d+)?)\s*(?:MP|megapixel)\b/i,
    /\bHD\s*(?:webcam|camera)\b/i,
    /\bFHD\s*(?:webcam|camera)\b/i,
    /\b720p\s*(?:webcam|camera)\b/i,
    /\b1080p\s*(?:webcam|camera)\b/i,
    /\bwindows\s*hello\s*(?:webcam|camera)\b/i,
    /\bIR\s*(?:webcam|camera)\b/i,
    /\bface\s*recognition\s*(?:webcam|camera)\b/i
  ];
  
  for (const pattern of cameraPatterns) {
    const match = textToSearch.match(pattern);
    if (match) {
      if (match[1]) {
        // If we have a megapixel value
        return `${match[1]} MP`;
      } else if (match[0].toLowerCase().includes('fhd') || match[0].toLowerCase().includes('1080p')) {
        return '1080p HD';
      } else if (match[0].toLowerCase().includes('hd') || match[0].toLowerCase().includes('720p')) {
        return '720p HD';
      } else if (match[0].toLowerCase().includes('ir') || match[0].toLowerCase().includes('windows hello') || match[0].toLowerCase().includes('face recognition')) {
        return 'IR Camera';
      }
    }
  }
  
  // Check if the laptop has any kind of webcam/camera
  if (textToSearch.match(/\b(?:with|includes?|featuring)\s*(?:a|an)?\s*(?:webcam|camera)\b/i) ||
      textToSearch.match(/\b(?:webcam|camera)\s*included\b/i)) {
    return 'Webcam';
  }
  
  // Check for privacy features related to webcams
  if (textToSearch.match(/\b(?:webcam|camera)\s*(?:cover|shutter|privacy)\b/i) ||
      textToSearch.match(/\bprivacy\s*(?:shutter|cover)\b/i)) {
    return 'Webcam with Privacy Shutter';
  }
  
  // If not mentioned but most laptops have webcams, assume a standard one
  if (!textToSearch.match(/\bno\s*(?:webcam|camera)\b/i) && 
      !textToSearch.match(/\bwithout\s*(?:webcam|camera)\b/i)) {
    return 'Webcam';
  }
  
  return undefined;
};
