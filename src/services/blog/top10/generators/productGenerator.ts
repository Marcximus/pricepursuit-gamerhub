
/**
 * Product HTML generation utilities for Top10 blog posts
 */
import { formatPrice, formatAmazonUrl, generateStarsHtml } from '../utils';

/**
 * Generate HTML for a product card
 */
export function generateProductHtml(product: any, index: number): string {
  const productTitle = product.title || 'Lenovo Laptop';
  const productPrice = formatPrice(product.price);
  const productRating = product.rating || 0;
  const productRatingTotal = product.ratings_total || 0;
  const productUrl = formatAmazonUrl(product.asin);
  
  // Enhanced image URL processing with better fallbacks
  let imageUrl = '';
  
  // Check all possible image properties with validation
  if (product.image_url && typeof product.image_url === 'string' && product.image_url.startsWith('http')) {
    imageUrl = product.image_url;
  } else if (product.image && typeof product.image === 'string' && product.image.startsWith('http')) {
    imageUrl = product.image;
  } else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    // Find the first valid image URL in the images array
    for (const img of product.images) {
      if (typeof img === 'string' && img.startsWith('http')) {
        imageUrl = img;
        break;
      } else if (typeof img === 'object' && img?.url && typeof img.url === 'string' && img.url.startsWith('http')) {
        imageUrl = img.url;
        break;
      }
    }
  } else if (product.thumbnail && typeof product.thumbnail === 'string' && product.thumbnail.startsWith('http')) {
    // Clean up thumbnail URLs to get higher quality images
    if (product.thumbnail.includes('._S')) {
      imageUrl = product.thumbnail.replace(/\._S[LX]\d+_/, '._SL500_');
    } else {
      imageUrl = product.thumbnail;
    }
  }
  
  // Process Amazon image URLs to improve quality
  if (imageUrl && (imageUrl.includes('amazon.com') || imageUrl.includes('ssl-images-amazon.com'))) {
    imageUrl = imageUrl.replace(/\._.*_\./, '.'); // Remove size constraints
  }
  
  // If no valid image was found, use a reliable placeholder
  if (!imageUrl) {
    imageUrl = `https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80`;
  }
  
  // Calculate the proper product ranking (from #10 to #1)
  const rank = 10 - (index % 10);
  
  // Format the title with the rank number in front
  const rankedTitle = `#${rank} ${productTitle}`;
  
  console.log(`🖼️ Generating HTML for product #${rank}: ${productTitle}, image: ${imageUrl.substring(0, 50)}...`);
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6" data-asin="${product.asin || ''}" data-title="${productTitle}">
  <div class="product-rank absolute top-2 left-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${rank}</div>
  <div class="p-4">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3 flex items-center justify-center">
        <img src="${imageUrl}" 
             alt="${rankedTitle}" 
             class="w-full h-auto rounded-md object-contain max-h-48"
             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80'; this.classList.add('fallback-image');" />
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        <h4 class="text-xl font-semibold mb-2">${rankedTitle}</h4>
        ${generateStarsHtml(productRating, productRatingTotal)}
        <p class="text-lg font-bold mb-3">${productPrice}</p>
        <div class="mb-4">
          <a href="${productUrl}" 
             class="button-amazon inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200" 
             target="_blank" rel="nofollow noopener">
            Check Price on Amazon
          </a>
        </div>
        <div class="text-sm text-gray-600">
          <p><strong>ASIN:</strong> ${product.asin || 'N/A'}</p>
          <p><strong>Model:</strong> ${product.model || product.title?.split(' ').slice(1, 3).join(' ') || 'N/A'}</p>
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}
