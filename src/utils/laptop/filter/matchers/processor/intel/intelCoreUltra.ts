
/**
 * Intel Core Ultra series matcher
 */
export function matchesIntelCoreUltra(
  filterValue: string,
  productValue: string | null | undefined,
  productTitle?: string
): boolean {
  const ultraNumber = filterValue.split(' ').pop(); // Get the number (5,7,9)
  
  // Check processor value
  if (productValue) {
    const normalizedProcessor = productValue.toLowerCase();
    
    if (normalizedProcessor.includes('core ultra') || 
        normalizedProcessor.includes('intel ultra') ||
        normalizedProcessor.match(/\d+-core\s+ultra/i)) {
      
      if (ultraNumber && 
          (normalizedProcessor.includes(`ultra ${ultraNumber}`) || 
           normalizedProcessor.includes(`ultra${ultraNumber}`) ||
           normalizedProcessor.match(new RegExp(`\\bultra\\s*${ultraNumber}\\b`, 'i')) ||
           normalizedProcessor.match(new RegExp(`\\bcore\\s*ultra\\s*${ultraNumber}\\b`, 'i')))) {
        return true;
      }
    }
  }
  
  // Check title
  if (productTitle) {
    const normalizedTitle = productTitle.toLowerCase();
    
    if (normalizedTitle.includes('core ultra') || normalizedTitle.includes('-core ultra')) {
      
      if (ultraNumber && 
          (normalizedTitle.includes(`ultra ${ultraNumber}`) || 
           normalizedTitle.includes(`core ultra ${ultraNumber}`))) {
        return true;
      }
    }
  }
  
  return false;
}
