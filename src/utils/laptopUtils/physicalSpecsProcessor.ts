
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
    /\b(\d{1,2}(?:\.\d)?)\s*(?:inch|in|"|''|inches)\b/i,
    /\b(\d{1,2}(?:\.\d)?)-inch\b/i,
    /\b(\d{1,2}(?:\.\d)?)\s*in(?:ch)?\b/i,
    /\b(\d{1,2}(?:\.\d)?)"\b/i
  ];
  
  for (const pattern of screenSizePatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const size = parseFloat(match[1]);
      
      // Validate the size is a reasonable laptop screen size
      if (size >= 10 && size <= 18) {
        return `${size}"`;
      }
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
    /\b(\d+(?:\.\d+)?)\s*(?:pounds|pound|lbs|lb)\b/i,
    /\b(\d+(?:\.\d+)?)\s*(?:kg|kilograms|kilogram)\b/i,
    /\bweight:?\s*(\d+(?:\.\d+)?)\s*(?:lbs|lb|kg)\b/i
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
    /\b(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)(?:\s*battery\s*life)?\b/i,
    /\bbattery\s*life:?\s*(?:up\s*to)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)\b/i,
    /\b(?:up\s*to)?\s*(\d+(?:\.\d+)?)\s*(?:hour|hr|hours|hrs)(?:\s*of)?\s*battery\b/i
  ];
  
  for (const pattern of batteryPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1]) {
      const hours = parseFloat(match[1]);
      
      // Validate the hours is a reasonable battery life
      if (hours >= 2 && hours <= 24) {
        return `${hours} hours`;
      }
    }
  }
  
  return undefined;
};
