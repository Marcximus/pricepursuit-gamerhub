
/**
 * Processes and normalizes weight information
 */
export const processWeight = (weight: string | undefined, title: string, description?: string): string | undefined => {
  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    return weight.trim();
  }
  
  // Combine title and description for better extraction chances if description is provided
  const textToSearch = description ? `${title} ${description}` : title;
  
  // Look for weight in the text using common weight patterns
  const weightPatterns = [
    // Match weight with pounds/lbs
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(pounds|pound|lbs|lb)\b/i,
    
    // Match weight with kilograms/kg
    /\b(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(kg|kilograms|kilogram)\b/i,
    
    // Match weight with grams
    /\b(\d{3,4})(?:\s*|-)(g|grams|gram)\b/i,
    
    // Match weight with "weighs" verb
    /\bweighs\s+(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i,
    
    // Match weight mentioned with "weight"
    /\bweight:?\s*(\d{1,2}(?:\.\d{1,2})?)(?:\s*|-)(pounds|pound|lbs|lb|kg|kilograms|kilogram)\b/i,
  ];
  
  for (const pattern of weightPatterns) {
    const match = textToSearch.match(pattern);
    if (match && match[1] && match[2]) {
      const weightValue = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.includes('lb') || unit.includes('pound')) {
        // Validate that this looks like a realistic weight for a laptop
        if (weightValue > 0.5 && weightValue < 12) {
          return `${weightValue} lbs`;
        }
      } else if (unit.includes('kg') || unit.includes('kilo')) {
        // Convert kg to lbs for standardization if needed
        if (weightValue > 0.2 && weightValue < 5) {
          return `${weightValue} kg`;
        }
      } else if (unit.includes('g')) {
        // Convert grams to kg for standardization
        const kgValue = weightValue / 1000;
        if (kgValue > 0.2 && kgValue < 5) {
          return `${kgValue.toFixed(2)} kg`;
        }
      }
    }
  }
  
  return undefined;
};
