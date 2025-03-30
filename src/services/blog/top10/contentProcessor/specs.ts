
/**
 * Product specifications extraction utilities for Top10 blog posts
 */

/**
 * Extract product specifications from DeepSeek response
 */
export function extractProductSpecs(content: string): any[] {
  if (!content) return [];
  
  try {
    // First try to find the products array in the structured JSON format
    const productsMatch = content.match(/"products"\s*:\s*(\[\s*\{[\s\S]*?\}\s*\])/);
    
    if (productsMatch && productsMatch[1]) {
      // Clean up the matched JSON string
      const productsJson = productsMatch[1]
        .replace(/\/\/.*$/gm, '') // Remove comments
        .replace(/,\s*\]/g, ']') // Remove trailing commas
        .replace(/\\+"/g, '"'); // Handle escaped quotes
      
      try {
        // Parse the JSON
        const products = JSON.parse(`${productsJson}`);
        console.log(`✅ Successfully extracted specifications for ${products.length} products from JSON`);
        
        // Log the first product for debugging
        if (products.length > 0) {
          console.log('First product spec sample:', JSON.stringify(products[0]).substring(0, 200));
        }
        
        return products;
      } catch (jsonError) {
        console.warn('⚠️ Error parsing products JSON:', jsonError);
        
        // Try with a more lenient approach - this is a fallback
        try {
          // Extract the array content more carefully
          const cleanedJson = productsJson
            .replace(/\\n/g, '')
            .replace(/\\"/g, '"')
            .replace(/"\s*\+\s*"/g, '') // Handle string concatenation
            .replace(/,\s*}/g, '}'); // Remove trailing commas in objects
          
          console.log('Attempting to parse cleaned JSON:', cleanedJson.substring(0, 200));
          const products = JSON.parse(`${cleanedJson}`);
          console.log(`✅ Fallback: Extracted specifications for ${products.length} products`);
          return products;
        } catch (fallbackError) {
          console.warn('⚠️ Fallback extraction also failed:', fallbackError);
        }
      }
    }
    
    // If we still don't have products, look for plain text patterns
    console.log('🔍 Searching for product specifications in plain text format...');
    
    // Look for products specified with position and specs
    const positionMatches = [...content.matchAll(/position["\s]*:[\s"]*(\d+)["\s]*,[\s\S]*?cpu["\s]*:[\s"]*([^"]*)["\s]*,[\s\S]*?ram["\s]*:[\s"]*([^"]*)["\s]*,[\s\S]*?graphics["\s]*:[\s"]*([^"]*)["\s]*,[\s\S]*?storage["\s]*:[\s"]*([^"]*)["\s]*,[\s\S]*?screen["\s]*:[\s"]*([^"]*)["\s]*,[\s\S]*?battery["\s]*:[\s"]*([^"]*)["\s]*/gi)];
    
    if (positionMatches.length > 0) {
      const products = positionMatches.map(match => ({
        position: parseInt(match[1], 10),
        cpu: match[2].trim(),
        ram: match[3].trim(),
        graphics: match[4].trim(),
        storage: match[5].trim(),
        screen: match[6].trim(),
        battery: match[7].trim()
      }));
      
      console.log(`✅ Alternative method: Extracted specifications for ${products.length} products from text patterns`);
      return products.sort((a, b) => a.position - b.position); // Ensure correct order
    }
    
    console.warn('⚠️ No product specifications found in content');
    return [];
  } catch (e) {
    console.error('💥 Error extracting product specifications:', e);
    return [];
  }
}
