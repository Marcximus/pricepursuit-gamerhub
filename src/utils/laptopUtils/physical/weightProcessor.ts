
/**
 * Processes and normalizes weight information with strict validation
 */
export const processWeight = (weight: string | undefined, title: string, description?: string): string | undefined => {
  const validateWeight = (value: number, unit: string): string | undefined => {
    if (unit.includes('lb') || unit.includes('pound')) {
      // Validate pounds (0.5 to 8 pounds is reasonable for laptops)
      if (value >= 0.5 && value <= 8) {
        return `${value} lbs`;
      }
    } else if (unit.includes('kg') || unit.includes('kilo')) {
      // Convert kg to lbs for validation (0.23 to 3.63 kg ≈ 0.5 to 8 lbs)
      if (value >= 0.23 && value <= 3.63) {
        return `${value} kg`;
      }
    } else if (unit.includes('g')) {
      // Convert grams to kg for validation
      const kgValue = value / 1000;
      if (kgValue >= 0.23 && kgValue <= 3.63) {
        return `${kgValue.toFixed(2)} kg`;
      }
    }
    return undefined;
  };

  if (weight && typeof weight === 'string' && !weight.includes('undefined')) {
    const weightMatch = weight.match(/(\d+(?:\.\d+)?)\s*(pounds|pound|lbs|lb|kg|kilograms|kilogram|g|grams|gram)/i);
    if (weightMatch) {
      const value = parseFloat(weightMatch[1]);
      const unit = weightMatch[2].toLowerCase();
      return validateWeight(value, unit);
    }
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
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      const validatedWeight = validateWeight(value, unit);
      if (validatedWeight) {
        return validatedWeight;
      }
    }
  }
  
  return undefined;
};
