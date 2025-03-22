
/**
 * Generate HTML components for blog posts
 */

/**
 * Generate HTML for a product based on its data and position
 */
export function generateProductHtml(product: any, rank: number): string {
  if (!product) {
    console.warn(`⚠️ Cannot generate HTML for undefined product at rank ${rank}`);
    return `<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6">
      <div class="p-4">
        <h4 class="text-xl font-semibold mb-2">Product information unavailable</h4>
      </div>
    </div>`;
  }
  
  // Ensure we have at least minimal product data
  const title = product.title || `Lenovo Laptop`;
  const asin = product.asin || '';
  const imageUrl = product.image || product.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
  const price = typeof product.price === 'object' 
    ? `$${product.price.value || 'Price unavailable'}` 
    : (product.price ? `$${product.price}` : 'Price unavailable');
  const rating = product.rating || 'No ratings';
  const reviewCount = product.ratings_total || product.reviews_count || 0;
  const reviewText = reviewCount > 0 ? `(${reviewCount} reviews)` : '';
  const productUrl = product.url || product.productUrl || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
  
  // Return a clean, well-structured product card
  return `<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6">
    <div class="p-4">
      <div class="flex flex-col md:flex-row">
        <div class="md:w-1/3 mb-4 md:mb-0">
          <a href="${productUrl}" target="_blank" rel="nofollow noopener">
            <img src="${imageUrl}" alt="${title}" class="w-full h-auto rounded-md" loading="lazy" />
          </a>
        </div>
        <div class="md:w-2/3 md:pl-4">
          <h4 class="text-xl font-semibold mb-2">
            <a href="${productUrl}" target="_blank" rel="nofollow noopener">${title}</a>
          </h4>
          <div class="flex items-center mb-2">
            <span class="text-yellow-500 mr-1">★</span>
            <span>${rating}</span>
            <span class="ml-1 text-gray-600 text-sm">${reviewText}</span>
          </div>
          <div class="text-lg font-bold mb-3">${price}</div>
          <a href="${productUrl}" 
             class="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
             target="_blank" rel="nofollow noopener">
            Check Price on Amazon
          </a>
        </div>
      </div>
    </div>
  </div>`;
}

/**
 * Adds a video embed if one is not already present
 */
export function addVideoEmbed(content: string): string {
  // Check if content already has a video embed
  if (content.includes('humixPlayers') || content.includes('iframe')) {
    return content;
  }
  
  // Add a Humix video embed before the first horizontal rule that follows the introduction
  const firstHrAfterIntro = content.indexOf('<hr class="my-8">');
  if (firstHrAfterIntro > 0) {
    const videoEmbed = `
<div class="video-container my-8">
  <div id="humixPlayer1" style="width: 100%; max-width: 800px; margin: 0 auto; aspect-ratio: 16/9;"></div>
  <script>
    window.humixPlayers = window.humixPlayers || [];
    window.humixPlayers.push({
      container: 'humixPlayer1',
      videoId: 'r8c3e4f64c76gd66',
    });
  </script>
</div>`;
    return content.slice(0, firstHrAfterIntro) + videoEmbed + content.slice(firstHrAfterIntro);
  }
  
  return content;
}
