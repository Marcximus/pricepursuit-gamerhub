
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
    <div class="product-card" data-asin="${asin}" data-rank="${position}">
      <div class="product-rank">#${position}</div>
      <div class="product-image">
        <a href="${url}" target="_blank" rel="nofollow noopener">
          <img src="${image}" alt="${title.replace(/"/g, '&quot;')}" loading="lazy" />
        </a>
      </div>
      <div class="product-details">
        <div class="product-meta">
          <span class="product-price">${price ? `$${price}` : 'Check price'}</span>
          <span class="product-rating"><span class="text-amber-500">${starsHtml}</span> ${rating}/5 (${formattedRatings} reviews)</span>
        </div>
        
        <div class="product-specs">
          <table class="specs-table">
            <tbody>
              <tr>
                <td class="spec-name">CPU:</td>
                <td class="spec-value">${cpu}</td>
              </tr>
              <tr>
                <td class="spec-name">RAM:</td>
                <td class="spec-value">${ram}</td>
              </tr>
              <tr>
                <td class="spec-name">Graphics:</td>
                <td class="spec-value">${graphics}</td>
              </tr>
              <tr>
                <td class="spec-name">Storage:</td>
                <td class="spec-value">${storage}</td>
              </tr>
              <tr>
                <td class="spec-name">Screen:</td>
                <td class="spec-value">${screen}</td>
              </tr>
              <tr>
                <td class="spec-name">Battery:</td>
                <td class="spec-value">${battery}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="product-cta">
          <a href="${url}" class="check-price-btn button-amazon bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded inline-block transition-colors duration-200" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
        </div>
      </div>
    </div>
  `;
}
