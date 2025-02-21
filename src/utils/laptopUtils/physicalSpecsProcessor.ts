
export const processScreenSize = (screenSize: string | undefined, title: string): string | undefined => {
  if (screenSize && typeof screenSize === 'string' && !screenSize.includes('undefined')) {
    return screenSize;
  }
  
  const screenPattern = /\b([\d.]+)[-"]?\s*(?:inch|"|inches)\b/i;
  const match = title.match(screenPattern);
  if (match) {
    return `${match[1]}"`;
  }
  
  return undefined;
};

export const processWeight = (weight: string | undefined, title: string): string | undefined => {
  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    return weight;
  }
  
  const weightPattern = /\b([\d.]+)\s*(kg|pounds?|lbs?)\b/i;
  const match = title.match(weightPattern);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('lb')) {
      return `${(value * 0.453592).toFixed(2)} kg`;
    }
    return `${value} kg`;
  }
  
  return undefined;
};

export const processBatteryLife = (batteryLife: string | undefined, title: string): string | undefined => {
  if (batteryLife && typeof batteryLife === 'string' && !batteryLife.includes('undefined')) {
    return batteryLife;
  }
  
  const batteryPattern = /\b(?:up to |(\d+)[+]?\s*(?:hour|hr)s?|(\d+)[+]?\s*(?:hour|hr)s? battery)\b/i;
  const match = title.match(batteryPattern);
  if (match) {
    const hours = match[1] || match[2];
    return `${hours} hours`;
  }
  
  return undefined;
};
