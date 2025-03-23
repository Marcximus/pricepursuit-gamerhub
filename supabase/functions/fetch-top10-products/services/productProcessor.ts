
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
    // Extract basic product information with fallbacks
    const title = product.title || product.name || 'Lenovo Laptop';
    const brand = product.brand || 'Lenovo';
    const asin = product.asin || '';
    const imageUrl = product.image || product.images?.[0] || '';
    const url = product.url || product.link || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
    const price = product.price?.value || product.price || '';
    const rating = product.rating || product.stars || '';
    const ratingsTotal = product.ratings_total || product.reviews_total || '';
    
    // Calculate the rank for this product (from 10 to 1)
    const rank = 10 - index;
    
    // Generate HTML content for each product
    const htmlContent = generateProductHTML({
      ...product,
      title,
      brand,
      asin,
      imageUrl,
      url,
      price,
      rating,
      ratingsTotal,
      rank
    }, index + 1);
    
    console.log(`✅ Generated HTML content for product #${index + 1}: ${htmlContent.substring(0, 50)}...`);
    
    return {
      ...product,
      title,
      brand,
      asin,
      image: imageUrl,
      imageUrl,
      url,
      productUrl: url,
      price: price,
      rating: rating,
      ratings_total: ratingsTotal,
      rank: index + 1, // Keep rank property for display order
      htmlContent: htmlContent,
      _rawData: true // Flag to indicate this has raw data
    };
  });
  
  console.log(`🏁 Returning ${products.length} products with complete raw data`);
  console.log(`📤 FINAL RESPONSE PREVIEW: First product: "${products[0]?.title?.substring(0, 30)}..." Price: $${products[0]?.price?.value || products[0]?.price || 'N/A'}`);
  console.log(`📤 First product has HTML content: ${!!products[0]?.htmlContent}`);
  
  // Return all products, up to 15 max to ensure we have enough data
  return products.slice(0, 15);
}

/**
 * Generate standardized HTML for product cards
 */
function generateProductHTML(product: any, rank: number): string {
  // Format price with dollar sign if needed
  const formattedPrice = typeof product.price === 'number' 
    ? `$${product.price.toFixed(2)}` 
    : (typeof product.price?.value === 'number' 
      ? `$${product.price.value.toFixed(2)}`
      : (typeof product.price === 'string' && product.price.indexOf('$') === -1
        ? `$${product.price}`
        : (product.price || 'Price not available')));
  
  // Format ratings and review count
  const formattedRating = product.rating ? `${product.rating}/5` : 'No ratings';
  const reviewText = product.ratingsTotal ? `(${product.ratingsTotal} reviews)` : '';
  
  // Extract features or highlights - limit to 3 for cleaner display
  const features = Array.isArray(product.feature_bullets) 
    ? product.feature_bullets.slice(0, 3) 
    : (Array.isArray(product.features) ? product.features.slice(0, 3) : []);
  
  // Include rank number in the title
  const rankNumber = product.rank || rank;
  const rankedTitle = `#${rankNumber} ${product.title}`;
  
  // Build the HTML for the product card
  return `
    <div class="product-card" data-asin="${escapeHtml(product.asin)}" data-rank="${rank}">
      <div class="product-rank">#${rank}</div>
      <div class="product-image">
        <a href="${escapeHtml(product.url)}" target="_blank" rel="nofollow noopener">
          <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(rankedTitle)}" loading="lazy" />
        </a>
      </div>
      <div class="product-details">
        <h4 class="product-title">
          <a href="${escapeHtml(product.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(rankedTitle)}</a>
        </h4>
        <div class="product-meta">
          <span class="product-price">${escapeHtml(formattedPrice)}</span>
          <span class="product-rating">${escapeHtml(formattedRating)} ${escapeHtml(reviewText)}</span>
        </div>
        ${features.length > 0 ? 
          `<div class="product-features">
            <ul>
              ${features.map((feature: string) => 
                `<li>${escapeHtml(feature)}</li>`).join('')}
            </ul>
          </div>` : ''
        }
        <div class="product-cta">
          <a href="${escapeHtml(product.url)}" class="check-price-btn" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
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
