
/**
 * HTML generation utilities for Top10 blog posts
 */
import { formatPrice, formatAmazonUrl, generateStarsHtml } from './utils';

/**
 * Generate HTML for a product card
 */
export function generateProductHtml(product: any, index: number): string {
  const productTitle = product.title || 'Lenovo Laptop';
  const productPrice = formatPrice(product.price);
  const productRating = product.rating ? `${product.rating}/5 - ${product.ratings_total || 0} reviews` : 'No ratings';
  const productUrl = formatAmazonUrl(product.asin);
  const imageUrl = product.image_url || product.image || 'https://via.placeholder.com/300x200?text=Lenovo+' + encodeURIComponent(productTitle.substring(0, 20));
  
  console.log(`🖼️ Generating HTML for product #${index}: ${productTitle}, image: ${imageUrl.substring(0, 50)}...`);
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6">
  <div class="product-rank absolute top-2 left-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${11 - index}</div>
  <div class="p-4">
    <div class="flex flex-col md:flex-row">
      <div class="md:w-1/3 flex items-center justify-center">
        <img src="${imageUrl}" 
             alt="${productTitle}" 
             class="w-full h-auto rounded-md object-contain max-h-48" />
      </div>
      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
        <h4 class="text-xl font-semibold mb-2">${productTitle}</h4>
        ${generateStarsHtml(product.rating, product.ratings_total)}
        <p class="text-lg font-bold mb-3">${productPrice}</p>
        <div class="mb-4">
          <a href="${productUrl}" 
             class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors" 
             target="_blank" rel="nofollow noopener">
            Check Price on Amazon
          </a>
        </div>
        <div class="text-sm text-gray-600">
          <p><strong>ASIN:</strong> ${product.asin || 'N/A'}</p>
        </div>
      </div>
    </div>
  </div>
</div>
  `;
}

/**
 * Add a Humix video embed to the content if not already present
 */
export function addVideoEmbed(content: string): string {
  console.log('📼 Adding Humix video embed to content');
  
  // Check if the content already has a Humix player
  if (content.includes('humixPlayers') || content.includes('humix-player')) {
    console.log('✅ Humix player already exists in content');
    return content;
  }
  
  // Prepare the video embed code
  const videoEmbed = `
<div class="my-6">
  <h2 class="text-2xl font-bold mb-4">Video Review</h2>
  <div class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
    <div class="humix-player" data-video-id="BznUvXxNGnk0" data-account="88269" data-player-code="b83efd77"></div>
    <script>var humixPlayers = humixPlayers || []; humixPlayers.push("b83efd77");</script>
  </div>
</div>
`;
  
  // Find a good position to insert the video
  // Aim for after the introduction but before the first product
  const firstH3Index = content.indexOf('<h3');
  if (firstH3Index > 0) {
    // Insert before the first product heading
    return content.substring(0, firstH3Index) + videoEmbed + content.substring(firstH3Index);
  }
  
  // Fallback: insert at the end
  return content + videoEmbed;
}
