
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
  const title = product.title || 'Unknown Product';
  const price = product.price?.value 
    ? `$${parseFloat(product.price.value).toFixed(2)}` 
    : 'Price not available';
  const rating = product.rating ? `${product.rating}/5` : 'No ratings';
  const reviews = product.ratings_total ? `(${product.ratings_total} reviews)` : '';
  const image = product.image || product.imageUrl || '';
  const asin = product.asin || '';
  const url = product.url || product.productUrl || '#';
  
  // Extract key features (limited to 5)
  let featuresList = '';
  if (product.feature_bullets && Array.isArray(product.feature_bullets)) {
    const features = product.feature_bullets.slice(0, 5);
    if (features.length > 0) {
      featuresList = '<ul class="product-features">' + 
        features.map((feature: string) => `<li>${escapeHtml(feature)}</li>`).join('') + 
        '</ul>';
    }
  }
  
  // Create the HTML content with proper structure and styling
  return `
    <div class="product-card" data-asin="${escapeHtml(asin)}" data-rank="${rank}">
      <div class="product-rank">#${rank}</div>
      <div class="product-image">
        <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" />
        </a>
      </div>
      <div class="product-details">
        <h4 class="product-title">
          <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">${escapeHtml(title)}</a>
        </h4>
        <div class="product-meta">
          <span class="product-price">${escapeHtml(price)}</span>
          <span class="product-rating">${escapeHtml(rating)} ${escapeHtml(reviews)}</span>
        </div>
        ${featuresList}
        <div class="product-cta">
          <a href="${escapeHtml(url)}" class="check-price-btn" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
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
