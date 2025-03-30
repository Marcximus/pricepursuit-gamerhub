
/**
 * Format the product data for the blog post
 * @param topProducts Array of products to format
 * @returns Formatted products array
 */
export const formatProductsForDisplay = (topProducts: any[]) => {
  console.log(`🎨 Formatting ${topProducts.length} products for blog post display`);
  
  return topProducts.map((product, index) => {
    console.log(`🔄 Formatting product #${index + 1}: ${product.asin}`);
    const specs = [];
    if (product.processor) specs.push(`Processor: ${product.processor}`);
    if (product.ram) specs.push(`RAM: ${product.ram}`);
    if (product.storage) specs.push(`Storage: ${product.storage}`);
    if (product.screen_size) specs.push(`Screen: ${product.screen_size}`);
    if (product.graphics) specs.push(`Graphics: ${product.graphics}`);
    
    console.log(`📊 Product #${index + 1} specs count: ${specs.length}`);
    
    return {
      rank: index + 1, // Changed to 1-based index for proper ranking
      id: product.id,
      asin: product.asin,
      title: product.title,
      brand: product.brand,
      model: product.model,
      specs: specs.join(' | '),
      price: product.current_price,
      originalPrice: product.original_price,
      rating: product.rating,
      ratingCount: product.rating_count,
      imageUrl: product.image_url,
      productUrl: product.product_url,
      htmlContent: generateProductHtml(product, specs, index + 1) // Pass the 1-based index
    };
  });
};

/**
 * Generate HTML content for a single product
 * @param product Product data
 * @param specs Array of specification strings
 * @param rank Product rank number
 * @returns HTML string representation of the product
 */
const generateProductHtml = (product: any, specs: string[], rank: number): string => {
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${product.image_url}" alt="${product.title}" class="rounded-lg w-full">
      </div>
      <div class="product-info">
        <h3 class="text-xl font-semibold text-green-800">${product.title}</h3>
        <div class="specs text-sm text-gray-600 my-2">
          ${specs.join(' | ')}
        </div>
        <div class="price-rating flex justify-between items-center">
          <div class="price font-bold">${product.current_price ? `$${product.current_price}` : 'Check Price'}</div>
          <div class="rating flex items-center">
            <span class="stars">★★★★★</span>
            <span class="rating-text ml-1">${product.rating ? product.rating.toFixed(1) : '-'}/5</span>
          </div>
        </div>
        <a href="${product.product_url}" target="_blank" rel="noopener noreferrer" class="btn-view mt-2 block text-center bg-green-600 text-white py-2 px-4 rounded-md">Check It Out Now</a>
      </div>
    </div>
  `;
};
