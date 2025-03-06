
import { containsForbiddenKeywords } from './productFilters.ts';
import { 
  normalizeProcessor, 
  normalizeRam, 
  normalizeStorage, 
  normalizeGraphics, 
  normalizeScreenSize 
} from './normalizers.ts';

export function createBrandBatches(brands: string[], batchSize: number) {
  const batches = [];
  for (let i = 0; i < brands.length; i += batchSize) {
    batches.push(brands.slice(i, Math.min(i + batchSize, brands.length)));
  }
  return batches;
}

/**
 * Check if a product should be collected based on filtering rules
 * @param title Product title
 * @returns True if the product should be collected, false if it should be skipped
 */
export function shouldCollectProduct(title: string): boolean {
  // Only check title against forbidden keywords, not descriptions or other fields
  return !containsForbiddenKeywords(title);
}

/**
 * Ensure all laptop specifications are properly extracted and normalized
 * before saving to the database
 */
export function normalizeProductSpecs(product: any): any {
  const updatedProduct = { ...product };
  
  // Normalize processor
  if (product.processor) {
    updatedProduct.processor = normalizeProcessor(product.processor);
  }
  
  // Normalize RAM
  if (product.ram) {
    updatedProduct.ram = normalizeRam(product.ram);
  }
  
  // Normalize storage
  if (product.storage) {
    updatedProduct.storage = normalizeStorage(product.storage);
  }
  
  // Normalize graphics
  if (product.graphics) {
    updatedProduct.graphics = normalizeGraphics(product.graphics);
  }
  
  // Normalize screen size
  if (product.screen_size) {
    updatedProduct.screen_size = normalizeScreenSize(product.screen_size);
  }
  
  // Extract specs from title if they're missing
  if (!updatedProduct.processor && product.title) {
    const processedTitle = product.title;
    // Try to extract processor from title using common patterns
    const processorPatterns = [
      /\b(?:Intel Core i[3579]|AMD Ryzen [3579]|Intel Celeron|Apple M[123])\s*(?:[A-Z0-9-]+(?:\s*[A-Z0-9]+)*)\b/i,
      /\b(?:i[3579]-\d{4,5}[A-Z]*|Ryzen\s*\d\s*\d{4}[A-Z]*)\b/i,
    ];
    
    for (const pattern of processorPatterns) {
      const match = processedTitle.match(pattern);
      if (match) {
        updatedProduct.processor = normalizeProcessor(match[0]);
        break;
      }
    }
  }
  
  // Try to extract RAM if missing
  if (!updatedProduct.ram && product.title) {
    const ramPattern = /\b(\d+)\s*GB\s*(?:DDR[45]|LPDDR[45])?\s*(?:RAM|Memory)\b/i;
    const match = product.title.match(ramPattern);
    if (match) {
      updatedProduct.ram = normalizeRam(`${match[1]} GB`);
    }
  }
  
  // Try to extract storage if missing
  if (!updatedProduct.storage && product.title) {
    const storagePattern = /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|Storage)\b/i;
    const match = product.title.match(storagePattern);
    if (match) {
      updatedProduct.storage = normalizeStorage(match[0]);
    }
  }
  
  // Try to extract screen size if missing
  if (!updatedProduct.screen_size && product.title) {
    const screenPattern = /\b(1[0-9](?:\.[0-9])?)"?\s*(?:inch|"|inches|display|screen|laptop)\b/i;
    const match = product.title.match(screenPattern);
    if (match) {
      updatedProduct.screen_size = normalizeScreenSize(`${match[1]}"`);
    }
  }
  
  // Try to extract graphics if missing
  if (!updatedProduct.graphics && product.title) {
    const graphicsPatterns = [
      /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s*\d{3,4}(?:\s*Ti)?\b/i,
      /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*\d{3,4}[A-Z]*\b/i,
      /\b(?:Intel\s+)?(?:UHD|Iris\s+Xe|Iris\s+Plus|HD)\s*Graphics\b/i,
    ];
    
    for (const pattern of graphicsPatterns) {
      const match = product.title.match(pattern);
      if (match) {
        updatedProduct.graphics = normalizeGraphics(match[0]);
        break;
      }
    }
  }
  
  return updatedProduct;
}
