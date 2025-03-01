
/**
 * Intel processor pattern detection
 */

/**
 * Checks if a string matches Intel Core i-series patterns with generation info
 */
export const matchesIntelCoreWithGeneration = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Intel Core i-series with consolidated generation info
  const genPatterns = [
    /\b11th[\s-](?:gen|generation)/i, /\b12th[\s-](?:gen|generation)/i,
    /\b13th[\s-](?:gen|generation)/i, /\b14th[\s-](?:gen|generation)/i,
    /\b8th[\s-](?:gen|generation)/i, /\b9th[\s-](?:gen|generation)/i,
    /\b10th[\s-](?:gen|generation)/i, /\b2nd[\s-](?:gen|generation)/i,
    /\b3rd[\s-](?:gen|generation)/i, /\b4th[\s-](?:gen|generation)/i,
    /\b5th[\s-](?:gen|generation)/i, /\b6th[\s-](?:gen|generation)/i,
    /\b7th[\s-](?:gen|generation)/i
  ];
  
  if (genPatterns.some(pattern => pattern.test(normalizedText)) && 
      normalizedText.match(/i[3579]/i)) {
    return true;
  }
  
  // Check for Intel Core i-series with generation info
  if (normalizedText.match(/\d+th\s+gen|\d+th\s+generation/i) && 
      normalizedText.match(/i[3579]/i)) {
    return true;
  }
  
  // Check for Intel Core i-series with model numbers
  if (normalizedText.match(/i[3579][\s-]\d{4,5}/i)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string matches Intel Core i-series patterns without generation info
 */
export const matchesIntelCoreSeries = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Intel Core i-series patterns
  if (normalizedText.match(/\b(?:core\s*)?i[3579](?:[-\s]\d{4,5}[a-z]*)?/i) ||
      normalizedText.match(/\bcore_i[3579]\b/i)) {
    return true;
  }
  
  // Check for GHz with core_i patterns
  if (normalizedText.match(/\d+(?:\.\d+)?\s*ghz.*core_i[3579]/i) ||
      normalizedText.match(/core_i[3579].*\d+(?:\.\d+)?\s*ghz/i)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string matches Intel Celeron patterns
 */
export const matchesIntelCeleron = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Celeron patterns
  if (normalizedText.match(/\bceleron\s*n\d{4}/i) ||
      normalizedText.match(/\d+(?:\.\d+)?\s*ghz.*celeron/i) ||
      normalizedText.match(/celeron.*\d+(?:\.\d+)?\s*ghz/i)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string matches Intel Pentium patterns
 */
export const matchesIntelPentium = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Pentium patterns
  if (normalizedText.match(/\bpentium\s*\w+/i) ||
      normalizedText.match(/\d+(?:\.\d+)?\s*ghz.*pentium/i) ||
      normalizedText.match(/pentium.*\d+(?:\.\d+)?\s*ghz/i)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string matches Intel Core Ultra patterns
 */
export const matchesIntelCoreUltra = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for Intel Core Ultra patterns
  if (normalizedText.match(/\bultra\s*[579]\b/i) ||
      normalizedText.match(/\b\d+-core\s+ultra\b/i)) {
    return true;
  }
  
  return false;
};

/**
 * Checks if a string contains an explicit Intel processor name
 */
export const containsIntelProcessorName = (text: string): boolean => {
  if (!text) return false;
  
  const normalizedText = text.toLowerCase();
  
  // Check for common Intel processor names
  if (normalizedText.includes('intel core i') || 
      normalizedText.includes('intel core ultra') || 
      normalizedText.includes('intel celeron') || 
      normalizedText.includes('intel pentium')) {
    return true;
  }
  
  return false;
};
