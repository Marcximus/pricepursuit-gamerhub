
import type { Product } from "@/types/product";
import { normalizeBrand } from "@/utils/laptop/normalizers/brandNormalizer";

/**
 * Creates a user-friendly display title for laptops in comparison view
 */
export const formatLaptopDisplayTitle = (laptop: Product | null): string => {
  if (!laptop) return 'No laptop selected';
  
  // Enhanced brand detection - first try to detect brand from title using the normalizer
  const detectedBrand = normalizeBrand('', laptop.title || '');
  
  // Use detected brand from title if available, otherwise use stored brand
  // This helps correct cases where third-party sellers are incorrectly set as brand
  const brand = (detectedBrand && detectedBrand !== 'Unknown Brand') 
    ? detectedBrand 
    : (laptop.brand || '');
  
  let model = laptop.model || '';
  
  // If model starts with brand, remove the brand to avoid duplication
  if (model.startsWith(brand)) {
    model = model.substring(brand.length).trim();
  }
  
  // Extract key specs for a better title
  const specs: string[] = [];
  
  // Add processor if available
  if (laptop.processor) {
    // Simplify processor name by extracting key parts
    const processorMatch = laptop.processor.match(/(i[3579]-\d{4,5}[A-Z]*|Ryzen\s+[3579]\s+\d{4}[A-Z]*|M[123]\s+(Pro|Max|Ultra)?)/i);
    if (processorMatch) {
      specs.push(processorMatch[0].trim());
    } else {
      // Keep only the first 15 chars if processor is too long
      specs.push(laptop.processor.length > 15 ? 
        laptop.processor.substring(0, 15) + '...' : 
        laptop.processor);
    }
  }
  
  // Add RAM if available
  if (laptop.ram) {
    specs.push(laptop.ram);
  }
  
  // Add screen size if available
  if (laptop.screen_size) {
    specs.push(laptop.screen_size);
  }
  
  // Create the final formatted title
  let displayTitle = brand;
  
  // If model is available and not the same as brand or not just a single character
  if (model && model !== brand && model.length > 1) {
    // If model is very long (like LG models), try to shorten it
    if (model.length > 12 && !model.includes(' ')) {
      // For long model numbers like "LG17Z90NRAAC8U1", display first 8 chars
      displayTitle += ' ' + model.substring(0, 8) + '...';
    } else {
      displayTitle += ' ' + model;
    }
  }
  
  // For Apple products, ensure MacBook appears in the title if not already present
  if (brand === 'Apple' && !displayTitle.includes('MacBook') && laptop.title && laptop.title.includes('MacBook')) {
    const macbookMatch = laptop.title.match(/MacBook\s+(Air|Pro)(\s+\d+(\.\d+)?")?/i);
    if (macbookMatch) {
      displayTitle = 'Apple ' + macbookMatch[0].trim();
    }
  }
  
  // Add key specs if available and the title isn't too long yet
  if (specs.length > 0) {
    displayTitle += ` (${specs.join(', ')})`;
  }
  
  return displayTitle;
};
