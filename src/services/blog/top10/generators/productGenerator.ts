
/**
 * Product HTML generation utilities for Top10 blog posts
 */
import { formatPrice, formatAmazonUrl, generateStarsHtml } from '../utils';

/**
 * Generate HTML for a product card
 */
export function generateProductHtml(product: any, index: number): string {
  // Extract shorter name instead of using the long Amazon title
  const brandName = product.brand || 'Unknown';
  
  // Create a simplified product title
  const productTitle = product.title ? product.title.split(' ').slice(0, 5).join(' ') : `${brandName} Laptop`;
  
  // Format values
  const productPrice = formatPrice(product.price);
  const productRating = product.rating || 0;
  const productRatingTotal = product.ratings_total || 0;
  const productAsin = product.asin || '';
  const affiliateTag = 'with-laptop-discount-20';
  const productUrl = `https://amazon.com/dp/${productAsin}?tag=${affiliateTag}`;
  
  // Process image URL with better fallbacks
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
  
  // Use the index + 1 directly as the rank (from #1 to #10)
  const rank = index + 1;
  
  // Generate star rating HTML
  const starsHtml = generateStarsHtml(productRating, productRatingTotal);
  
  // Extract key specifications for display - with enhanced error handling
  // First check if specs are directly in the product object
  const cpu = product.cpu || product.processor || 'Unknown';
  const ram = product.ram || 'Unknown';
  const graphics = product.graphics || 'Unknown';
  const storage = product.storage || 'Unknown';
  const screen = product.screen || product.screen_size || 'Unknown';
  const battery = product.battery || product.battery_life || 'Unknown';
  
  console.log(`🖼️ Generating HTML for product #${rank}: ${productTitle}`);
  console.log(`📊 Specifications for product #${rank}:`, {
    cpu, ram, graphics, storage, screen, battery
  });
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6" data-asin="${product.asin || ''}" data-rank="${rank}">
  <div class="product-rank absolute top-2 left-2 bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${rank}</div>
  <div class="p-4">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3 flex items-center justify-center">
        <a href="${productUrl}" class="relative block w-full h-full" target="_blank" rel="nofollow noopener">
          <img src="${imageUrl}" 
               alt="${productTitle}" 
               class="w-full h-auto rounded-md object-contain max-h-48 transition-transform duration-200 hover:scale-105"
               onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80'; this.classList.add('fallback-image');" />
        </a>
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        <h4 class="text-xl font-semibold mb-2 product-title text-green-800">
          <a href="${productUrl}" class="hover:underline cursor-pointer" target="_blank" rel="nofollow noopener">${productTitle}</a>
        </h4>
        <a href="${productUrl}" class="inline-block mb-2" target="_blank" rel="nofollow noopener">
          ${starsHtml}
        </a>
        <a href="${productUrl}" class="text-lg font-bold mb-3 inline-block hover:text-green-700" target="_blank" rel="nofollow noopener">
          ${productPrice}
        </a>
        <div class="specs-grid grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div><span class="font-medium">CPU:</span> ${cpu}</div>
          <div><span class="font-medium">RAM:</span> ${ram}</div>
          <div><span class="font-medium">Graphics:</span> ${graphics}</div>
          <div><span class="font-medium">Storage:</span> ${storage}</div>
          <div><span class="font-medium">Display:</span> ${screen}</div>
          <div><span class="font-medium">Battery:</span> ${battery}</div>
        </div>
        <div class="mb-4">
          <a href="${productUrl}" 
             class="button-amazon inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200" 
             target="_blank" rel="nofollow noopener">
            View Now on Amazon
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}
