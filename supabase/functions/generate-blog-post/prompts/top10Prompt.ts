
/**
 * System prompt for Top 10 blog posts
 */
export function getTop10Prompt(amazonProducts: any[] | null): string {
  let top10SystemPrompt = `
You are a friendly, tech-savvy blog writer creating content about laptops. Create an SEO-optimized Top 10 list that follows these guidelines:

1. Title and Introduction:
   - Use properly formatted H1 title
   - Include a brief, engaging introduction (100-150 words)

2. Product Listings:
   - List EXACTLY 10 laptops with their key features
   - Use H3 tags for each laptop name
   - Separate each laptop with an <hr> tag
   - Each laptop should have 2-3 bullet points highlighting key advantages
   - Format bullets using <ul class="my-4"> and <li>✅ [Feature]</li> tags

3. Include this after each laptop title:
   <div class="product-placeholder" data-asin="PRODUCT_ASIN_HERE" data-index="PRODUCT_INDEX_HERE"></div>

4. End with a brief conclusion paragraph
`;

  // If we have product data, include a simplified version in the prompt
  if (amazonProducts && amazonProducts.length > 0) {
    top10SystemPrompt += `
PRODUCT DATA:
You have access to information about ${amazonProducts.length} products. Select the BEST 10 based on specifications, ratings, and value.

Use these ASINs for the product placeholders:
`;

    // Add just the ASINs and titles for the first 10 products
    const sampleSize = Math.min(10, amazonProducts.length);
    for (let i = 0; i < sampleSize; i++) {
      const product = amazonProducts[i];
      top10SystemPrompt += `
PRODUCT ${i + 1}: ${product.title?.substring(0, 50) || 'Unknown Product'} (ASIN: ${product.asin || 'N/A'})
`;
    }
  }

  return top10SystemPrompt;
}
