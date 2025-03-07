
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { extractSearchParamsFromPrompt, fetchAmazonProducts } from './amazonProductService';

export async function processTop10Content(content: string, prompt: string): Promise<string> {
  console.log('🔄 Starting processTop10Content');
  console.log(`📝 Original prompt: "${prompt.substring(0, 100)}..."`);
  console.log(`📄 Content length before processing: ${content.length} characters`);
  
  try {
    // Extract search parameters from the prompt
    console.log('🔍 Extracting search parameters from prompt...');
    const extractedParams = extractSearchParamsFromPrompt(prompt);
    console.log('🎯 Extracted search parameters:', JSON.stringify(extractedParams, null, 2));
    
    // First, try to get products from localStorage (fetched earlier)
    let products = [];
    const storedProducts = localStorage.getItem('currentTop10Products');
    
    if (storedProducts) {
      console.log('📦 Found pre-fetched products in localStorage');
      try {
        products = JSON.parse(storedProducts);
        console.log(`Found ${products.length} products in localStorage`);
        if (products.length > 0) {
          console.log(`First product title: ${products[0]?.title || 'Unknown'}`);
          console.log(`First product has HTML content: ${!!products[0]?.htmlContent}`);
          
          // If htmlContent is missing, generate it now
          if (!products[0]?.htmlContent) {
            console.log('🔄 Generating missing HTML content for products...');
            products = products.map((product, index) => {
              if (!product.htmlContent) {
                product.htmlContent = generateFallbackHtml(product, index + 1);
                console.log(`✅ Generated HTML content for product #${index + 1}`);
              }
              return product;
            });
          }
        }
        // Clear the storage to avoid using these products for another post
        localStorage.removeItem('currentTop10Products');
      } catch (parseError) {
        console.error('Error parsing stored products:', parseError);
        console.error('Raw stored products string:', storedProducts.substring(0, 100) + '...');
        products = [];
      }
    }
    
    // If no stored products, fetch them now as a fallback
    if (!products || products.length === 0) {
      console.log(`🚀 No pre-fetched products found. Fetching Amazon products with query: "${extractedParams.searchParams.query}"`);
      console.log(`📤 Search parameters being sent to API: ${JSON.stringify(extractedParams.searchParams)}`);
      
      try {
        products = await fetchAmazonProducts(extractedParams);
        console.log(`✅ fetchAmazonProducts returned ${products?.length || 0} products`);
        
        // Check if htmlContent is missing and generate it if needed
        if (products.length > 0 && !products[0]?.htmlContent) {
          console.log('🔄 Generating missing HTML content for newly fetched products...');
          products = products.map((product, index) => {
            if (!product.htmlContent) {
              product.htmlContent = generateFallbackHtml(product, index + 1);
              console.log(`✅ Generated HTML content for product #${index + 1}`);
            }
            return product;
          });
        }
      } catch (callError) {
        console.error('💥 Exception during Amazon products fetch:', callError);
        toast({
          title: 'Error calling product service',
          description: 'Technical error while fetching products. Please try again.',
          variant: 'destructive',
        });
      }
    }
    
    // If we still don't have products, continue with the content as is
    if (!products || products.length === 0) {
      console.warn('⚠️ No Amazon products found, proceeding with original content');
      toast({
        title: 'No products found',
        description: 'We couldn\'t find any products matching your criteria for the Top 10 post',
        variant: 'default',
      });
      return content;
    }
    
    console.log(`✅ Successfully fetched ${products.length} products from Amazon`);
    if (products.length > 0) {
      console.log(`🔍 First product: "${products[0]?.title?.substring(0, 30) || 'Unknown'}..."`);
      console.log(`First product has HTML content: ${!!products[0]?.htmlContent}`);
    }
    
    // First, remove the excerpt and tags from the content
    let processedContent = content;
    
    // Remove the excerpt
    processedContent = processedContent.replace(/\*\*Excerpt:\*\*.*?---/s, '');
    
    // Remove the tags
    processedContent = processedContent.replace(/\*\*Tags:\*\*.*$/s, '');
    
    // Replace the product data placeholders with actual data
    console.log('🔄 Replacing product data placeholders in content...');
    
    let replacementsCount = 0;
    
    // Process both standard div placeholders and raw product data mentions
    for (let i = 0; i < Math.min(products.length, 10); i++) {
      const product = products[i];
      const productNum = i + 1;
      
      // Look for the product card HTML that appears as text in the content
      const productCardRegex = new RegExp(`\\s*<div class="product-card"[^>]*>([\\s\\S]*?)<\\/div>\\s*`, 'g');
      
      if (product && product.htmlContent) {
        // Replace the product card HTML that's showing as text
        if (productCardRegex.test(processedContent)) {
          processedContent = processedContent.replace(productCardRegex, '\n' + product.htmlContent + '\n');
          replacementsCount += 1;
        }
        
        // Also replace any remaining placeholders
        const divPlaceholder = `<div class="product-data" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
        const rawPlaceholder = `[PRODUCT_DATA_${productNum}]`;
        
        if (processedContent.includes(divPlaceholder)) {
          processedContent = processedContent.split(divPlaceholder).join(product.htmlContent || '');
          replacementsCount += 1;
        }
        
        if (processedContent.includes(rawPlaceholder)) {
          processedContent = processedContent.split(rawPlaceholder).join(product.htmlContent || '');
          replacementsCount += 1;
        }
      } else {
        console.warn(`⚠️ No HTML content found for product #${productNum}`);
        if (product) {
          console.log(`Product data exists but htmlContent is missing. Title: ${product.title || 'Unknown'}`);
          
          // If htmlContent is missing but we have product data, generate it on the fly
          const fallbackHtml = generateFallbackHtml(product, productNum);
          
          // Replace the product card HTML that's showing as text
          if (productCardRegex.test(processedContent)) {
            processedContent = processedContent.replace(productCardRegex, '\n' + fallbackHtml + '\n');
            replacementsCount += 1;
          }
          
          // Also replace any remaining placeholders
          const divPlaceholder = `<div class="product-data" data-product-id="${productNum}">[PRODUCT_DATA_${productNum}]</div>`;
          const rawPlaceholder = `[PRODUCT_DATA_${productNum}]`;
          
          if (processedContent.includes(divPlaceholder)) {
            processedContent = processedContent.split(divPlaceholder).join(fallbackHtml);
            replacementsCount += 1;
          }
          
          if (processedContent.includes(rawPlaceholder)) {
            processedContent = processedContent.split(rawPlaceholder).join(fallbackHtml);
            replacementsCount += 1;
          }
        }
      }
    }
    
    // Add Humix video embed if not already present
    if (!processedContent.includes('humixPlayers')) {
      console.log('📼 Adding Humix video embed to content');
      const videoEmbed = `<div class="video-container my-8"><script data-ezscrex="false" data-cfasync="false">(window.humixPlayers = window.humixPlayers || []).push({target: document.currentScript});</script><script async data-ezscrex="false" data-cfasync="false" src="https://www.humix.com/video.js"></script></div>`;
      
      // Insert after the first h2 or at the end if no h2 is found
      const h2Match = processedContent.match(/<h2[^>]*>.*?<\/h2>/i);
      if (h2Match && h2Match.index) {
        const insertPosition = h2Match.index + h2Match[0].length;
        processedContent = processedContent.substring(0, insertPosition) + 
                          '\n\n' + videoEmbed + '\n\n' + 
                          processedContent.substring(insertPosition);
      } else {
        // Add to the end if no h2 is found
        processedContent += '\n\n' + videoEmbed;
      }
    }
    
    console.log(`✅ Replaced ${replacementsCount} product placeholders in content`);
    console.log(`📏 Content length after processing: ${processedContent.length} characters`);
    
    if (replacementsCount === 0) {
      console.warn('⚠️ No product placeholders were replaced in the content');
      
      // If no placeholders were found, we'll check the content for any mentions of product data
      if (content.includes('[PRODUCT_DATA_')) {
        console.log('🔍 Found placeholder patterns but couldn\'t replace them');
      } else {
        console.warn('⚠️ No placeholder patterns found in content at all');
      }
    }
    
    return processedContent;
  } catch (error) {
    console.error('💥 Error in processTop10Content:', error);
    console.error('💥 Error details:', error instanceof Error ? error.message : String(error));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack available');
    toast({
      title: 'Error processing content',
      description: error instanceof Error ? error.message : 'Failed to process Top 10 content',
      variant: 'destructive',
    });
    return content;
  }
}

// Generate fallback HTML if the product doesn't have htmlContent
function generateFallbackHtml(product: any, rank: number): string {
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

// Simple HTML escape function to prevent XSS in product data
function escapeHtml(unsafe: string | number | undefined): string {
  if (unsafe === undefined || unsafe === null) return '';
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
