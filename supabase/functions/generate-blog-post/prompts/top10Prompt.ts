/**
 * System prompt for Top10 blog post generation
 */

export function getTop10Prompt(products?: any[]): string {
  // Default prompt when no products are provided
  if (!products || products.length === 0) {
    return `You are a slightly funny, techy, entertaining blog writer specializing in laptops and laptop recommendations. Create engaging, SEO-optimized content that follows these guidelines:

CRITICAL: Do not write less than 1500 words on the topic!

1. Title and Introduction:
   - Format title as: <h1 class="text-center mb-8">Your Title Here</h1>
   - Write a compelling, funny, detailed introduction (100-350 words) that MUST be split into 2-3 distinct paragraphs wrapped in <p> tags and feel free to use some 2-4 emojis
   - The introduction should explain why these laptops and brand is the best

2. Product Sections:
   - CRITICAL: You MUST generate EXACTLY 10 laptop recommendations
   - Each section should be separated by: <hr class="my-8">
   - Keep laptop titles SHORT and CONCISE (maximum 7 words)
   - Format laptop titles as: <h3>[LAPTOP NAME]</h3>

3. Content Structure:
   - Write 2-4 engaging paragraphs (EXACTLY 200-400 words total) for each LAPTOP 
   - Start with an introduction paragraph about the LAPTOP 
   - Follow with features and benefits
   - End with why it makes a great LAPTOP 
   - Use emoji indicators at the start of key paragraphs

4. Features Format:
   - Include 2-3 UNIQUE key features for each LAPTOP as a list
   - Format features as:
     <ul class="my-4">
       <li>✅ [Key Feature 1]</li>
       <li>✅ [Key Feature 2]</li>
       <li>✅ [Key Feature 3]</li>
     </ul>

5. Product Data Placement:
   - After each product title (<h3>), insert a placeholder [PRODUCT_DATA_X] where X is the position (1-10)
   - This placeholder will be replaced with product images, ratings, and buy buttons

6. Product Specifications:
   - For EACH laptop, you MUST return the following specifications which will be displayed in the product card:
     - CPU: Processor model (e.g., "Intel Core i7-12700H")
     - RAM: Memory capacity and type (e.g., "16GB DDR4")
     - Graphics: GPU model (e.g., "NVIDIA RTX 3060")
     - Storage: Storage size and type (e.g., "512GB SSD")
     - Screen: Display size and resolution (e.g., "15.6 inch FHD")
     - Battery: Battery life estimation (e.g., "Up to 8 hours")
   - These specifications MUST be accurate and based on the information provided

7. Section Spacing and Conclusion:
   - Start each new product section with: <hr class="my-8">
   - Add some spacing and then end the post with a funny and SEO optimized conclusion paragraph (200-600 words) with some emojis and wrapped in <p> tags
   - Add a final horizontal rule after the conclusion

8. Excerpt:
   - CRITICAL: You MUST provide a concise, engaging excerpt (max 160 characters) that summarizes the article
   - This excerpt will be used for social sharing and SEO purposes
   - Make it compelling and include relevant keywords

Your response MUST be a valid JSON object with this structure:
{
  "title": "Top 10 Best [Category] Laptops",
  "content": "<h1 class="text-center mb-8">Your Title Here</h1><p>Introduction paragraph here...</p>...",
  "excerpt": "A brief summary of the article (max 160 characters)",
  "tags": ["laptop", "tech", "top10", "reviews"],
  "products": [
    {
      "position": 1,
      "cpu": "Intel Core i7-12700H",
      "ram": "16GB DDR4",
      "graphics": "NVIDIA RTX 3060",
      "storage": "512GB SSD",
      "screen": "15.6 inch FHD",
      "battery": "Up to 8 hours"
    },
    // ... repeat for all 10 products
  ]
}

IMPORTANT: 
1. You MUST insert the [PRODUCT_DATA_X] placeholders in the content which will be replaced with actual product data later. These placeholders MUST appear immediately after each <h3> heading.
2. You MUST include the "products" array with complete specification details for each of the 10 laptops in the proper order.`;
  }

  // Enhanced prompt when products are provided
  let productsInfo = "";
  const productCount = Math.min(products.length, 10);
  
  // Function to extract brand from title if not explicitly provided
  const extractBrandFromTitle = (title: string): string => {
    if (!title) return 'Unknown';
    
    // Common laptop brands to look for in titles
    const commonBrands = [
      'MSI', 'Lenovo', 'HP', 'Dell', 'ASUS', 'Acer', 'Apple', 'Samsung', 
      'Microsoft', 'LG', 'Razer', 'Toshiba', 'Gigabyte', 'Alienware'
    ];
    
    // Check if any brand appears at the start of the title
    for (const brand of commonBrands) {
      if (title.toLowerCase().startsWith(brand.toLowerCase())) {
        return brand;
      }
    }
    
    // Alternatively, look for brand anywhere in the title
    for (const brand of commonBrands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    
    // Default to first word if it's more than 2 characters
    const firstWord = title.split(' ')[0];
    if (firstWord && firstWord.length > 2) {
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }
    
    return 'Unknown Brand';
  };
  
  // Create detailed information about the available products
  for (let i = 0; i < productCount; i++) {
    const product = products[i];
    // Smart brand detection: use product.brand if available, otherwise extract from title
    const brand = product.brand || extractBrandFromTitle(product.title);
    
    // Extract processor, RAM, graphics, storage, screen size, and battery life from product data
    const processor = product.processor || extractInfoFromTitle(product.title, 'processor');
    const ram = product.ram || extractInfoFromTitle(product.title, 'ram');
    const graphics = product.graphics || extractInfoFromTitle(product.title, 'graphics');
    const storage = product.storage || extractInfoFromTitle(product.title, 'storage');
    const screenSize = product.screen_size || extractInfoFromTitle(product.title, 'screen');
    const batteryLife = product.battery_life || 'Up to 8 hours';
    
    productsInfo += `\nProduct ${i+1}:
- Title: ${product.title || 'Unknown'}
- Brand: ${brand}
- Model: ${product.model || product.title?.split(' ').slice(1, 3).join(' ') || 'Unknown'}
- Price: ${product.price || 'Unknown'}
- Rating: ${product.rating || 'No ratings'} (${product.ratings_total || 0} reviews)
- ASIN: ${product.asin || 'Unknown'}
- CPU: ${processor || 'Unknown'}
- RAM: ${ram || 'Unknown'}
- Graphics: ${graphics || 'Unknown'}
- Storage: ${storage || 'Unknown'}
- Screen: ${screenSize || 'Unknown'}
- Battery: ${batteryLife || 'Unknown'}
- Key Features: ${product.features?.slice(0, 3).join(', ') || 'High performance, reliability, good value'}\n`;
  }

  return `You are a slightly funny, techy, entertaining blog writer specializing in laptops and laptop recommendations. Create engaging, SEO-optimized content that follows these guidelines:

CRITICAL: Do not write less than 1500 words on the topic!

1. Title and Introduction:
   - Format title as: <h1 class="text-center mb-8">Your Title Here</h1>
   - Write a compelling, funny, detailed introduction (100-350 words) that MUST be split into 2-3 distinct paragraphs wrapped in <p> tags and feel free to use some 2-4 emojis
   - The introduction should explain why these laptops and brand is the best

2. Product Sections:
   - CRITICAL: You MUST generate EXACTLY ${productCount} laptop recommendations based on the raw data input received
   - I am providing you with ${productCount} actual products that MUST be included in your list in the EXACT order provided
   - Each section should be separated by: <hr class="my-8">
   - Keep laptop titles SHORT and CONCISE (maximum 7 words)
   - Format laptop titles as: <h3>[LAPTOP NAME]</h3>

3. Content Structure:
   - Write 2-4 engaging paragraphs (EXACTLY 200-400 words total) for each LAPTOP 
   - Start with an introduction paragraph about the LAPTOP 
   - Follow with features and benefits
   - End with why it makes a great LAPTOP 
   - Use emoji indicators at the start of key paragraphs

4. Features Format:
   - Include 2-3 UNIQUE key features for each LAPTOP as a list
   - Format features as:
     <ul class="my-4">
       <li>✅ [Key Feature 1]</li>
       <li>✅ [Key Feature 2]</li>
       <li>✅ [Key Feature 3]</li>
     </ul>

5. Product Data Placement:
   - After each product title (<h3>), insert a placeholder [PRODUCT_DATA_X] where X is the position (1-${productCount})
   - This placeholder will be replaced with product images, ratings, and buy buttons

6. Product Specifications:
   - For EACH laptop, you MUST provide the following specifications which will be displayed in the product card:
     - CPU: Processor model (use the provided information)
     - RAM: Memory capacity and type (use the provided information)
     - Graphics: GPU model (use the provided information)
     - Storage: Storage size and type (use the provided information)
     - Screen: Display size and resolution (use the provided information)
     - Battery: Battery life estimation (use the provided information or estimate)
   - These specifications MUST be accurate and based on the information provided

7. Section Spacing and Conclusion:
   - Start each new product section with: <hr class="my-8">
   - Add some spacing and then end the post with a funny and SEO optimized conclusion paragraph (200-600 words) with some emojis and wrapped in <p> tags
   - Add a final horizontal rule after the conclusion

8. Excerpt:
   - CRITICAL: You MUST provide a concise, engaging excerpt (max 160 characters) that summarizes the article
   - This excerpt will be used for social sharing and SEO purposes
   - Make it compelling and include relevant keywords

Use the EXACT names, models, and details of these products in your content:
${productsInfo}

Your response MUST be a valid JSON object with this structure:
{
  "title": "Top 10 Best [Category] Laptops",
  "content": "<h1 class="text-center mb-8">Your Title Here</h1><p>Introduction paragraph here...</p>...",
  "excerpt": "A brief summary of the article (max 160 characters)",
  "tags": ["laptop", "tech", "top10", "reviews"],
  "products": [
    {
      "position": 1,
      "cpu": "Intel Core i7-12700H",
      "ram": "16GB DDR4",
      "graphics": "NVIDIA RTX 3060",
      "storage": "512GB SSD",
      "screen": "15.6 inch FHD",
      "battery": "Up to 8 hours"
    },
    // ... repeat for all ${productCount} products
  ]
}

REMEMBER: 
1. The final content MUST refer to the EXACT products I've provided, using their correct details
2. Each product section must include the [PRODUCT_DATA_X] placeholder immediately after the <h3> heading
3. Don't include actual image URLs, star ratings, or buy buttons - these will be added later
4. Write naturally and engagingly about each product's strengths and features
5. Ensure the total article is at least 1500 words with proper formatting
6. The "products" array MUST include detailed specifications for each of the ${productCount} laptops in the proper order`;
}

/**
 * Helper function to extract computer specifications from title string
 */
function extractInfoFromTitle(title: string, type: 'processor' | 'ram' | 'graphics' | 'storage' | 'screen'): string | null {
  if (!title) return null;
  
  switch (type) {
    case 'processor':
      // Extract processor information (Intel Core i7, AMD Ryzen, etc.)
      const processorMatch = title.match(/(?:Intel\s+Core\s+i[3579][0-9-]*|AMD\s+Ryzen\s+[3579][0-9]*|Apple\s+M[123]\s+(?:Pro|Max|Ultra)?)/i);
      return processorMatch ? processorMatch[0] : null;
      
    case 'ram':
      // Extract RAM information (8GB, 16GB, etc.)
      const ramMatch = title.match(/(\d+)\s*GB\s*(?:DDR[45])?(?:\s*RAM)?/i);
      return ramMatch ? `${ramMatch[1]}GB RAM` : null;
      
    case 'graphics':
      // Extract graphics card information (RTX 3050, etc.)
      const graphicsMatch = title.match(/(?:NVIDIA|GeForce)\s+(?:RTX|GTX)\s+\d{4}(?:\s*Ti)?/i) ||
                           title.match(/Intel\s+(?:UHD|Iris\s+Xe)\s+Graphics/i) ||
                           title.match(/AMD\s+Radeon(?:\s+\w+\s+\d+)?/i);
      return graphicsMatch ? graphicsMatch[0] : null;
      
    case 'storage':
      // Extract storage information (512GB SSD, etc.)
      const storageMatch = title.match(/(\d+)\s*(?:GB|TB)\s*(?:SSD|HDD|NVMe)/i);
      return storageMatch ? storageMatch[0] : null;
      
    case 'screen':
      // Extract screen size information (15.6", etc.)
      const screenMatch = title.match(/(\d+\.?\d*)[\s-]?(?:inch|"|inches)?(?:\s*(?:FHD|QHD|UHD|HD))?/i);
      return screenMatch ? `${screenMatch[1]}" Display` : null;
      
    default:
      return null;
  }
}
