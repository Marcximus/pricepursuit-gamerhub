
import { insertOrUpdateProducts } from "./databaseService.ts";
import { containsForbiddenKeywords } from "./utils/productFilters.ts";

export async function processProducts(products: any[], brand: string, detailedLogging = false) {
  // Validate input
  if (!products || !Array.isArray(products)) {
    console.error(`Invalid products array for brand ${brand}:`, products);
    return { processed: 0, updated: 0, added: 0, failed: 1 };
  }
  
  console.log(`Processing ${products.length} products for brand ${brand}`);
  
  // Stats to track processing results
  const stats = {
    processed: 0,
    updated: 0,
    added: 0,
    failed: 0
  };

  try {
    // Filter out non-laptop products by checking titles
    const laptopProducts = products.filter(product => {
      const title = (product.title || '').toLowerCase();
      
      // Keywords that indicate the product is likely a laptop
      const laptopKeywords = ['laptop', 'notebook', 'ultrabook', 'chromebook', 'gaming laptop', 'macbook'];
      
      // Keywords that indicate the product is NOT a laptop
      const nonLaptopKeywords = [
        'laptop stand', 'laptop bag', 'laptop sleeve', 'laptop backpack', 'laptop case',
        'laptop mount', 'laptop desk', 'laptop tray', 'laptop battery', 'laptop screen protector',
        'laptop charger', 'laptop cooler', 'laptop cooling pad', 'laptop skin', 'laptop sticker',
        'laptop accessory', 'laptop power adapter', 'laptop cart', 'laptop table', 'laptop riser'
      ];
      
      // Check if the title contains any laptop keywords but none of the non-laptop keywords
      // Also use our more comprehensive forbidden keywords filter
      const isLaptop = 
        laptopKeywords.some(keyword => title.includes(keyword)) && 
        !nonLaptopKeywords.some(keyword => title.includes(keyword)) &&
        !containsForbiddenKeywords(product.title || '');
      
      if (detailedLogging && !isLaptop) {
        console.log(`Filtering out non-laptop: "${title}"`);
      }
      
      return isLaptop;
    });
    
    console.log(`Filtered to ${laptopProducts.length} laptop products out of ${products.length} total products`);

    // Process each laptop product
    const processedProducts = laptopProducts.map(product => {
      try {
        // Basic validation
        if (!product.asin) {
          if (detailedLogging) console.log('Skipping product with no ASIN');
          stats.failed++;
          return null;
        }

        // Extract and normalize product data
        return {
          asin: product.asin,
          title: product.title || '',
          description: product.description || '',
          current_price: extractPrice(product.price_information),
          original_price: extractOriginalPrice(product.price_information),
          rating: product.rating?.value || null,
          rating_count: product.rating?.count || null,
          image_url: product.image || '',
          product_url: product.url || '',
          category: product.category || '',
          brand: brand, // Use the brand passed as argument
          is_laptop: true // Mark as laptop
        };
      } catch (err) {
        console.error(`Error processing product: ${err.message}`, err);
        stats.failed++;
        return null;
      }
    }).filter(Boolean); // Remove null entries

    stats.processed = processedProducts.length;
    
    if (detailedLogging) {
      console.log(`Prepared ${processedProducts.length} product objects for database insertion/update`);
    }

    // Insert or update products in the database
    if (processedProducts.length > 0) {
      const results = await insertOrUpdateProducts(processedProducts, detailedLogging);
      
      stats.updated = results.updated;
      stats.added = results.added;
      stats.failed += results.failed;
      
      console.log(`Database results for ${brand}: ${results.added} added, ${results.updated} updated, ${results.failed} failed`);
    } else {
      console.log(`No valid laptop products found for ${brand}`);
    }

    return stats;
  } catch (error) {
    console.error(`Error in processProducts for ${brand}:`, error);
    return {
      processed: stats.processed,
      updated: stats.updated,
      added: stats.added,
      failed: stats.failed + 1 // Increment failed count
    };
  }
}

function extractPrice(priceInfo: any): number | null {
  try {
    if (!priceInfo) return null;
    
    // Try to get the current price
    if (priceInfo.current_price) {
      // Remove currency symbol and convert to number
      const priceStr = String(priceInfo.current_price).replace(/[^0-9.]/g, '');
      return Number(priceStr) || null;
    }
    
    return null;
  } catch (e) {
    console.error('Error extracting price:', e);
    return null;
  }
}

function extractOriginalPrice(priceInfo: any): number | null {
  try {
    if (!priceInfo || !priceInfo.previous_price) return null;
    
    // Remove currency symbol and convert to number
    const priceStr = String(priceInfo.previous_price).replace(/[^0-9.]/g, '');
    return Number(priceStr) || null;
  } catch (e) {
    console.error('Error extracting original price:', e);
    return null;
  }
}
