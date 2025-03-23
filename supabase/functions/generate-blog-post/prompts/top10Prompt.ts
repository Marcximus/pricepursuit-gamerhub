
/**
 * System prompt for Top 10 blog posts
 */
export function getTop10Prompt(amazonProducts: any[] | null): string {
  let top10SystemPrompt = `
You are a tech blog writer creating a Top 10 product list. Your task is to create a simple, SEO-optimized blog post with:

1. A clear H1 title
2. A brief introduction (75-100 words)
3. 10 product listings with:
   - H3 headings for each product
   - 2-3 bullet points highlighting key advantages
   - <div class="product-placeholder" data-asin="PRODUCT_ASIN" data-index="INDEX"></div> after each heading
4. A short conclusion

Format bullets as <ul class="my-4"><li>✅ [Feature]</li></ul>
Keep your response focused and concise.
`;

  // If we have product data, include just the basic info
  if (amazonProducts && amazonProducts.length > 0) {
    top10SystemPrompt += `\nPRODUCT DATA:\nUse these ASINs for the product placeholders:\n`;

    // Add just the ASINs and minimal title info
    const productsToUse = amazonProducts.slice(0, 10);
    for (let i = 0; i < productsToUse.length; i++) {
      const product = productsToUse[i];
      const shortTitle = product.title?.substring(0, 30) || 'Unknown Product';
      top10SystemPrompt += `PRODUCT ${i + 1}: ${shortTitle}... (ASIN: ${product.asin || 'N/A'})\n`;
    }
  }

  return top10SystemPrompt;
}
