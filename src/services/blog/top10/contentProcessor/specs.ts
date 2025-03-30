
/**
 * Product specifications extraction utilities for Top10 blog posts
 */

/**
 * Extract product specifications from DeepSeek response
 */
export function extractProductSpecs(content: string): any[] {
  if (!content) return [];
  
  try {
    // Look for the products array in JSON format
    const productsMatch = content.match(/"products"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
    
    if (productsMatch && productsMatch[1]) {
      // Clean up the matched JSON string
      const productsJson = productsMatch[1]
        .replace(/\/\/.*$/gm, '') // Remove comments
        .replace(/,\s*\]/g, ']'); // Remove trailing commas
      
      // Parse the JSON
      try {
        const products = JSON.parse(productsJson);
        console.log(`✅ Successfully extracted specifications for ${products.length} products`);
        return products;
      } catch (jsonError) {
        console.warn('⚠️ Error parsing products JSON:', jsonError);
        // Try with a more lenient approach - this is a fallback
        const fallbackMatch = productsJson.match(/\[\s*\{[\s\S]*?position[\s\S]*?\}\s*\]/);
        if (fallbackMatch) {
          try {
            const products = JSON.parse(fallbackMatch[0]);
            console.log(`✅ Fallback: Extracted specifications for ${products.length} products`);
            return products;
          } catch (fallbackError) {
            console.warn('⚠️ Fallback extraction also failed:', fallbackError);
            return [];
          }
        }
      }
    }
    
    // If no products array was found, look for individual position entries
    const positionMatches = [...content.matchAll(/"position"\s*:\s*(\d+)[\s\S]*?"cpu"\s*:\s*"([^"]*)"[\s\S]*?"ram"\s*:\s*"([^"]*)"[\s\S]*?"graphics"\s*:\s*"([^"]*)"[\s\S]*?"storage"\s*:\s*"([^"]*)"[\s\S]*?"screen"\s*:\s*"([^"]*)"[\s\S]*?"battery"\s*:\s*"([^"]*)"/g)];
    
    if (positionMatches.length > 0) {
      const products = positionMatches.map(match => ({
        position: parseInt(match[1], 10),
        cpu: match[2],
        ram: match[3],
        graphics: match[4],
        storage: match[5],
        screen: match[6],
        battery: match[7]
      }));
      
      console.log(`✅ Alternative method: Extracted specifications for ${products.length} products`);
      return products;
    }
    
    console.warn('⚠️ No product specifications found in content');
    return [];
  } catch (e) {
    console.error('💥 Error extracting product specifications:', e);
    return [];
  }
}
