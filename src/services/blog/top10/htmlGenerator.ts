
/**
 * HTML generation for product cards
 */
import { escapeHtml } from './utils';

// Generate fallback HTML if the product doesn't have htmlContent
export function generateProductHtml(product: any, rank: number): string {
  // Extract product data with fallbacks
  const title = product.title || 'Lenovo Laptop';
  const price = typeof product.price === 'number' 
    ? `$${product.price.toFixed(2)}` 
    : (product.price?.value ? `$${parseFloat(product.price.value).toFixed(2)}` : 'Price not available');
  const rating = product.rating ? `${product.rating}/5` : 'No ratings';
  const reviews = product.ratings_total ? `(${product.ratings_total} reviews)` : '';
  const image = product.imageUrl || product.image || '';
  const asin = product.asin || '';
  const url = product.productUrl || product.url || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
  
  // Extract features or highlights - limit to 3 for cleaner display
  const features = Array.isArray(product.feature_bullets) 
    ? product.feature_bullets.slice(0, 3) 
    : (Array.isArray(product.features) ? product.features.slice(0, 3) : []);
  
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
            <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener" class="text-blue-700 hover:text-blue-900">${escapeHtml(title)}</a>
          </h3>
          <div class="product-meta flex flex-wrap items-center gap-2 mb-4">
            <span class="product-price text-lg font-bold text-green-600">${escapeHtml(price)}</span>
            <span class="mx-2 text-gray-400">|</span>
            <span class="product-rating flex items-center text-amber-500">
              ${rating !== 'No ratings' ? '⭐'.repeat(Math.round(parseFloat(rating))) : ''}
              <span class="ml-1 text-gray-700">${escapeHtml(rating)} ${escapeHtml(reviews)}</span>
            </span>
          </div>
          ${features.length > 0 ? 
            `<div class="product-features mb-4">
              <h4 class="font-semibold text-gray-700 mb-2">Key Features:</h4>
              <ul class="list-disc list-inside space-y-1 text-gray-600">
                ${features.map((feature: string) => 
                  `<li>${escapeHtml(feature)}</li>`).join('')}
              </ul>
            </div>` : ''
          }
        </div>
        <div class="product-cta mt-4">
          <a href="${escapeHtml(url)}" class="check-price-btn inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-full transition-colors text-center" target="_blank" rel="nofollow noopener">
            View on Amazon
          </a>
        </div>
      </div>
    </div>
  `;
}

// Add Humix video embed if not already present
export function addVideoEmbed(content: string): string {
  if (!content.includes('humixPlayers')) {
    console.log('📼 Adding Humix video embed to content');
    const videoEmbed = `<div class="video-container my-8"><script data-ezscrex="false" data-cfasync="false">(window.humixPlayers = window.humixPlayers || []).push({target: document.currentScript});</script><script async data-ezscrex="false" data-cfasync="false" src="https://www.humix.com/video.js"></script></div>`;
    
    // Insert after the first h2 or at the end if no h2 is found
    const h2Match = content.match(/<h2[^>]*>.*?<\/h2>/i);
    if (h2Match && h2Match.index) {
      const insertPosition = h2Match.index + h2Match[0].length;
      return content.substring(0, insertPosition) + 
              '\n\n' + videoEmbed + '\n\n' + 
              content.substring(insertPosition);
    } else {
      // Add to the end if no h2 is found
      return content + '\n\n' + videoEmbed;
    }
  }
  return content;
}
