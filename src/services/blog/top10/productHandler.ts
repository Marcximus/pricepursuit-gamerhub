
/**
 * Product handling for Top10 content
 */
import { fetchAmazonProducts, extractSearchParamsFromPrompt } from '../amazonProductService';
import { generateProductHtml } from './htmlGenerator';
import { showErrorToast, formatAmazonUrl, generateStars, formatPrice, generateStarsHtml, generateAffiliateButtonHtml } from './utils';

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
        console.log(`First product image URL: ${products[0]?.image_url || products[0]?.image || 'None'}`);
        
        // Normalize image URL property across all products
        products = products.map(product => {
          // Ensure all products have a standardized image_url property
          if (!product.image_url && product.image) {
            product.image_url = product.image;
          }
          if (!product.image_url && !product.image && product.imageUrl) {
            product.image_url = product.imageUrl;
          }
          if (!product.image_url) {
            product.image_url = 'https://via.placeholder.com/300x200?text=Lenovo+Laptop';
          }
          
          // Generate fresh HTML for each product
          const productHtml = generateProductHtml(product, product.rank || 1);
          product.htmlContent = productHtml;
          
          return product;
        });
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
      
      // Normalize product data
      if (products.length > 0) {
        products = products.map((product, index) => {
          // Ensure essential fields
          if (!product.title && product.asin) {
            product.title = `Lenovo Laptop (${product.asin})`;
          }
          
          // Standardize image URL field
          if (!product.image_url && product.image) {
            product.image_url = product.image;
          }
          if (!product.image_url && !product.image && product.imageUrl) {
            product.image_url = product.imageUrl;
          }
          if (!product.image_url) {
            product.image_url = 'https://via.placeholder.com/300x200?text=Lenovo+Laptop';
          }
          
          // Add rank
          product.rank = index + 1;
          
          // Generate HTML content
          product.htmlContent = generateProductHtml(product, product.rank);
          
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
