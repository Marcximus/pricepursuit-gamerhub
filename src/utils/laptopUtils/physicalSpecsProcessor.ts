export const processScreenSize = (screenSize: string | undefined, title: string): string | undefined => {
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    return screenSize;
  }
  
  // Look for screen size in the title first (more specific patterns first)
  const screenPatterns = [
    // Match patterns like "15.6-inch FHD", "15.6" HD", "15.6-inch display"
    /\b(\d{2}\.?\d?)"?\s*(?:inch|"|inches)\s*(?:FHD|HD\+?|QHD|UHD|OLED|LED|IPS|touch\s*screen|display|monitor|screen|laptop)\b/i,
    // Match patterns like "15.6-inch", "15.6""
    /\b(\d{2}\.?\d?)"?\s*(?:inch|"|inches)\b/i,
    // Match just the number with inch
    /\b(\d{2}\.?\d?)[-\s]?(?:inch|"|inches)\b/i,
    // Match patterns like "15.6 laptop", "15.6 display"
    /\b(\d{2}\.?\d?)[-\s]?(?:laptop|display|screen)\b/i,
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
