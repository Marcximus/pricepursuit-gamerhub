
export const getRamValue = (ram: string): number => {
  const match = ram.match(/(\d+)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, value, unit] = match;
  const numValue = parseInt(value);
  
  switch (unit.toLowerCase()) {
    case 'tb':
      return numValue * 1024;
    case 'mb':
      return Math.round(numValue / 1024);
    case 'gb':
      return numValue;
    default:
      return 0;
  }
};

export const getStorageValue = (storage: string): number => {
  const match = storage.match(/(\d+)\s*(GB|TB|MB)/i);
  if (!match) return 0;
  
  const [, value, unit] = match;
  const numValue = parseInt(value);
  
  switch (unit.toLowerCase()) {
    case 'tb':
      return numValue * 1024;
    case 'mb':
      return Math.round(numValue / 1024);
    case 'gb':
      return numValue;
    default:
      return 0;
  }
};

export const getScreenSizeValue = (size: string): number => {
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
};
