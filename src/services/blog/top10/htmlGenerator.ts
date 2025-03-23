
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
  
  // Calculate the proper product ranking (from #10 to #1)
  const rank = 10 - (index % 10);
  
  console.log(`🖼️ Generating HTML for product #${rank}: ${productTitle}, image: ${imageUrl.substring(0, 50)}...`);
  
  return `
<div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6">
  <div class="product-rank absolute top-2 left-2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">#${rank}</div>
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

/**
 * Wrap plain text in appropriate HTML tags
 * This is crucial for formatting unstructured content from AI
 */
export function wrapTextInHtml(content: string, title: string): string {
  // If content already has HTML structure, return as is
  if (content.includes('<h1>') || content.includes('<h2>') || content.includes('<p>')) {
    return content;
  }
  
  console.log('🔄 Converting plain text to HTML structure');
  
  // Add title as H1 if not present
  let htmlContent = `<h1>${title || 'Top 10 Best Lenovo Laptops'}</h1>\n\n`;
  
  // Process paragraphs
  const paragraphs = content.split(/\n\s*\n/);
  paragraphs.forEach((para, index) => {
    // Skip empty paragraphs
    if (!para.trim()) return;
    
    // Check if this looks like a heading (short, ends with no period)
    if (para.length < 60 && !para.trim().endsWith('.') && !para.includes('\n')) {
      // This is likely a heading - check if it's a numbered item or a model name
      if (/^\d+\.|\bLenovo\b/.test(para)) {
        htmlContent += `<h3>${para.trim()}</h3>\n\n`;
      } else {
        htmlContent += `<h2>${para.trim()}</h2>\n\n`;
      }
    } 
    // Check if it's a bullet point list
    else if (para.includes('✅') || para.includes('•') || para.includes('-')) {
      const items = para.split(/\n/).filter(item => item.trim());
      if (items.length > 1) {
        htmlContent += '<ul class="my-4">\n';
        items.forEach(item => {
          // Clean up bullet points
          const cleanItem = item.replace(/^[•✅-]\s*/, '').trim();
          htmlContent += `  <li>${cleanItem}</li>\n`;
        });
        htmlContent += '</ul>\n\n';
      } else {
        htmlContent += `<p>${para.trim()}</p>\n\n`;
      }
    } 
    // Regular paragraph
    else {
      htmlContent += `<p>${para.trim()}</p>\n\n`;
    }
  });
  
  return htmlContent;
}
