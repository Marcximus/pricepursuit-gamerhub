
/**
 * Normalize processor information
 */
export function normalizeProcessor(processor: string): string {
  if (!processor) return '';
  
  // Common patterns
  let normalized = processor.trim()
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    // Standardize Intel Core naming
    .replace(/intel\s+core\s+i(\d)/i, 'Intel Core i$1')
    // Standardize AMD Ryzen naming
    .replace(/amd\s+ryzen\s+(\d)/i, 'AMD Ryzen $1')
    // Remove processor clock speeds
    .replace(/\s+\d+(?:\.\d+)?\s*(?:GHz|MHz)/i, '')
    // Remove processor cache information
    .replace(/\s+\d+\s*MB\s+cache/i, '')
    // Standardize Apple Silicon
    .replace(/apple\s+m(\d)/i, 'Apple M$1');
  
  // Truncate if too long (over 50 chars might be a description, not a model)
  if (normalized.length > 50) {
    normalized = normalized.substring(0, 50);
  }
  
  return normalized;
}

/**
 * Normalize RAM information
 */
export function normalizeRam(ram: string): string {
  if (!ram) return '';
  
  // Extract the number and unit
  const ramPattern = /(\d+)\s*(?:GB|G|MB|M)/i;
  const match = ram.match(ramPattern);
  
  if (match) {
    const amount = parseInt(match[1], 10);
    
    // If ram is in MB, convert to GB
    if (ram.toLowerCase().includes('mb') || ram.toLowerCase().includes('m')) {
      return amount >= 1024 ? `${Math.round(amount / 1024)} GB` : `${amount} MB`;
    }
    
    // Default to GB if unit is missing or unrecognized
    return `${amount} GB`;
  }
  
  // If we can't extract a number pattern, return the original
  return ram.trim();
}

/**
 * Normalize storage information
 */
export function normalizeStorage(storage: string): string {
  if (!storage) return '';
  
  // Extract the number and unit
  const storagePattern = /(\d+)\s*(?:TB|T|GB|G)/i;
  const match = storage.match(storagePattern);
  
  if (match) {
    const amount = parseInt(match[1], 10);
    
    // If unit is TB
    if (storage.toLowerCase().includes('tb') || storage.toLowerCase().includes('t')) {
      return `${amount} TB`;
    }
    
    // If unit is GB or default
    return amount >= 1000 ? `${Math.round(amount / 1000)} TB` : `${amount} GB`;
  }
  
  // Try to detect multiple storage components
  if (storage.toLowerCase().includes('ssd') && storage.toLowerCase().includes('hdd')) {
    // It has both SSD and HDD
    return storage.trim();
  }
  
  // If we can't extract a number pattern, return the original
  return storage.trim();
}

/**
 * Normalize graphics information
 */
export function normalizeGraphics(graphics: string): string {
  if (!graphics) return '';
  
  // Common patterns
  let normalized = graphics.trim()
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    // Standardize NVIDIA GeForce naming
    .replace(/nvidia\s+geforce\s+(rtx|gtx)/i, 'NVIDIA GeForce $1')
    // Standardize AMD Radeon naming
    .replace(/amd\s+radeon(\s+rx)?/i, 'AMD Radeon$1')
    // Standardize Intel Graphics naming
    .replace(/intel\s+(uhd|iris\s+xe|iris\s+plus|hd)\s+graphics/i, 'Intel $1 Graphics');
  
  // Truncate if too long (over 50 chars might be a description, not a model)
  if (normalized.length > 50) {
    normalized = normalized.substring(0, 50);
  }
  
  return normalized;
}

/**
 * Normalize screen size information
 */
export function normalizeScreenSize(screenSize: string): string {
  if (!screenSize) return '';
  
  // Extract the number
  const sizePattern = /(\d+(?:\.\d+)?)/;
  const match = screenSize.match(sizePattern);
  
  if (match) {
    const size = parseFloat(match[1]);
    
    // Format to one decimal place if it has a fractional part
    const formattedSize = size % 1 === 0 ? size.toString() : size.toFixed(1);
    
    // Add the inch symbol if it's missing
    if (!screenSize.includes('"') && !screenSize.toLowerCase().includes('inch')) {
      return `${formattedSize}"`;
    }
    
    // Return with just the number and the inch symbol
    return `${formattedSize}"`;
  }
  
  // If we can't extract a number pattern, return the original
  return screenSize.trim();
}
