
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
  
  // Generate and return the HTML with specifications in a 2-column layout
  return `
    <div class="product-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden" data-asin="${asin}" data-rank="${position}">
      <div class="product-rank bg-green-600 text-white font-bold py-1 px-3 absolute top-2 left-2 rounded-full shadow-md">#${position}</div>
      <div class="product-image relative">
        <a href="${url}" target="_blank" rel="nofollow noopener">
          <img src="${image}" alt="${title.replace(/"/g, '&quot;')}" loading="lazy" class="w-full h-auto object-contain bg-white" />
        </a>
        <div class="product-rating flex justify-center items-center mt-2 mb-3">
          <span class="text-amber-500">${starsHtml}</span> 
          <span class="ml-1">${rating}/5 (${formattedRatings})</span>
        </div>
      </div>
      <div class="product-details p-4">
        <div class="product-specs bg-gray-50 p-3 rounded-md mb-4">
          <div class="specs-grid grid grid-cols-2 gap-2">
            <div class="spec-item">
              <span class="spec-name font-medium text-gray-700">CPU:</span>
              <span class="spec-value text-gray-900">${cpu}</span>
            </div>
            <div class="spec-item">
              <span class="spec-name font-medium text-gray-700">Storage:</span>
              <span class="spec-value text-gray-900">${storage}</span>
            </div>
            <div class="spec-item">
              <span class="spec-name font-medium text-gray-700">RAM:</span>
              <span class="spec-value text-gray-900">${ram}</span>
            </div>
            <div class="spec-item">
              <span class="spec-name font-medium text-gray-700">Screen:</span>
              <span class="spec-value text-gray-900">${screen}</span>
            </div>
            <div class="spec-item">
              <span class="spec-name font-medium text-gray-700">Graphics:</span>
              <span class="spec-value text-gray-900">${graphics}</span>
            </div>
            <div class="spec-item">
              <span class="spec-name font-medium text-gray-700">Battery:</span>
              <span class="spec-value text-gray-900">${battery}</span>
            </div>
          </div>
        </div>
        
        <div class="product-cta flex justify-center">
          <a href="${url}" class="check-price-btn button-amazon bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-8 rounded inline-block w-auto min-w-[200px] max-w-[300px] mx-auto text-center whitespace-nowrap transition-colors duration-200" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
        </div>
      </div>
    </div>
  `;
}
