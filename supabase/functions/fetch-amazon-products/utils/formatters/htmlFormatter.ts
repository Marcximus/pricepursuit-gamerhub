
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
  
  const title = product.title || 'Unknown Product';
  const price = product.price?.value ? `$${product.price.value}` : 'Price not available';
  const rating = product.rating ? `${product.rating}/5` : 'No ratings';
  const reviews = product.ratings_total ? `(${product.ratings_total} reviews)` : '';
  const image = product.image || '';
  const asin = product.asin || '';
  const url = product.url || '#';
  
  // Extract key features (limited to 5)
  let featuresList = '';
  if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
    const features = product.feature_bullets.slice(0, 5);
    if (features.length > 0) {
      featuresList = '<ul class="product-features">' + 
        features.map(feature => `<li>${feature}</li>`).join('') + 
        '</ul>';
    }
  }
  
  // Create the HTML content with proper structure and styling
  return `
    <div class="product-card" data-asin="${asin}" data-rank="${rank}">
      <div class="product-rank">#${rank}</div>
      <div class="product-image">
        <a href="${url}" target="_blank" rel="nofollow noopener">
          <img src="${image}" alt="${title}" loading="lazy" />
        </a>
      </div>
      <div class="product-details">
        <h4 class="product-title">
          <a href="${url}" target="_blank" rel="nofollow noopener">${title}</a>
        </h4>
        <div class="product-meta">
          <span class="product-price">${price}</span>
          <span class="product-rating">${rating} ${reviews}</span>
        </div>
        ${featuresList}
        <div class="product-cta">
          <a href="${url}" class="check-price-btn" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
        </div>
      </div>
    </div>
  `;
}
