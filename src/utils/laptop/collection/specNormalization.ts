
import { 
  normalizeProcessor, 
  normalizeRam, 
  normalizeStorage, 
  normalizeGraphics, 
  normalizeScreenSize,
  normalizeBrand,
  normalizeModel
} from "../normalizers";
import { findMatchWithPattern } from "./productMatching";

/**
 * Ensure all laptop specifications are properly extracted and normalized
 * before saving to the database
 */
export function normalizeProductSpecs(product: any): any {
  if (!product) return product;
  
  console.log(`Normalizing specs for product: ${product.title?.substring(0, 30) || 'Untitled'}...`);
  const updatedProduct = { ...product };
  const title = product.title || '';
  
  // Normalize brand first since other normalizers might use it
  if (!updatedProduct.brand || updatedProduct.brand === '') {
    updatedProduct.brand = normalizeBrand('', title);
    console.log(`Extracted brand from title: "${updatedProduct.brand}"`);
  } else {
    updatedProduct.brand = normalizeBrand(updatedProduct.brand, title);
    console.log(`Normalized brand: "${updatedProduct.brand}"`);
  }
  
  // Normalize model after brand is available
  if (!updatedProduct.model || updatedProduct.model === '') {
    updatedProduct.model = normalizeModel('', title, updatedProduct.brand);
    if (updatedProduct.model) {
      console.log(`Extracted model from title: "${updatedProduct.model}"`);
    }
  } else {
    updatedProduct.model = normalizeModel(updatedProduct.model, title, updatedProduct.brand);
    console.log(`Normalized model: "${updatedProduct.model}"`);
  }
  
  // Normalize processor
  if (product.processor) {
    updatedProduct.processor = normalizeProcessor(product.processor);
    console.log(`Normalized processor from field: "${updatedProduct.processor}"`);
  }
  
  // Normalize RAM
  if (product.ram) {
    updatedProduct.ram = normalizeRam(product.ram);
    console.log(`Normalized RAM from field: "${updatedProduct.ram}"`);
  }
  
  // Normalize storage
  if (product.storage) {
    updatedProduct.storage = normalizeStorage(product.storage);
    console.log(`Normalized storage from field: "${updatedProduct.storage}"`);
  }
  
  // Normalize graphics
  if (product.graphics) {
    updatedProduct.graphics = normalizeGraphics(product.graphics);
    console.log(`Normalized graphics from field: "${updatedProduct.graphics}"`);
  }
  
  // Normalize screen size
  if (product.screen_size) {
    updatedProduct.screen_size = normalizeScreenSize(product.screen_size);
    console.log(`Normalized screen size from field: "${updatedProduct.screen_size}"`);
  }
  
  // Extract specs from title if they're missing or invalid
  if ((!updatedProduct.processor || updatedProduct.processor === '') && title) {
    // Try to extract processor from title using common patterns
    const processorPatterns = [
      /\b(?:Intel\s+Core\s+i[3579][\-\s][0-9]{4,5}[A-Z]*)/i,
      /\b(?:Intel\s+Core\s+i[3579][\-\s]\d{2}[a-z]{2})/i,
      /\b(?:Intel\s+Core\s+i[3579])\b/i,
      /\b(?:AMD\s+Ryzen\s+[3579][\-\s][0-9]{4,5}[A-Z]*)/i,
      /\b(?:AMD\s+Ryzen\s+[3579])\b/i,
      /\b(?:Intel\s+Celeron\s+[A-Z0-9]+)/i,
      /\b(?:Intel\s+Pentium\s+[A-Z0-9]+)/i,
      /\b(?:Apple\s+M[123](?:\s+(?:Pro|Max|Ultra))?)/i,
      /\b(?:i[3579][\-\s]\d{4,5}[A-Z]*)/i,
      /\b(?:Ryzen\s*\d\s*\d{4}[A-Z]*)/i,
    ];
    
    const processorMatch = findMatchWithPattern(title, processorPatterns);
    if (processorMatch.matched && processorMatch.value) {
      updatedProduct.processor = normalizeProcessor(processorMatch.value);
      console.log(`Extracted processor from title: "${updatedProduct.processor}"`);
    }
  }
  
  // Try to extract RAM if missing or invalid
  if ((!updatedProduct.ram || updatedProduct.ram === '') && title) {
    const ramPatterns = [
      /\b(\d+)\s*GB\s*(?:DDR[45]|LPDDR[45])?\s*(?:RAM|Memory)\b/i,
      /\b(\d+)\s*GB\b(?=.*(?:laptop|notebook))/i,
      /\bRAM\s*:?\s*(\d+)\s*GB\b/i,
      /\bMemory\s*:?\s*(\d+)\s*GB\b/i,
    ];
    
    const ramMatch = findMatchWithPattern(title, ramPatterns);
    if (ramMatch.matched && ramMatch.value) {
      updatedProduct.ram = normalizeRam(ramMatch.value);
      console.log(`Extracted RAM from title: "${updatedProduct.ram}"`);
    }
  }
  
  // Try to extract storage if missing or invalid
  if ((!updatedProduct.storage || updatedProduct.storage === '') && title) {
    const storagePatterns = [
      /\b(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|Storage|PCIe|NVMe)\b/i,
      /\b(?:SSD|HDD|Storage)\s*:?\s*(\d+)\s*(?:GB|TB)\b/i,
      /\b(?:eMMC|PCIe|NVMe)\s*:?\s*(\d+)\s*(?:GB|TB)\b/i,
    ];
    
    const storageMatch = findMatchWithPattern(title, storagePatterns);
    if (storageMatch.matched && storageMatch.value) {
      updatedProduct.storage = normalizeStorage(storageMatch.value);
      console.log(`Extracted storage from title: "${updatedProduct.storage}"`);
    }
  }
  
  // Try to extract screen size if missing or invalid
  if ((!updatedProduct.screen_size || updatedProduct.screen_size === '') && title) {
    const screenPatterns = [
      /\b(1[0-9](?:\.[0-9])?)(?:\s*[-"]|\s+inch|\s*[""]\s*|\s+display|\s+screen)\b/i,
      /\b(1[0-9](?:\.[0-9])?)[""]\b/i,
      /\b(1[0-9](?:\.[0-9])?)\s*in\b/i,
    ];
    
    const screenMatch = findMatchWithPattern(title, screenPatterns);
    if (screenMatch.matched && screenMatch.value) {
      // Extract just the numeric part
      const sizeMatch = screenMatch.value.match(/(\d+\.?\d*)/);
      if (sizeMatch && sizeMatch[1]) {
        updatedProduct.screen_size = normalizeScreenSize(`${sizeMatch[1]}"`);
        console.log(`Extracted screen size from title: "${updatedProduct.screen_size}"`);
      }
    }
  }
  
  // Try to extract graphics if missing or invalid
  if ((!updatedProduct.graphics || updatedProduct.graphics === '') && title) {
    const graphicsPatterns = [
      /\b(?:NVIDIA\s+)?(?:GeForce\s+)?(?:RTX|GTX)\s*\d{3,4}(?:\s*Ti)?\b/i,
      /\b(?:AMD\s+)?Radeon(?:\s+RX)?\s*\d{3,4}[A-Z]*\b/i,
      /\b(?:Intel\s+)?(?:UHD|Iris\s+Xe|Iris\s+Plus|HD)\s*Graphics\b/i,
      /\bApple\s+M[123](?:\s+(?:Pro|Max|Ultra))?\s+GPU\b/i,
    ];
    
    const graphicsMatch = findMatchWithPattern(title, graphicsPatterns);
    if (graphicsMatch.matched && graphicsMatch.value) {
      updatedProduct.graphics = normalizeGraphics(graphicsMatch.value);
      console.log(`Extracted graphics from title: "${updatedProduct.graphics}"`);
    } else if (updatedProduct.processor && (
               updatedProduct.processor.includes('Intel Core') ||
               updatedProduct.processor.includes('Ryzen'))) {
      // If no discrete graphics found but we have a processor,
      // assume integrated graphics based on the processor
      if (updatedProduct.processor.includes('Intel Core')) {
        updatedProduct.graphics = 'Intel Integrated Graphics';
        console.log(`Inferred Intel integrated graphics based on processor`);
      } else if (updatedProduct.processor.includes('Ryzen')) {
        updatedProduct.graphics = 'AMD Radeon Graphics';
        console.log(`Inferred AMD integrated graphics based on processor`);
      }
    }
  }
  
  // Log what specs we have at the end of normalization
  console.log(`Final normalized specs:`, {
    brand: updatedProduct.brand || 'MISSING',
    model: updatedProduct.model || 'MISSING',
    processor: updatedProduct.processor || 'MISSING',
    ram: updatedProduct.ram || 'MISSING',
    storage: updatedProduct.storage || 'MISSING',
    graphics: updatedProduct.graphics || 'MISSING',
    screenSize: updatedProduct.screen_size || 'MISSING'
  });
  
  return updatedProduct;
}
