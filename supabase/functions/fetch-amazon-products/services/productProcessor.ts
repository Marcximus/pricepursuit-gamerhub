
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
    
    // Enhanced price extraction with better fallbacks
    const price = extractPrice(product);
    
    // Enhanced rating extraction with validation
    const rating = extractRating(product);
    const ratingsTotal = extractReviewCount(product);
    
    // Log extracted data for debugging
    console.log(`🔍 Product #${index + 1}: "${title.substring(0, 30)}..."`);
    console.log(`⭐ Rating: ${rating || 'N/A'}, Reviews: ${ratingsTotal || 'N/A'}`);
    
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
      ratingsTotal
    }, index + 1);
    
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
  
  // Return all products, up to 15 max to ensure we have enough data
  return products.slice(0, 15);
}

/**
 * Extract price from various possible formats in the API response
 */
function extractPrice(product: any): string | number {
  if (product.price?.value) {
    return product.price.value;
  }
  
  if (product.price?.current_price) {
    return product.price.current_price;
  }
  
  if (typeof product.price === 'number') {
    return product.price;
  }
  
  if (typeof product.price === 'string' && product.price) {
    // Try to extract numeric value if it's a string like "$599.99"
    const match = product.price.match(/\d+(\.\d+)?/);
    if (match) {
      return parseFloat(match[0]);
    }
    return product.price;
  }
  
  return 'Price not available';
}

/**
 * Extract rating with validation
 */
function extractRating(product: any): number | null {
  // Check direct rating property
  if (product.rating && !isNaN(parseFloat(product.rating))) {
    return parseFloat(product.rating);
  }
  
  // Check stars property (alternative name)
  if (product.stars && !isNaN(parseFloat(product.stars))) {
    return parseFloat(product.stars);
  }
  
  // Check rating object if it exists
  if (product.rating_breakdown?.stars_average) {
    return parseFloat(product.rating_breakdown.stars_average);
  }
  
  return null;
}

/**
 * Extract review count
 */
function extractReviewCount(product: any): number | null {
  // Check direct count property
  if (product.ratings_total && !isNaN(parseInt(product.ratings_total))) {
    return parseInt(product.ratings_total);
  }
  
  // Check reviews_total property (alternative name)
  if (product.reviews_total && !isNaN(parseInt(product.reviews_total))) {
    return parseInt(product.reviews_total);
  }
  
  // Check reviews count if it exists
  if (product.reviews_count && !isNaN(parseInt(product.reviews_count))) {
    return parseInt(product.reviews_count);
  }
  
  // Count reviews array if it exists
  if (product.reviews && Array.isArray(product.reviews)) {
    return product.reviews.length;
  }
  
  return null;
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
  
  // Enhanced rating display with stars
  let ratingDisplay = '';
  let reviewText = '';
  
  if (product.rating) {
    const ratingValue = parseFloat(product.rating);
    if (!isNaN(ratingValue)) {
      // Generate star symbols based on rating
      const fullStars = Math.floor(ratingValue);
      const halfStar = ratingValue % 1 >= 0.5 ? 1 : 0;
      
      ratingDisplay = `<span class="text-amber-500">${'★'.repeat(fullStars)}${halfStar ? '½' : ''}</span>`;
      ratingDisplay += ` ${ratingValue.toFixed(1)}/5`;
    } else {
      ratingDisplay = `${product.rating}/5`;
    }
  } else {
    ratingDisplay = 'No ratings';
  }
  
  if (product.ratingsTotal || product.ratings_total) {
    const count = product.ratingsTotal || product.ratings_total;
    reviewText = `(${count.toLocaleString()} reviews)`;
  }
  
  // Extract features or highlights - limit to 3 for cleaner display
  const features = Array.isArray(product.feature_bullets) 
    ? product.feature_bullets.slice(0, 3) 
    : (Array.isArray(product.features) ? product.features.slice(0, 3) : []);
  
  // Build the HTML for the product card
  return `
    <div class="product-card" data-asin="${escapeHtml(product.asin)}" data-rank="${rank}">
      <div class="product-rank">#${rank}</div>
      <div class="product-image">
        <a href="${escapeHtml(product.url)}" target="_blank" rel="nofollow noopener">
          <img src="${escapeHtml(product.imageUrl)}" alt="#${rank} ${escapeHtml(product.title)}" loading="lazy" />
        </a>
      </div>
      <div class="product-details">
        <h4 class="product-title">
          <a href="${escapeHtml(product.url)}" target="_blank" rel="nofollow noopener">#${rank} ${escapeHtml(product.title)}</a>
        </h4>
        <div class="product-meta">
          <span class="product-price">${escapeHtml(formattedPrice)}</span>
          <span class="product-rating">${ratingDisplay} ${escapeHtml(reviewText)}</span>
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
          <a href="${escapeHtml(product.url)}" class="check-price-btn button-amazon bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded inline-block transition-colors duration-200" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
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
