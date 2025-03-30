
/**
 * Generate standardized HTML for product cards
 */
import { escapeHtml } from '../utils/security.ts';

export function generateProductHTML(product: any, rank: number): string {
  // Format rating display with stars
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
      ratingDisplay = product.rating;
    }
  } else {
    ratingDisplay = 'No ratings';
  }
  
  if (product.ratingsTotal || product.ratings_total) {
    const count = product.ratingsTotal || product.ratings_total;
    if (count) {
      reviewText = `(${count.toLocaleString()} reviews)`;
    }
  }
  
  // Extract features or highlights - limit to 3 for cleaner display
  const features = Array.isArray(product.feature_bullets) 
    ? product.feature_bullets.slice(0, 3) 
    : (Array.isArray(product.features) ? product.features.slice(0, 3) : []);
  
  // Build the HTML for the product card with the requested design changes:
  // 1. Remove price
  // 2. Center reviews beneath the image
  // 3. Make Check Price button less wide
  return `
    <div class="product-card" data-asin="${escapeHtml(product.asin)}" data-rank="${rank}">
      <div class="product-rank">#${rank}</div>
      <div class="product-image">
        <a href="${escapeHtml(product.url)}" target="_blank" rel="nofollow noopener">
          <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.title)}" loading="lazy" />
        </a>
        <div class="product-rating text-center mt-2 mb-3">
          ${ratingDisplay} ${escapeHtml(reviewText)}
        </div>
      </div>
      <div class="product-details">
        <h4 class="product-title">
          <a href="${escapeHtml(product.url)}" target="_blank" rel="nofollow noopener">${escapeHtml(product.title)}</a>
        </h4>
        ${features.length > 0 ? 
          `<div class="product-features">
            <ul>
              ${features.map((feature: string) => 
                `<li>${escapeHtml(feature)}</li>`).join('')}
            </ul>
          </div>` : ''
        }
        <div class="product-cta flex justify-center">
          <a href="${escapeHtml(product.url)}" class="check-price-btn button-amazon bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded inline-block w-auto min-width-[200px] max-w-[300px] mx-auto text-center whitespace-nowrap transition-colors duration-200" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
        </div>
      </div>
    </div>
  `;
}
