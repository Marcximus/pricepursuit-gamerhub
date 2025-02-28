
import { CollectionStats } from "../../types";

/**
 * Log product update details with enhanced specification extraction information
 * @param product Product being updated
 * @param isNew Whether this is a new product or an update
 * @param extracted Optional information about extracted data
 */
export function logProductDetails(product: any, isNew: boolean, extracted?: any) {
  const operation = isNew ? 'Added' : 'Updated';
  const emoji = isNew ? '🆕' : '🔄';
  
  console.log(`${emoji} ${operation} product: ASIN=${product.asin}`);
  console.log(`  📝 Title: ${product.title?.substring(0, 100)}${product.title?.length > 100 ? '...' : ''}`);
  
  // Calculate completion percentage of specs extracted
  const specFields = ['brand', 'model', 'processor', 'ram', 'storage', 'graphics', 'screen_size', 'screen_resolution', 'image_url'];
  const availableSpecs = specFields.filter(field => product[field] && product[field].toString().trim() !== '').length;
  const specCompletionPercent = Math.round((availableSpecs / specFields.length) * 100);
  
  // Add emoji based on completion percentage
  let completionEmoji = '🔴';
  if (specCompletionPercent >= 75) completionEmoji = '🟢';
  else if (specCompletionPercent >= 50) completionEmoji = '🟡';
  else if (specCompletionPercent >= 25) completionEmoji = '🟠';
  
  console.log(`  ${completionEmoji} Specs completion: ${specCompletionPercent}% (${availableSpecs}/${specFields.length} fields)`);
  
  if (product.brand) console.log(`  🏷️ Brand: ${product.brand}`);
  if (product.model) console.log(`  📱 Model: ${product.model}`);
  if (product.current_price) console.log(`  💰 Price: $${product.current_price}`);
  if (product.processor) {
    console.log(`  🧠 Processor: ${product.processor}`);
  } else {
    console.log(`  ❌ Processor: Not extracted from title "${product.title}"`);
  }
  if (product.ram) {
    console.log(`  🧮 RAM: ${product.ram}`);
  } else {
    console.log(`  ❌ RAM: Not extracted from title "${product.title}"`);
  } 
  if (product.storage) {
    console.log(`  💾 Storage: ${product.storage}`);
  } else {
    console.log(`  ❌ Storage: Not extracted from title "${product.title}"`);
  }
  if (product.graphics) {
    console.log(`  🎮 Graphics: ${product.graphics}`);
  } else {
    console.log(`  ❌ Graphics: Not extracted from title "${product.title}"`);
  }
  if (product.screen_size) {
    console.log(`  📱 Screen: ${product.screen_size}`);
  } else {
    console.log(`  ❌ Screen size: Not extracted from title "${product.title}"`);
  }
  if (product.screen_resolution) {
    console.log(`  🖥️ Resolution: ${product.screen_resolution}`);
  }
  if (product.image_url) {
    console.log(`  🖼️ Image URL: ${product.image_url.substring(0, 60)}...`);
  } else {
    console.log(`  ❌ Image URL: Not available`);
  }
  if (product.rating && product.rating_count) console.log(`  ⭐ Rating: ${product.rating}/5 (${product.rating_count} reviews)`);
  
  // Enhanced price analysis
  if (product.current_price && product.original_price) {
    const discount = Math.round(((product.original_price - product.current_price) / product.original_price) * 100);
    if (discount > 0) {
      console.log(`  🏷️ Discount: ${discount}% off original price of $${product.original_price}`);
    }
  }
  
  // If we have extraction data, show attempts vs success
  if (extracted) {
    console.log(`  📊 Extraction details:`);
    Object.entries(extracted).forEach(([key, value]) => {
      const success = value !== null && value !== undefined && value !== '';
      console.log(`    ${success ? '✅' : '❌'} ${key}: ${success ? value : 'Failed to extract'}`);
    });
  }
  
  console.log(`  ⏱️ Processed at: ${new Date().toLocaleTimeString()}`);
  
  // Add separator line for better readability
  console.log(`  -----------------------------------------------`);
}
