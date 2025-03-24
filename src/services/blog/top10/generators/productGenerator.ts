
/**
 * Product HTML generation utilities for Top10 blog posts
 */
import { formatPrice, formatAmazonUrl, generateStarsHtml } from '../utils';

/**
 * Extract processor information from product title
 */
function extractProcessor(title: string): string {
  const processorPatterns = [
    /Intel\s+Core\s+i[3579]-\d{4,5}[A-Z]*/i,
    /Intel\s+Core\s+i[3579]\s+\d{4,5}[A-Z]*/i,
    /Intel\s+Celeron\s+[A-Z0-9-]+/i,
    /MediaTek\s+[A-Z0-9-]+/i,
    /Ryzen\s+\d+\s+[A-Z0-9-]+/i,
    /AMD\s+Ryzen\s+\d+\s+[A-Z0-9-]+/i,
    /AMD\s+[A-Z][A-Z0-9-]+/i,
    /\d+-core\s+processor/i,
    /\d+-Core\s+[A-Z0-9]+\s+Processor/i,
  ];

  for (const pattern of processorPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0]; // Return the matched string, not the RegExpMatchArray
    }
  }

  return "Not specified";
}

/**
 * Extract graphics information from product title
 */
function extractGraphics(title: string): string {
  const graphicsPatterns = [
    /NVIDIA\s+GeForce\s+[A-Z0-9\s]+/i,
    /GeForce\s+[A-Z0-9\s]+/i,
    /Intel\s+UHD\s+Graphics\s*\d*/i,
    /Intel\s+Iris\s+[A-Za-z]+\s*Graphics/i,
    /AMD\s+Radeon\s+[A-Z0-9\s]+/i,
    /Radeon\s+[A-Z0-9\s]+/i,
    /PowerVR\s+[A-Z0-9]+/i,
    /Integrated\s+Graphics/i,
  ];

  for (const pattern of graphicsPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0]; // Return the matched string, not the RegExpMatchArray
    }
  }

  return "Integrated Graphics";
}

/**
 * Extract RAM information from product title
 */
function extractRam(title: string): string {
  const ramMatch = title.match(/(\d+)\s*GB\s+RAM/i);
  return ramMatch ? `${ramMatch[1]}GB RAM` : "RAM not specified";
}

/**
 * Extract storage information from product title
 */
function extractStorage(title: string): string {
  const storagePatterns = [
    /(\d+)\s*TB\s+(?:SSD|HDD|PCIe|NVMe)/i,
    /(\d+)\s*GB\s+(?:SSD|HDD|PCIe|NVMe)/i,
    /(\d+)\s*TB\s+(?:storage|drive)/i,
    /(\d+)\s*GB\s+(?:storage|drive)/i,
    /(\d+)\s*TB/i,
    /(\d+)\s*GB\s+eMMC/i,
  ];

  for (const pattern of storagePatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return "Storage not specified";
}

/**
 * Extract screen size information from product title
 */
function extractScreenSize(title: string): string {
  const screenMatch = title.match(/(\d+\.?\d*)[\-"]\s*(?:inch|display|HD|FHD|UHD|screen)/i);
  if (screenMatch) {
    return `${screenMatch[1]}" Display`;
  }
  
  // Try another pattern just looking for dimensions
  const dimensionMatch = title.match(/(\d+\.?\d*)["]/i);
  if (dimensionMatch) {
    return `${dimensionMatch[1]}" Display`;
  }
  
  return "Screen size not specified";
}

/**
 * Generate HTML for a product card
 */
export function generateProductHtml(product: any, index: number): string {
  // Use a cleaner product title - just the model name or a simplified version
  const modelName = product.model || 
                    (product.title && product.title.includes(' ') ? 
                    product.title.split(' ').slice(0, 3).join(' ') : 
                    'Lenovo Laptop');
                    
  // Create a clean title without excessive details
  const productTitle = `Lenovo ${modelName}`.replace(/Lenovo Lenovo/i, 'Lenovo');
  
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
  
  // Extract key specs from the title
  const fullTitle = product.title || '';
  const screenSize = extractScreenSize(fullTitle);
  const processor = extractProcessor(fullTitle);
  const ram = extractRam(fullTitle);
  const storage = extractStorage(fullTitle);
  const graphics = extractGraphics(fullTitle);
  
  console.log(`🖼️ Generating HTML for product #${rank}: ${productTitle.substring(0, 50)}...`);
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6" data-asin="${product.asin || ''}" data-rank="${rank}">
  <div class="product-rank absolute top-2 left-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${rank}</div>
  <div class="p-4">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3 flex items-center justify-center">
        <img src="${imageUrl}" 
             alt="${productTitle}" 
             class="w-full h-auto rounded-md object-contain max-h-48"
             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=300&q=80'; this.classList.add('fallback-image');" />
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        <h4 class="text-xl font-semibold mb-2 product-title">${productTitle}</h4>
        ${starsHtml}
        <p class="text-lg font-bold mb-3">${productPrice}</p>
        <div class="mb-4">
          <a href="${productUrl}" 
             class="button-amazon inline-block bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200" 
             target="_blank" rel="nofollow noopener">
            View Now on Amazon
          </a>
        </div>
        <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-sm text-gray-600">
          <p><strong>Display:</strong> ${screenSize}</p>
          <p><strong>Processor:</strong> ${processor}</p>
          <p><strong>Memory:</strong> ${ram}</p>
          <p><strong>Storage:</strong> ${storage}</p>
          <p><strong>Graphics:</strong> ${graphics}</p>
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}
