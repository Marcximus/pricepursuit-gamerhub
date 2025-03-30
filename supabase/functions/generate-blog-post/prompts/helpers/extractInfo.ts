
/**
 * Helper functions to extract computer specifications from title string
 */

export function extractInfoFromTitle(title: string, type: 'processor' | 'ram' | 'graphics' | 'storage' | 'screen'): string | null {
  if (!title) return null;
  
  switch (type) {
    case 'processor':
      // Extract processor information (Intel Core i7, AMD Ryzen, etc.)
      const processorMatch = title.match(/(?:Intel\s+Core\s+i[3579][0-9-]*|AMD\s+Ryzen\s+[3579][0-9]*|Apple\s+M[123]\s+(?:Pro|Max|Ultra)?)/i);
      return processorMatch ? processorMatch[0] : null;
      
    case 'ram':
      // Extract RAM information (8GB, 16GB, etc.)
      const ramMatch = title.match(/(\d+)\s*GB\s*(?:DDR[45])?(?:\s*RAM)?/i);
      return ramMatch ? `${ramMatch[1]}GB RAM` : null;
      
    case 'graphics':
      // Extract graphics card information (RTX 3050, etc.)
      const graphicsMatch = title.match(/(?:NVIDIA|GeForce)\s+(?:RTX|GTX)\s+\d{4}(?:\s*Ti)?/i) ||
                           title.match(/Intel\s+(?:UHD|Iris\s+Xe)\s+Graphics/i) ||
                           title.match(/AMD\s+Radeon(?:\s+\w+\s+\d+)?/i);
      return graphicsMatch ? graphicsMatch[0] : null;
      
    case 'storage':
      // Extract storage information (512GB SSD, etc.)
      const storageMatch = title.match(/(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|NVMe)/i);
      return storageMatch ? storageMatch[0] : null;
      
    case 'screen':
      // Extract screen size information (15.6", etc.)
      const screenMatch = title.match(/(\d+\.?\d*)[\s-]?(?:inch|"|inches)?(?:\s*(?:FHD|QHD|UHD|HD))?/i);
      return screenMatch ? `${screenMatch[1]}" Display` : null;
      
    default:
      return null;
  }
}

/**
 * Extract brand from product title if not explicitly provided
 */
export function extractBrandFromTitle(title: string): string {
  if (!title) return 'Unknown';
  
  // Common laptop brands to look for in titles
  const commonBrands = [
    'MSI', 'Lenovo', 'HP', 'Dell', 'ASUS', 'Acer', 'Apple', 'Samsung', 
    'Microsoft', 'LG', 'Razer', 'Toshiba', 'Gigabyte', 'Alienware'
  ];
  
  // Check if any brand appears at the start of the title
  for (const brand of commonBrands) {
    if (title.toLowerCase().startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Alternatively, look for brand anywhere in the title
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Default to first word if it's more than 2 characters
  const firstWord = title.split(' ')[0];
  if (firstWord && firstWord.length > 2) {
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }
  
  return 'Unknown Brand';
}
