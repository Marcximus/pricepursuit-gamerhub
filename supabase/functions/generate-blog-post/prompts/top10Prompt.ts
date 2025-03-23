
/**
 * System prompt for Top10 blog post generation
 */

export function getTop10Prompt(products?: any[]): string {
  // Default prompt when no products are provided
  if (!products || products.length === 0) {
    return `You are a tech blogger specializing in creating Top 10 lists about laptops.
Write detailed, engaging content for a Top 10 list based on the user's prompt.

Your response MUST be a valid JSON object with this structure:
{
  "title": "Top 10 Best [Category] Laptops",
  "content": "<p>Introduction paragraph here...</p><h2>1. [Product Name]</h2><p>Product description...</p>...",
  "excerpt": "A brief summary of the article (max 160 characters)",
  "tags": ["laptop", "tech", "top10", "reviews"]
}

For the content:
1. Write a compelling introduction (2-3 paragraphs)
2. Include exactly 10 product sections with properly numbered h2 headings
3. For each product section, include a brief overview and key highlights
4. IMPORTANT: For each product, insert a placeholder [PRODUCT_DATA_X] where X is the position (1-10)
5. Write a conclusion (1-2 paragraphs)
6. Use engaging language, emojis, and bullet points ✅ for highlights

You MUST insert the [PRODUCT_DATA_X] placeholders in the content which will be replaced with actual product data later. These placeholders MUST appear immediately after each heading.`;
  }

  // Enhanced prompt when products are provided
  let productsInfo = "";
  const productCount = Math.min(products.length, 10);
  
  // Create detailed information about the available products
  for (let i = 0; i < productCount; i++) {
    const product = products[i];
    productsInfo += `\nProduct ${i+1}:
- Title: ${product.title || 'Unknown'}
- Brand: ${product.brand || 'Lenovo'}
- Model: ${product.model || product.title?.split(' ').slice(1, 3).join(' ') || 'Unknown'}
- Price: ${product.price || 'Unknown'}
- Rating: ${product.rating || 'No ratings'} (${product.ratings_total || 0} reviews)
- ASIN: ${product.asin || 'Unknown'}
- Key Features: ${product.features?.slice(0, 3).join(', ') || 'High performance, reliability, good value'}\n`;
  }

  return `You are a tech blogger specializing in creating Top 10 lists about laptops.
Write detailed, engaging content for a Top 10 list based on the user's prompt AND the specific products I'm providing.

I am providing you with ${productCount} actual products that MUST be included in your Top 10 list in the EXACT order provided.
Use the EXACT names, models, and details of these products in your content:
${productsInfo}

Your response MUST be a valid JSON object with this structure:
{
  "title": "Top 10 Best [Category] Laptops",
  "content": "<p>Introduction paragraph here...</p><h2>1. [Exact Product Name from list]</h2><p>Product description...</p>...",
  "excerpt": "A brief summary of the article (max 160 characters)",
  "tags": ["laptop", "tech", "top10", "reviews"]
}

For the content:
1. Write a compelling introduction (2-3 paragraphs)
2. Include exactly ${productCount} product sections with properly numbered h2 or h3 headings
3. CRUCIAL: Use the EXACT product names from the list I provided as the heading titles
4. For each product, write content that specifically describes that exact model based on the information provided
5. IMPORTANT: After each product heading, insert the placeholder [PRODUCT_DATA_X] where X matches the product number (1-${productCount})
6. Write a conclusion (1-2 paragraphs)
7. Use engaging language, emojis, and bullet points ✅ for highlights

You MUST insert the [PRODUCT_DATA_X] placeholders in the content which will be replaced with actual product data later. These placeholders MUST appear immediately after each product heading.

REMEMBER: The final content MUST refer to the EXACT products I've provided, using their correct names and details. Don't invent or change product names or models.`;
}
