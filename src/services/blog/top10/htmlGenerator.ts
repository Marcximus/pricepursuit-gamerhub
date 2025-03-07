
/**
 * HTML generation for product cards
 */
import { escapeHtml } from './utils';

// Generate fallback HTML if the product doesn't have htmlContent
export function generateProductHtml(product: any, rank: number): string {
  const title = product.title || 'Unknown Product';
  const price = typeof product.price === 'number' 
    ? `$${product.price.toFixed(2)}` 
    : (product.price?.value ? `$${parseFloat(product.price.value).toFixed(2)}` : 'Price not available');
  const rating = product.rating ? `${product.rating}/5` : 'No ratings';
  const reviews = product.ratings_total ? `(${product.ratings_total} reviews)` : '';
  const image = product.imageUrl || product.image || '';
  const asin = product.asin || '';
  const url = product.productUrl || product.url || '#';
  
  // Extract features or highlights
  const features = product.feature_bullets || product.features || [];
  const featuresList = features.length > 0 
    ? `<div class="product-features">
        <ul>
          ${features.slice(0, 3).map((feature: string) => 
            `<li>${escapeHtml(feature)}</li>`).join('')}
        </ul>
      </div>` 
    : '';
  
  return `
    <div class="product-card" data-asin="${escapeHtml(asin)}" data-rank="${rank}">
      <div class="product-rank">#${rank}</div>
      <div class="product-image">
        <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" />
        </a>
      </div>
      <div class="product-details">
        <h4 class="product-title">
          <a href="${escapeHtml(url)}" target="_blank" rel="nofollow noopener">${escapeHtml(title)}</a>
        </h4>
        <div class="product-meta">
          <span class="product-price">${escapeHtml(price)}</span>
          <span class="product-rating">${escapeHtml(rating)} ${escapeHtml(reviews)}</span>
        </div>
        ${featuresList}
        <div class="product-cta">
          <a href="${escapeHtml(url)}" class="check-price-btn" target="_blank" rel="nofollow noopener">Check Price on Amazon</a>
        </div>
      </div>
    </div>
  `;
}

// Add Humix video embed if not already present
export function addVideoEmbed(content: string): string {
  if (!content.includes('humixPlayers')) {
    console.log('📼 Adding Humix video embed to content');
    const videoEmbed = `<div class="video-container my-8"><script data-ezscrex="false" data-cfasync="false">(window.humixPlayers = window.humixPlayers || []).push({target: document.currentScript});</script><script async data-ezscrex="false" data-cfasync="false" src="https://www.humix.com/video.js"></script></div>`;
    
    // Insert after the first h2 or at the end if no h2 is found
    const h2Match = content.match(/<h2[^>]*>.*?<\/h2>/i);
    if (h2Match && h2Match.index) {
      const insertPosition = h2Match.index + h2Match[0].length;
      return content.substring(0, insertPosition) + 
              '\n\n' + videoEmbed + '\n\n' + 
              content.substring(insertPosition);
    } else {
      // Add to the end if no h2 is found
      return content + '\n\n' + videoEmbed;
    }
  }
  return content;
}
