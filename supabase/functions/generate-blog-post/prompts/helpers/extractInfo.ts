
/**
 * Helper functions to extract information from product titles and data
 */

/**
 * Extract brand information from a product title
 * @param title The product title
 * @returns The extracted brand name or undefined
 */
export function extractBrandFromTitle(title: string | undefined): string | undefined {
  if (!title) return undefined;
  
  // Common laptop brands
  const commonBrands = [
    'Lenovo', 'Dell', 'HP', 'Asus', 'Acer', 'MSI', 'Apple', 'Microsoft',
    'Samsung', 'Razer', 'Toshiba', 'LG', 'Gigabyte', 'Huawei', 'Alienware'
  ];
  
  // Check if any of the common brands appear in the title
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return undefined;
}

/**
 * Extract specific product information from a title based on the specified type
 * @param title The product title
 * @param infoType The type of information to extract (processor, ram, graphics, storage, screen)
 * @returns The extracted information or undefined
 */
export function extractInfoFromTitle(title: string | undefined, infoType: 'processor' | 'ram' | 'graphics' | 'storage' | 'screen'): string | undefined {
  if (!title) return undefined;
  
  // Convert title to lowercase for easier matching
  const lowerTitle = title.toLowerCase();
  
  switch (infoType) {
    case 'processor':
      // Check for common processor patterns
      const cpuPatterns = [
        /intel\s+core\s+i[3579]-\d{4,5}[A-Z]?/i,
        /intel\s+core\s+i[3579]\s+\d{4,5}[A-Z]?/i,
        /amd\s+ryzen\s+\d\s+\d{4}[A-Z]?/i,
        /snapdragon\s+\w+/i,
        /apple\s+m\d+/i
      ];
      
      for (const pattern of cpuPatterns) {
        const match = lowerTitle.match(pattern);
        if (match) return match[0];
      }
      break;
      
    case 'ram':
      // Check for RAM patterns (e.g., 8GB, 16 GB, etc.)
      const ramPattern = /(\d+)\s*gb\s*(ddr\d)?/i;
      const ramMatch = lowerTitle.match(ramPattern);
      if (ramMatch) return `${ramMatch[1]}GB${ramMatch[2] ? ' ' + ramMatch[2].toUpperCase() : ''}`;
      break;
      
    case 'graphics':
      // Check for common graphics card patterns
      const gpuPatterns = [
        /nvidia\s+rtx\s+\d{4}/i,
        /nvidia\s+gtx\s+\d{3,4}/i,
        /amd\s+radeon\s+\w+\s+\d{3,4}/i,
        /intel\s+iris\s+\w+/i,
        /intel\s+uhd/i
      ];
      
      for (const pattern of gpuPatterns) {
        const match = lowerTitle.match(pattern);
        if (match) return match[0];
      }
      break;
      
    case 'storage':
      // Check for storage patterns (e.g., 512GB SSD, 1TB, etc.)
      const storagePatterns = [
        /(\d+)\s*tb\s*(ssd|hdd)?/i,
        /(\d+)\s*gb\s*(ssd|hdd)?/i
      ];
      
      for (const pattern of storagePatterns) {
        const match = lowerTitle.match(pattern);
        if (match) {
          return `${match[1]}${match[1] === '1' ? 'TB' : 'GB'} ${match[2] ? match[2].toUpperCase() : 'Storage'}`;
        }
      }
      break;
      
    case 'screen':
      // Check for screen size patterns (e.g., 15.6", 13-inch, etc.)
      const screenPatterns = [
        /(\d+[\.,]?\d?)\s*['"]?\s*inch/i,
        /(\d+[\.,]?\d?)\s*['"]?\s*display/i,
        /(\d+[\.,]?\d?)\s*['"]?\s*screen/i,
        /(\d+[\.,]?\d?)\s*['"]?\s*monitor/i
      ];
      
      for (const pattern of screenPatterns) {
        const match = lowerTitle.match(pattern);
        if (match) return `${match[1]}" Display`;
      }
      break;
  }
  
  return undefined;
}
