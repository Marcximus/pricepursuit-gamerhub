/**
 * Minimal processor for Amazon products that preserves all raw data
 */
export function processAmazonProducts(data: any) {
  if (!data.data?.products || !Array.isArray(data.data.products)) {
    console.warn("⚠️ No products found in RapidAPI response or invalid format");
    return [];
  }
  
  console.log(`✅ Received ${data.data?.products?.length || 0} products from RapidAPI`);
  
  // Log the structure of the first product to understand RapidAPI's response format
  if (data.data.products.length > 0) {
    const sampleProduct = data.data.products[0];
    console.log("📊 RapidAPI product structure sample:", {
      hasRating: !!sampleProduct.rating,
      ratingType: typeof sampleProduct.rating,
      ratingValue: sampleProduct.rating,
      hasRatingsTotal: !!sampleProduct.ratings_total,
      ratingsTotalType: typeof sampleProduct.ratings_total,
      ratingsTotalValue: sampleProduct.ratings_total,
      availableRatingFields: Object.keys(sampleProduct).filter(key => 
        key.includes('rating') || key.includes('review') || key.includes('stars')
      ),
      firstLevelKeys: Object.keys(sampleProduct)
    });
  }
  
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
    
    // Enhanced rating extraction with improved logging and fallbacks
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
 * Extract rating with enhanced validation and additional paths
 */
function extractRating(product: any): number | null {
  // Log the product's rating-related information for debugging
  const ratingPaths = {
    directRating: product.rating,
    starsProperty: product.stars,
    ratingObj: product.rating_breakdown?.stars_average,
    ratingValue: product.rating?.value,
    ratingNumber: product.rating?.rating,
    averageRating: product.average_rating,
    reviewStars: product.review_stars
  };
  
  console.log(`🔍 Rating extraction data paths:`, ratingPaths);
  
  // Check direct rating property
  if (product.rating) {
    if (typeof product.rating === 'number' && !isNaN(product.rating)) {
      return product.rating;
    }
    
    if (typeof product.rating === 'string' && product.rating.trim() !== '') {
      const parsedRating = parseFloat(product.rating);
      if (!isNaN(parsedRating)) {
        return parsedRating;
      }
    }
    
    // Check if rating is an object with a value property
    if (typeof product.rating === 'object' && product.rating !== null) {
      if (typeof product.rating.value === 'number' && !isNaN(product.rating.value)) {
        return product.rating.value;
      }
      
      if (typeof product.rating.rating === 'number' && !isNaN(product.rating.rating)) {
        return product.rating.rating;
      }
      
      // Log the structure of the rating object for debugging
      console.log(`🔍 Rating object structure:`, product.rating);
    }
  }
  
  // Check stars property (alternative name)
  if (product.stars) {
    if (typeof product.stars === 'number' && !isNaN(product.stars)) {
      return product.stars;
    }
    
    if (typeof product.stars === 'string' && product.stars.trim() !== '') {
      const parsedStars = parseFloat(product.stars);
      if (!isNaN(parsedStars)) {
        return parsedStars;
      }
    }
  }
  
  // Check rating breakdown if it exists
  if (product.rating_breakdown?.stars_average) {
    const parsedStars = parseFloat(product.rating_breakdown.stars_average);
    if (!isNaN(parsedStars)) {
      return parsedStars;
    }
  }
  
  // Check average_rating property
  if (product.average_rating) {
    if (typeof product.average_rating === 'number' && !isNaN(product.average_rating)) {
      return product.average_rating;
    }
    
    if (typeof product.average_rating === 'string' && product.average_rating.trim() !== '') {
      const parsedRating = parseFloat(product.average_rating);
      if (!isNaN(parsedRating)) {
        return parsedRating;
      }
    }
  }
  
  // Check review_stars property
  if (product.review_stars) {
    if (typeof product.review_stars === 'number' && !isNaN(product.review_stars)) {
      return product.review_stars;
    }
    
    if (typeof product.review_stars === 'string' && product.review_stars.trim() !== '') {
      const parsedRating = parseFloat(product.review_stars);
      if (!isNaN(parsedRating)) {
        return parsedRating;
      }
    }
  }
  
  // If we get here, we couldn't find a valid rating
  console.log(`⚠️ Could not extract rating for product:`, {
    title: product.title?.substring(0, 30) || 'Unknown',
    asin: product.asin || 'No ASIN'
  });
  
  return null;
}

/**
 * Extract review count with enhanced validation and additional paths
 */
function extractReviewCount(product: any): number | null {
  // Log the product's review count-related information for debugging
  const reviewCountPaths = {
    ratingsTotal: product.ratings_total,
    reviewsTotal: product.reviews_total,
    reviewsCount: product.reviews_count,
    reviewsArray: Array.isArray(product.reviews) ? product.reviews.length : 'Not an array',
    ratingCount: product.rating_count,
    reviewCount: product.review_count,
    ratingObj: product.rating?.count,
    ratingNumber: product.rating?.rating_count
  };
  
  console.log(`🔍 Review count extraction data paths:`, reviewCountPaths);
  
  // Check direct ratings_total property (most common in Amazon data)
  if (product.ratings_total !== undefined) {
    if (typeof product.ratings_total === 'number') {
      return product.ratings_total;
    }
    
    if (typeof product.ratings_total === 'string' && product.ratings_total.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.ratings_total.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Check reviews_total property (alternative name)
  if (product.reviews_total !== undefined) {
    if (typeof product.reviews_total === 'number') {
      return product.reviews_total;
    }
    
    if (typeof product.reviews_total === 'string' && product.reviews_total.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.reviews_total.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Check reviews_count property
  if (product.reviews_count !== undefined) {
    if (typeof product.reviews_count === 'number') {
      return product.reviews_count;
    }
    
    if (typeof product.reviews_count === 'string' && product.reviews_count.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.reviews_count.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Check rating_count property
  if (product.rating_count !== undefined) {
    if (typeof product.rating_count === 'number') {
      return product.rating_count;
    }
    
    if (typeof product.rating_count === 'string' && product.rating_count.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.rating_count.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Check review_count property (alternative spelling)
  if (product.review_count !== undefined) {
    if (typeof product.review_count === 'number') {
      return product.review_count;
    }
    
    if (typeof product.review_count === 'string' && product.review_count.trim() !== '') {
      // Remove commas and try to parse
      const cleanValue = product.review_count.replace(/,/g, '');
      const parsedCount = parseInt(cleanValue);
      if (!isNaN(parsedCount)) {
        return parsedCount;
      }
    }
  }
  
  // Check if rating is an object with count properties
  if (product.rating && typeof product.rating === 'object') {
    // Try rating.count
    if (product.rating.count !== undefined) {
      if (typeof product.rating.count === 'number') {
        return product.rating.count;
      }
      
      if (typeof product.rating.count === 'string' && product.rating.count.trim() !== '') {
        const cleanValue = product.rating.count.replace(/,/g, '');
        const parsedCount = parseInt(cleanValue);
        if (!isNaN(parsedCount)) {
          return parsedCount;
        }
      }
    }
    
    // Try rating.rating_count
    if (product.rating.rating_count !== undefined) {
      if (typeof product.rating.rating_count === 'number') {
        return product.rating.rating_count;
      }
      
      if (typeof product.rating.rating_count === 'string' && product.rating.rating_count.trim() !== '') {
        const cleanValue = product.rating.rating_count.replace(/,/g, '');
        const parsedCount = parseInt(cleanValue);
        if (!isNaN(parsedCount)) {
          return parsedCount;
        }
      }
    }
  }
  
  // Count reviews array if it exists
  if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
    return product.reviews.length;
  }
  
  // If we get here, we couldn't find a valid review count
  console.log(`⚠️ Could not extract review count for product:`, {
    title: product.title?.substring(0, 30) || 'Unknown',
    asin: product.asin || 'No ASIN'
  });
  
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
