
/**
 * Generates HTML content for a product
 */

/**
 * Generate HTML content for product display in blog posts
 * @param product The product data
 * @param rank The product rank in the list
 * @returns Formatted HTML content string
 */
export function generateHtmlContent(product: any, rank: number): string {
  if (!product) return '';
  
  // Ensure we have data for all fields or use defaults
  const title = product.title || 'Lenovo Laptop';
  const price = product.price?.value 
    ? `$${parseFloat(product.price.value).toFixed(2)}` 
    : (typeof product.price === 'string' ? product.price : 'Price not available');
  
  // Enhanced rating and reviews display
  let rating = 'No ratings';
  let reviews = '';
  
  if (product.rating) {
    rating = typeof product.rating === 'number' 
      ? `${product.rating.toFixed(1)}/5` 
      : `${product.rating}/5`;
  }
  
  if (product.ratings_total || product.reviews_count) {
    const reviewCount = product.ratings_total || product.reviews_count || 0;
    reviews = `(${reviewCount.toLocaleString()} reviews)`;
  }
  
  // Generate star symbols based on rating value
  let starHTML = '';
  if (product.rating) {
    const ratingValue = parseFloat(product.rating);
    if (!isNaN(ratingValue)) {
      const fullStars = Math.floor(ratingValue);
      const halfStar = ratingValue % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      
      // Generate filled stars
      starHTML = '<span class="text-amber-500">' + '★'.repeat(fullStars);
      
      // Add half star if needed
      if (halfStar) {
        starHTML += '½';
      }
      
      // Close filled stars span
      starHTML += '</span>';
      
      // Add empty stars
      if (emptyStars > 0) {
        starHTML += '<span class="text-gray-300">' + '☆'.repeat(emptyStars) + '</span>';
      }
    }
  }
  
  const image = product.image || product.imageUrl || '';
  const asin = product.asin || '';
  const url = product.url || product.productUrl || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
  
  // Extract key features (limited to 3 for clean display)
  let featuresList = '';
  if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
    const features = product.feature_bullets.slice(0, 3);
    if (features.length > 0) {
      featuresList = '<ul class="product-features">' + 
        features.map((feature: string) => `<li>${escapeHtml(feature)}</li>`).join('') + 
        '</ul>';
    }
  }
  
  // Create the HTML content with proper structure and styling
  return `
    <div class="product-card flex flex-col md:flex-row overflow-hidden rounded-lg shadow-lg border border-gray-200 my-8 hover:shadow-xl transition-shadow bg-white" data-asin="${escapeHtml(asin)}" data-rank="${rank}">
      <div class="relative product-image w-full md:w-1/3 flex-shrink-0">
        <span class="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded font-bold text-sm product-rank">#${rank}</span>
        <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" class="w-full h-64 object-contain p-4" loading="lazy" />
        </a>
      </div>
      <div class="product-details p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 class="product-title text-xl font-bold mb-2">
            <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener" class="text-blue-700 hover:text-blue-900">#${rank} ${escapeHtml(title)}</a>
          </h3>
          <div class="product-meta flex flex-wrap items-center gap-2 mb-4">
            <span class="product-price text-lg font-bold text-green-600">${escapeHtml(price)}</span>
            <span class="mx-2 text-gray-400">|</span>
            <span class="product-rating flex items-center">
              ${starHTML}
              <span class="ml-1 text-gray-700">${escapeHtml(rating)} ${escapeHtml(reviews)}</span>
            </span>
          </div>
          ${featuresList ? `
          <div class="product-features mb-4">
            <h4 class="font-semibold text-gray-700 mb-2">Key Features:</h4>
            ${featuresList}
          </div>` : ''}
        </div>
        <div class="product-cta mt-4">
          <a href="${escapeHtml(url)}" class="check-price-btn button-amazon inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-full transition-colors text-center" target="_blank" rel="nofollow noopener">
            View on Amazon
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Simple HTML escape function to prevent XSS in product data
 */
function escapeHtml(unsafe: string | number | undefined): string {
  if (unsafe === undefined || unsafe === null) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
