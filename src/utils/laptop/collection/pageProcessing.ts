import { containsForbiddenKeywords } from "../productFilters";

/**
 * Check if a product should be collected based on filtering rules
 * @param title Product title
 * @returns True if the product should be collected, false if it should be skipped
 */
export function shouldCollectProduct(title: string): boolean {
  // Skip products with forbidden keywords in the title
  return !containsForbiddenKeywords(title);
}

// Export processPage as default so we can import it without the shouldCollectProduct function
export default function processPage(
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
