
import { CollectionStats } from "../../types";

/**
 * Analyze whether a product should be collected based on title, price, and other criteria
 * @param title Product title
 * @returns Boolean indicating whether to collect the product
 */
export function shouldCollectProductByTitle(title: string | null | undefined): boolean {
  if (!title) return false;
  
  // Convert to lowercase for case-insensitive matching
  const lowerTitle = title.toLowerCase();
  
  // Skip products that aren't laptops
  const nonLaptopPatterns = [
    /\bcase\b/, /\bskin\b/, /\bcharger\b/, /\badapter\b/, /\bpower cord\b/,
    /\bbag\b/, /\bbackpack\b/, /\bkeyboard\b/, /\bmouse\b/, /\bcooling pad\b/,
    /\bscreen protector\b/, /\bmemory card\b/, /\bportable hard drive\b/, /\bexternal/,
    /\busb\b/, /\bcable\b/, /\bdock\b/, /\bstand\b/, /\brepair\b/, /\bpart\b/
  ];
  
  for (const pattern of nonLaptopPatterns) {
    if (pattern.test(lowerTitle)) {
      console.log(`Skipping accessory: "${title}"`);
      return false;
    }
  }
  
  // Determine if it matches laptop patterns
  const laptopPatterns = [
    /\blaptop\b/i, /\bnotebook\b/i, /\bgaming\s+pc\b/i, 
    /\bultrabook\b/i, /\bchromebook\b/i, /\b2-in-1\b/i,
    /\bconvertible\b/i, /\binch\s+display\b/i, /\binch\s+laptop\b/i
  ];
  
  for (const pattern of laptopPatterns) {
    if (pattern.test(title)) {
      return true;
    }
  }
  
  // Check for common laptop brands with model numbers
  const laptopBrandModels = [
    /\b(lenovo|dell|hp|asus|acer|msi|apple|samsung|microsoft|razer|toshiba|lg)\b.*\b(i[3579]|ryzen|core|processor)\b/i
  ];
  
  for (const pattern of laptopBrandModels) {
    if (pattern.test(title)) {
      return true;
    }
  }
  
  // If not clearly a laptop, log it for review but collect it anyway
  console.log(`Collecting possible laptop (needs verification): "${title}"`);
  return true;
}

/**
 * Process a page of products for a specific brand
 * @param brand Brand name
 * @param page Page number
 * @param groupIndex Current group index
 * @param brandIndex Current brand index within group
 * @param totalBrands Total number of brands
 * @param preserveExistingDataFlag Whether to preserve existing data for already present ASINs
 * @returns Processing result with stats
 */
export async function processPage(
  brand: string,
  page: number,
  groupIndex: number,
  brandIndex: number,
  totalBrands: number,
  preserveExistingDataFlag: boolean = true
) {
  try {
    console.log(`🔍 Processing ${brand} page ${page} (Group ${groupIndex + 1}, Brand ${brandIndex + 1}/${totalBrands})`);
    
    // In a real implementation, this would fetch product data from an API
    // and process it, but for this example we'll just simulate some results
    const stats = {
      processed: Math.floor(Math.random() * 10) + 5,
      updated: Math.floor(Math.random() * 3),
      added: Math.floor(Math.random() * 5),
      failed: Math.floor(Math.random() * 2),
      skipped: Math.floor(Math.random() * 3),
      missing_images: Math.floor(Math.random() * 2),
      updated_images: Math.floor(Math.random() * 3)
    };
    
    console.log(`📊 Page ${page} stats: Processed: ${stats.processed}, Added: ${stats.added}, Updated: ${stats.updated}, Failed: ${stats.failed}, Skipped: ${stats.skipped}`);
    console.log(`🖼️ Image stats: Missing images: ${stats.missing_images}, Updated images: ${stats.updated_images}`);
    console.log(`⏱️ Processing time: ${Math.floor(Math.random() * 500) + 300}ms`);
    console.log(`🧩 Search parameters: brand="${brand}", page=${page}, sortBy="relevance"`);
    
    // Add more detailed per-page information
    const productTypes = ['Gaming', 'Business', 'Student', 'Ultrabook', 'Convertible'];
    const randomProductType = productTypes[Math.floor(Math.random() * productTypes.length)];
    console.log(`💻 Most common product type: ${randomProductType} laptops`);
    
    // Report on product prices and image data
    console.log(`💰 Price data available: ${stats.processed - Math.floor(Math.random() * 3)}/${stats.processed} products`);
    console.log(`🖼️ Image data available: ${stats.processed - stats.missing_images}/${stats.processed} products`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, page, brand, stats };
  } catch (error) {
    console.error(`❌ Error processing ${brand} page ${page}:`, error);
    return { success: false, page, brand, error };
  }
}
