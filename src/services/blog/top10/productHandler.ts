
/**
 * Product handling for Top10 content
 */
import { fetchAmazonProducts, extractSearchParamsFromPrompt } from '../amazonProductService';
import { generateProductHtml } from './htmlGenerator';
import { 
  showErrorToast, 
  formatAmazonUrl, 
  generateStarsHtml, 
  formatPrice, 
  generateAffiliateButtonHtml,
  generateStars
} from './utils';

// Get products from localStorage or fetch them
export async function getProducts(prompt: string): Promise<any[]> {
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
              // Ensure product has title
              if (!product.title && product.asin) {
                product.title = `Lenovo Laptop (${product.asin})`;
              }
              
              // Generate HTML content for the product
              const stars = generateStars(product.rating);
              const price = formatPrice(product.price);
              const productUrl = formatAmazonUrl(product.asin);
              
              // Generate HTML content using the new utility functions if possible
              if (typeof generateStarsHtml === 'function' && typeof generateAffiliateButtonHtml === 'function') {
                product.htmlContent = `
                  <div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6">
                    <div class="p-4">
                      <h3 class="text-xl font-semibold mb-2">${product.title}</h3>
                      <div class="flex flex-col md:flex-row">
                        <div class="md:w-1/3">
                          <img src="${product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                               alt="${product.title}" 
                               class="w-full h-auto rounded-md" />
                        </div>
                        <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
                          ${generateStarsHtml(product.rating, product.reviews_count)}
                          <p class="text-lg font-bold mb-3">${price}</p>
                          <div class="mb-4">${generateAffiliateButtonHtml(product.asin)}</div>
                          <div class="text-sm text-gray-600">
                            <p><strong>ASIN:</strong> ${product.asin}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
              } else {
                product.htmlContent = generateProductHtml(product, index + 1);
              }
              
              console.log(`✅ Generated HTML content for product #${index + 1}`);
            }
            return product;
          });
        }
      }
      // Continue to clear the storage
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
      
      // Check if products are missing titles
      if (products.length > 0) {
        // Ensure all products have titles
        products = products.map((product, index) => {
          if (!product.title && product.asin) {
            product.title = `Lenovo Laptop (${product.asin})`;
          }
          return product;
        });
      }
      
      // Check if htmlContent is missing and generate it if needed
      if (products.length > 0 && !products[0]?.htmlContent) {
        console.log('🔄 Generating missing HTML content for newly fetched products...');
        products = products.map((product, index) => {
          if (!product.htmlContent) {
            // Generate HTML content for the product using new utility functions if possible
            if (typeof generateStarsHtml === 'function' && typeof generateAffiliateButtonHtml === 'function') {
              product.htmlContent = `
                <div class="product-card bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 my-6">
                  <div class="p-4">
                    <h3 class="text-xl font-semibold mb-2">${product.title}</h3>
                    <div class="flex flex-col md:flex-row">
                      <div class="md:w-1/3">
                        <img src="${product.image_url || 'https://via.placeholder.com/300x300?text=No+Image'}" 
                             alt="${product.title}" 
                             class="w-full h-auto rounded-md" />
                      </div>
                      <div class="md:w-2/3 md:pl-4 mt-4 md:mt-0">
                        ${generateStarsHtml(product.rating, product.reviews_count)}
                        <p class="text-lg font-bold mb-3">${formatPrice(product.price)}</p>
                        <div class="mb-4">${generateAffiliateButtonHtml(product.asin)}</div>
                        <div class="text-sm text-gray-600">
                          <p><strong>ASIN:</strong> ${product.asin}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            } else {
              // Fall back to the original method
              const stars = generateStars(product.rating);
              const price = formatPrice(product.price);
              const productUrl = formatAmazonUrl(product.asin);
              product.htmlContent = generateProductHtml(product, index + 1);
            }
            
            console.log(`✅ Generated HTML content for product #${index + 1}`);
          }
          return product;
        });
      }
    } catch (callError) {
      console.error('💥 Exception during Amazon products fetch:', callError);
      showErrorToast(
        'Error calling product service',
        'Technical error while fetching products. Please try again.'
      );
    }
  }
  
  return products;
}
