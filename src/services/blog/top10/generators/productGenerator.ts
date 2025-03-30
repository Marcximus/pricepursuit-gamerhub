
import React from 'react';

export function generateProductHtml(product: any, position: number): string {
  if (!product) {
    console.warn('⚠️ No product data provided to generateProductHtml');
    return `<div class="product-card bg-gray-100 p-4 text-center rounded-lg border border-gray-300">
      <p class="text-gray-600">Product information not available</p>
    </div>`;
  }
  
  // Log full product data for debugging
  console.log(`🧩 Full product data for position ${position}:`, JSON.stringify(product).substring(0, 500) + '...');
  
  // Extract product data, use position for ranking
  const asin = product.asin || '';
  const title = product.title || 'Unknown Product';
  const image = product.image || product.imageUrl || '';
  const url = product.url || product.productUrl || `https://amazon.com/dp/${asin}?tag=with-laptop-discount-20`;
  const price = typeof product.price === 'number' ? product.price.toFixed(2) : (product.price || '');
  const rating = product.rating || 0;
  const ratingsTotal = product.ratings_total || product.ratings_count || 0;
  const isBestSeller = product.is_best_seller || false;
  
  // Extract product specifications, with multiple fallbacks
  const cpu = product.cpu || product.processor || 'Not specified';
  const ram = product.ram || 'Not specified';
  const graphics = product.graphics || 'Not specified';
  const storage = product.storage || 'Not specified';
  const screen = product.screen || product.screen_size || 'Not specified';
  const battery = product.battery || product.battery_life || 'Not specified';
  
  // Log the specifications for debugging
  console.log(`🔍 Product ${position} specs: 
    Title: ${title.substring(0, 50)}... 
    CPU: ${cpu}, 
    RAM: ${ram}, 
    Graphics: ${graphics}, 
    Storage: ${storage},
    Screen: ${screen},
    Battery: ${battery}`
  );
  
  // Generate rating stars HTML
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  
  let starsHtml = '';
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '★';
    } else if (i === fullStars && hasHalfStar) {
      starsHtml += '½';
    } else {
      starsHtml += '☆';
    }
  }
  
  // Format ratings number with commas
  const formattedRatings = ratingsTotal ? ratingsTotal.toLocaleString() : '0';
  
  // Log what we're generating for debugging
  console.log(`🧩 Generating product HTML for position ${position}: ${title.substring(0, 30)}...`);
  
  // Generate and return the HTML with prominent specifications
  return `
    <div class="product-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden" data-asin="${asin}" data-rank="${position}">
      <div class="product-rank bg-green-600 text-white font-bold py-1 px-3 absolute top-2 left-2 rounded-full shadow-md">#${position}</div>
      <div class="product-image relative">
        <a href="${url}" target="_blank" rel="nofollow noopener">
          <img src="${image}" alt="${title.replace(/"/g, '&quot;')}" loading="lazy" class="w-full h-auto object-contain bg-white" />
        </a>
      </div>
      <div class="product-details p-4">
        <div class="product-meta flex justify-between items-center mb-3">
          <span class="product-price font-bold text-green-700">${price ? `$${price}` : 'Check price'}</span>
          <span class="product-rating"><span class="text-amber-500">${starsHtml}</span> ${rating}/5 (${formattedRatings})</span>
        </div>
        
        <div class="product-specs bg-gray-50 p-3 rounded-md mb-4">
          <table class="specs-table w-full">
            <tbody>
              <tr>
                <td class="spec-name font-medium text-gray-700 pr-2">CPU:</td>
                <td class="spec-value text-gray-900">${cpu}</td>
              </tr>
              <tr>
                <td class="spec-name font-medium text-gray-700 pr-2">RAM:</td>
                <td class="spec-value text-gray-900">${ram}</td>
              </tr>
              <tr>
                <td class="spec-name font-medium text-gray-700 pr-2">Graphics:</td>
                <td class="spec-value text-gray-900">${graphics}</td>
              </tr>
              <tr>
                <td class="spec-name font-medium text-gray-700 pr-2">Storage:</td>
                <td class="spec-value text-gray-900">${storage}</td>
              </tr>
              <tr>
                <td class="spec-name font-medium text-gray-700 pr-2">Screen:</td>
                <td class="spec-value text-gray-900">${screen}</td>
              </tr>
              <tr>
                <td class="spec-name font-medium text-gray-700 pr-2">Battery:</td>
                <td class="spec-value text-gray-900">${battery}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="product-cta">
          <a href="${url}" class="check-price-btn button-amazon bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded inline-block w-full text-center transition-colors duration-200" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
        </div>
      </div>
    </div>
  `;
}
