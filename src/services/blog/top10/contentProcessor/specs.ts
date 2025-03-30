
/**
 * Product specifications extraction utilities for Top10 blog posts
 */

/**
 * Extract product specifications from DeepSeek response
 */
export function extractProductSpecs(content: string): any[] {
  if (!content) return [];
  
  try {
    // Check for JSON structure with products array first
    const jsonMatch = content.match(/\"products\"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
    
    if (jsonMatch && jsonMatch[1]) {
      // Clean up the JSON string
      const productsJson = jsonMatch[1]
        .replace(/\/\/.*$/gm, '') // Remove comments
        .replace(/,\s*\]/g, ']') // Remove trailing commas
        .replace(/\\+"/g, '"') // Handle escaped quotes
        .replace(/\n/g, '') // Remove newlines
        .replace(/\r/g, ''); // Remove carriage returns
      
      try {
        // Parse the JSON with proper wrapping
        const products = JSON.parse(`${productsJson}`);
        console.log(`✅ Successfully extracted specifications for ${products.length} products from JSON`);
        
        // Log the first product for debugging
        if (products.length > 0) {
          console.log('First product spec sample:', JSON.stringify(products[0]).substring(0, 200));
        }
        
        return products;
      } catch (jsonError) {
        console.warn('⚠️ Error parsing products JSON:', jsonError);
        
        // Try a more flexible approach - sometimes the JSON isn't perfectly formatted
        try {
          // Extract each product object separately and parse them
          const productMatches = productsJson.match(/\{\s*"position"\s*:\s*\d+[\s\S]*?\}/g);
          
          if (productMatches && productMatches.length > 0) {
            console.log(`🔍 Found ${productMatches.length} individual product objects`);
            
            const products = productMatches.map(productStr => {
              try {
                // Clean up the product string
                const cleanProductStr = productStr
                  .replace(/\\n/g, '')
                  .replace(/\\"/g, '"')
                  .replace(/"\s*\+\s*"/g, '') // Handle string concatenation
                  .replace(/,\s*}/g, '}'); // Remove trailing commas
                
                return JSON.parse(`${cleanProductStr}`);
              } catch (e) {
                console.warn('⚠️ Failed to parse individual product:', e);
                return null;
              }
            }).filter(Boolean);
            
            console.log(`✅ Parsed ${products.length} products using individual extraction`);
            return products;
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback extraction also failed:', fallbackError);
        }
      }
    }
    
    // If we still don't have products, as a last resort, search for raw text patterns
    console.log('🔍 Searching for product specifications in plain text format...');
    
    // Try to match based on position and specs pattern
    const productsTextPattern = /\"position\"\s*:\s*(\d+)[^}]*\"cpu\"\s*:\s*\"([^\"]*)\"\s*,[^}]*\"ram\"\s*:\s*\"([^\"]*)\"\s*,[^}]*\"graphics\"\s*:\s*\"([^\"]*)\"\s*,[^}]*\"storage\"\s*:\s*\"([^\"]*)\"\s*,[^}]*\"screen\"\s*:\s*\"([^\"]*)\"\s*,[^}]*\"battery\"\s*:\s*\"([^\"]*)\"/g;
    
    const products = [];
    let match;
    
    while ((match = productsTextPattern.exec(content)) !== null) {
      products.push({
        position: parseInt(match[1], 10),
        cpu: match[2].trim(),
        ram: match[3].trim(),
        graphics: match[4].trim(),
        storage: match[5].trim(),
        screen: match[6].trim(),
        battery: match[7].trim()
      });
    }
    
    if (products.length > 0) {
      console.log(`✅ Extracted ${products.length} products using regex pattern matching`);
      // Sort products by position to ensure correct order
      return products.sort((a, b) => a.position - b.position);
    }
    
    console.warn('⚠️ No product specifications found in content');
    return [];
  } catch (e) {
    console.error('💥 Error extracting product specifications:', e);
    return [];
  }
}
