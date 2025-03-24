
/**
 * Product HTML generation utilities for Top10 blog posts
 */
import { formatPrice, formatAmazonUrl, generateStarsHtml } from '../utils';

/**
 * Generate HTML for a product card
 */
export function generateProductHtml(product: any, index: number): string {
  // Use product title as the primary source of information, with better fallbacks
  const productTitle = product.title || 'Lenovo Laptop';
  
  // Create a shorter, cleaner title by truncating long product names
  // This removes the long Amazon-style product description titles
  const cleanTitle = productTitle.split(',')[0].trim();
  const shortTitle = cleanTitle.length > 50 ? cleanTitle.substring(0, 50) + '...' : cleanTitle;
  
  const productPrice = formatPrice(product.price);
  const productRating = product.rating || 0;
  const productRatingTotal = product.ratings_total || 0;
  const productAsin = product.asin || '';
  const affiliateTag = 'with-laptop-discount-20';
  const productUrl = `https://amazon.com/dp/${productAsin}?tag=${affiliateTag}`;
  
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
  
  // Generate star rating HTML
  const starsHtml = generateStarsHtml(productRating, productRatingTotal);
  
  // Extract key specs for display
  const screenSize = product.screen_size || extractScreenSize(productTitle);
  const processor = product.processor || extractProcessor(productTitle);
  const ram = product.ram || extractRam(productTitle);
  const storage = product.storage || extractStorage(productTitle);
  const graphics = product.graphics || extractGraphics(productTitle);
  
  console.log(`🖼️ Generating HTML for product #${rank}: ${shortTitle}`);
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6" data-asin="${product.asin || ''}" data-rank="${rank}">
  <div class="product-rank absolute top-2 left-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${rank}</div>
  <div class="p-4">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3 flex items-center justify-center">
        <img src="${imageUrl}" 
             alt="${shortTitle}" 
             class="w-full h-auto rounded-md object-contain max-h-48"
             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80'; this.classList.add('fallback-image');" />
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        <h4 class="text-xl font-semibold mb-2 product-title">${shortTitle}</h4>
        ${starsHtml}
        <p class="text-lg font-bold mb-3">${productPrice}</p>
        <div class="mb-4">
          <a href="${productUrl}" 
             class="button-amazon inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200" 
             target="_blank" rel="nofollow noopener">
            View Now on Amazon
          </a>
        </div>
        <div class="text-sm text-gray-600 specs-info">
          ${screenSize ? `<p><strong>Display:</strong> ${screenSize}</p>` : ''}
          ${processor ? `<p><strong>CPU:</strong> ${processor}</p>` : ''}
          ${ram ? `<p><strong>RAM:</strong> ${ram}</p>` : ''}
          ${storage ? `<p><strong>Storage:</strong> ${storage}</p>` : ''}
          ${graphics ? `<p><strong>Graphics:</strong> ${graphics}</p>` : ''}
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}

// Helper functions to extract specs from title when not available in product data
function extractScreenSize(title: string): string | null {
  const match = title.match(/(\d+\.?\d?)["\s-](?:inch|display)/i);
  return match ? `${match[1]}"` : null;
}

function extractProcessor(title: string): string | null {
  const intelMatch = title.match(/Intel\s+(?:Core\s+)?(?:i[3579]|Celeron|Pentium)[^\s,]*/i);
  const amdMatch = title.match(/AMD\s+Ryzen\s+[3579][^\s,]*/i);
  const mediaMatch = title.match(/MediaTek\s+[^\s,]*/i);
  return intelMatch || amdMatch || mediaMatch || null;
}

function extractRam(title: string): string | null {
  const match = title.match(/(\d+)(?:\s*GB|\s*G)\s+(?:DDR\d+\s+)?(?:RAM|Memory)/i);
  return match ? `${match[1]}GB` : null;
}

function extractStorage(title: string): string | null {
  const tbMatch = title.match(/(\d+)(?:\s*TB)\s+(?:SSD|HDD|Storage|PCIe)/i);
  const gbMatch = title.match(/(\d+)(?:\s*GB)\s+(?:SSD|HDD|Storage|eMMC|PCIe)/i);
  return tbMatch ? `${tbMatch[1]}TB` : (gbMatch ? `${gbMatch[1]}GB` : null);
}

function extractGraphics(title: string): string | null {
  const nvidiaMatch = title.match(/(?:NVIDIA|GeForce)\s+[^\s,]*/i);
  const amdMatch = title.match(/Radeon\s+[^\s,]*/i);
  const intelMatch = title.match(/Intel\s+(?:UHD|Iris|HD)\s+Graphics[^\s,]*/i);
  return nvidiaMatch || amdMatch || intelMatch || null;
}
