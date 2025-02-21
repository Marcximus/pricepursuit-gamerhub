
export const processScreenSize = (screenSize: string | undefined, title: string): string | undefined => {
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    return screenSize;
  }
  
  // Look for screen size in the title first (more specific patterns first)
  const screenPatterns = [
    /\b(\d{2}\.?\d?)"?\s*(?:inch|"|inches)\s+(?:FHD|HD\+?|QHD|UHD|OLED|LED|IPS|touch\s*screen|display|monitor|screen|laptop)\b/i,
    /\b(\d{2}\.?\d?)"?\s*(?:inch|"|inches)\b/i,
    /\b(\d{2}\.?\d?)[-\s]?(?:inch|"|inches)\b/i,
  ];
  
  for (const pattern of screenPatterns) {
    const match = title.match(pattern);
    if (match) {
      return `${match[1]}"`;
    }
  }
  
  return undefined;
};

export const processWeight = (weight: string | undefined, title: string): string | undefined => {
  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    return weight;
  }
  
  // Look for weight in the title (more specific patterns first)
  const weightPatterns = [
    /\b([\d.]+)\s*(?:kg|kilograms?)\b/i,
    /\b([\d.]+)\s*(?:pounds?|lbs?)\b/i,
  ];
  
  for (const pattern of weightPatterns) {
    const match = title.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      if (pattern.source.includes('pound|lb')) {
        // Convert pounds to kg
        return `${(value * 0.453592).toFixed(2)} kg`;
      }
      return `${value} kg`;
    }
  }
  
  return undefined;
};

export const processBatteryLife = (batteryLife: string | undefined, title: string): string | undefined => {
  if (batteryLife && typeof batteryLife === 'string' && !batteryLife.includes('undefined')) {
    return batteryLife;
  }
  
  // Look for battery life in the title (more specific patterns first)
  const batteryPatterns = [
    /\b(?:up to |(\d+)[+]?\s*(?:hour|hr)s?\s*(?:battery\s*life|battery|run\s*time))\b/i,
    /\b(?:battery\s*life\s*(?:up\s*to\s*)?(\d+)[+]?\s*(?:hour|hr)s?)\b/i,
    /\b(\d+)[+]?\s*(?:hour|hr)s?\s*(?:of\s*)?(?:battery|power)\b/i,
  ];
  
  for (const pattern of batteryPatterns) {
    const match = title.match(pattern);
    if (match) {
      const hours = match[1];
      return `${hours} hours`;
    }
  }
  
  return undefined;
};

