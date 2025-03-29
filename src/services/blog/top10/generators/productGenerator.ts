
/**
 * Product HTML generation utilities for Top10 blog posts
 */
import { formatPrice, formatAmazonUrl, generateStarsHtml } from '../utils';

/**
 * Generate HTML for a product card
 */
export function generateProductHtml(product: any, index: number): string {
  // Extract shorter name instead of using the long Amazon title
  const brandName = product.brand || 'Lenovo';
  const modelInfo = product.model || '';
  
  // Create a simplified product title
  const simplifiedTitle = modelInfo ? `${brandName} ${modelInfo}` : 
                        (product.title ? product.title.split(' ').slice(0, 3).join(' ') : `${brandName} Laptop`);
  
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
  
  // Calculate the proper product ranking (from #10 to #1)
  const rank = 10 - (index % 10);
  
  // Generate star rating HTML
  const starsHtml = generateStarsHtml(productRating, productRatingTotal);
  
  // Extract key specifications for display
  let screenSize = extractSpecification(product, 'screen_size') || extractScreenSize(product.title || '');
  let processor = extractSpecification(product, 'processor') || extractProcessor(product.title || '');
  let ram = extractSpecification(product, 'ram') || extractRam(product.title || '');
  let storage = extractSpecification(product, 'storage') || extractStorage(product.title || '');
  let graphics = extractSpecification(product, 'graphics') || extractGraphics(product.title || '');
  let batteryLife = extractSpecification(product, 'battery_life') || '';
  
  // Ensure we have placeholders for missing specs
  screenSize = screenSize || 'N/A';
  processor = processor || 'N/A';
  ram = ram || 'N/A';
  storage = storage || 'N/A';
  graphics = graphics || 'N/A';
  batteryLife = batteryLife || 'N/A';
  
  console.log(`🖼️ Generating HTML for product #${rank}: ${simplifiedTitle}`);
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6" data-asin="${product.asin || ''}" data-rank="${rank}">
  <div class="product-rank absolute top-2 left-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${rank}</div>
  <div class="p-4">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3 flex items-center justify-center">
        <img src="${imageUrl}" 
             alt="${simplifiedTitle}" 
             class="w-full h-auto rounded-md object-contain max-h-48"
             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80'; this.classList.add('fallback-image');" />
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        <h4 class="text-xl font-semibold mb-2 product-title">${simplifiedTitle}</h4>
        ${starsHtml}
        <p class="text-lg font-bold mb-3">${productPrice}</p>
        <div class="specs-grid grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
          <div><span class="font-medium">Display:</span> ${screenSize}</div>
          <div><span class="font-medium">CPU:</span> ${processor}</div>
          <div><span class="font-medium">RAM:</span> ${ram}</div>
          <div><span class="font-medium">Storage:</span> ${storage}</div>
          <div><span class="font-medium">Graphics:</span> ${graphics}</div>
          <div><span class="font-medium">Battery:</span> ${batteryLife}</div>
        </div>
        <div class="mb-4">
          <a href="${productUrl}" 
             class="button-amazon inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200" 
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

/**
 * Extract specification from product object directly
 */
function extractSpecification(product: any, specName: string): string | null {
  if (product && product[specName] && 
      typeof product[specName] === 'string' && 
      product[specName].length > 0 &&
      product[specName] !== 'undefined' &&
      product[specName] !== 'null') {
    return product[specName];
  }
  return null;
}

/**
 * Extract screen size from product title
 */
function extractScreenSize(title: string): string {
  const screenSizeMatch = title.match(/(\d+\.?\d?)["-]\s?(inch|display|screen|FHD|HD|UHD|QHD)/i);
  return screenSizeMatch ? `${screenSizeMatch[1]}"` : '';
}

/**
 * Extract processor information from product title
 */
function extractProcessor(title: string): string {
  const intelMatch = title.match(/Intel\s+(Core\s+i[3579]|Celeron|Pentium)(?:\s+[\w-]+)?/i);
  const amdMatch = title.match(/AMD\s+(Ryzen|A[3-9]|Athlon)(?:\s+[\w-]+)?/i);
  const appleMatch = title.match(/Apple\s+M[123](?:\s+(?:Pro|Max|Ultra))?/i);
  const mediaMatch = title.match(/MediaTek\s+[\w\d]+/i);
  
  if (intelMatch) return intelMatch[0];
  if (amdMatch) return amdMatch[0];
  if (appleMatch) return appleMatch[0];
  if (mediaMatch) return mediaMatch[0];
  
  return '';
}

/**
 * Extract RAM information from product title
 */
function extractRam(title: string): string {
  const ramMatch = title.match(/(\d+)(?:\s?GB|\s?TB)?\s+RAM/i);
  return ramMatch ? `${ramMatch[1]}GB` : '';
}

/**
 * Extract storage information from product title
 */
function extractStorage(title: string): string {
  const ssdMatch = title.match(/(\d+)(?:\s?GB|\s?TB)?\s+(?:SSD|eMMC)/i);
  const hddMatch = title.match(/(\d+)(?:\s?GB|\s?TB)?\s+HDD/i);
  
  if (ssdMatch) return `${ssdMatch[1]}GB SSD`;
  if (hddMatch) return `${hddMatch[1]}GB HDD`;
  
  return '';
}

/**
 * Extract graphics information from product title
 */
function extractGraphics(title: string): string {
  const nvidiaMatch = title.match(/(?:NVIDIA|GeForce)\s+(?:GTX|RTX|MX)[\s\d]+/i);
  const intelMatch = title.match(/Intel\s+(?:UHD|Iris)\s+Graphics(?:\s+\d+)?/i);
  const amdMatch = title.match(/AMD\s+Radeon[\s\w\d]+/i);
  
  if (nvidiaMatch) return nvidiaMatch[0];
  if (intelMatch) return intelMatch[0];
  if (amdMatch) return amdMatch[0];
  
  return '';
}
