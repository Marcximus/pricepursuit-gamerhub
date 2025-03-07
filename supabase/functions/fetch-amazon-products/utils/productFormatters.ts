
// Helper functions to format product data

export function formatSpecs(product: any): string {
  const specs = [];
  
  // Extract specifications from product data
  if (product.feature_bullets) {
    const features = product.feature_bullets.slice(0, 3);
    for (const feature of features) {
      const cleanFeature = feature
        .replace(/^[•\-\*]\s*/, '')  // Remove bullet points
        .replace(/[\[\]\(\)]/g, '')  // Remove brackets
        .trim();
        
      if (cleanFeature && cleanFeature.length > 5 && cleanFeature.length < 80) {
        specs.push(cleanFeature);
      }
    }
  }
  
  // If we couldn't extract meaningful specs, provide generic ones
  if (specs.length === 0) {
    specs.push("See product details on Amazon");
  }
  
  return specs.join(' | ');
}

export function generateHtmlContent(product: any, rank: number): string {
  const title = product.title.trim();
  const price = product.price?.value ? `$${product.price.value}` : 'Check price on Amazon';
  const rating = product.rating ? parseFloat(product.rating).toFixed(1) : '0.0';
  const ratingCount = product.ratings_total || '0';
  const imageUrl = product.image;
  const productUrl = product.url;
  const specs = formatSpecs(product);
  
  return `
    <div class="product-card">
      <div class="product-image">
        <img src="${imageUrl}" alt="${title}" class="rounded-lg w-full">
      </div>
      <div class="product-info">
        <h3 class="text-xl font-semibold">${title}</h3>
        <div class="specs text-sm text-gray-600 my-2">
          ${specs}
        </div>
        <div class="price-rating flex justify-between items-center">
          <div class="price font-bold">${price}</div>
          <div class="rating flex items-center">
            <span class="stars">★★★★★</span>
            <span class="rating-text ml-1">${rating}/5</span>
            <span class="rating-count ml-1">(${ratingCount})</span>
          </div>
        </div>
        <a href="${productUrl}" target="_blank" rel="noopener noreferrer" class="btn-view mt-2 block text-center bg-gaming-600 text-white py-2 px-4 rounded-md">View on Amazon</a>
      </div>
    </div>
  `;
}
