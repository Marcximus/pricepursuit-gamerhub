
/**
 * Functions for processing and detecting laptop peripheral features
 */

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
