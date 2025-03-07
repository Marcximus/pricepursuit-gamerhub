/**
 * Minimal processor for Amazon products that preserves all raw data
 */
export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  // Simply pass through the complete raw products with minimal enhancements
  const products = data.data.products.map((product: any, index: number) => {
    // Generate HTML content for each product
    const htmlContent = generateProductHTML(product, index + 1);
    console.log(`✅ Generated HTML content for product #${index + 1}: ${htmlContent.substring(0, 50)}...`);
    
    return {
      ...product,
      rank: index + 1, // Keep rank property for display order
      
      // Add these properties only if they don't already exist - don't override existing values
      imageUrl: product.imageUrl || product.image || '',
      productUrl: product.productUrl || product.url || '#',
      
      // Always include the HTML content
      htmlContent: htmlContent,
      
      // Keep original data structure intact
      _rawData: true // Flag to indicate this has raw data
    };
  });
  
  console.log(`🏁 Returning ${products.length} products with complete raw data`);
  console.log(`📤 FINAL RESPONSE PREVIEW: First product: "${products[0]?.title?.substring(0, 30)}..." Price: $${products[0]?.price?.value || 'N/A'}`);
  console.log(`📤 First product has HTML content: ${!!products[0]?.htmlContent}`);
  
  // Return all products, up to 15 max to ensure we have enough data
  return products.slice(0, 15);
}

/**
 * Generate standardized HTML for product cards
 */
function generateProductHTML(product: any, rank: number): string {
  // Extract necessary properties with fallbacks
  const title = product.title || 'Unknown Product';
  const price = typeof product.price === 'number' 
    ? `$${product.price.toFixed(2)}` 
    : (product.price?.value ? `$${parseFloat(product.price.value).toFixed(2)}` : 'Price not available');
  const rating = product.rating || product.stars || 'No ratings';
  const reviews = product.ratings_total || product.reviews_total || product.ratingCount || 0;
  const reviewText = reviews ? `(${reviews} reviews)` : '';
  const image = product.imageUrl || product.image || product.images?.[0] || '';
  const asin = product.asin || '';
  const url = product.productUrl || product.url || product.link || '#';
  
  // Extract features or highlights
  const features = product.feature_bullets || product.features || [];
  
  // Generate HTML with proper escaping for any text content
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
          <span class="product-rating">${escapeHtml(String(rating))} ${escapeHtml(reviewText)}</span>
        </div>
        ${features.length > 0 ? 
          `<div class="product-features">
            <ul>
              ${features.slice(0, 3).map((feature: string) => 
                `<li>${escapeHtml(feature)}</li>`).join('')}
            </ul>
          </div>` : ''
        }
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
