
/**
 * Fetches required products for Top10 blog posts
 */
import { toast } from '@/components/ui/use-toast';
import { extractSearchParamsFromPrompt, fetchAmazonProducts } from '../amazonProductService';
import { handleGenerationError } from './errorHandler';

/**
 * Fetch Amazon products for Top10 blog posts
 */
export async function fetchProductsForTop10(prompt: string): Promise<any[]> {
  console.log('⭐ Detected Top10 post, extracting search parameters...');
  const extractedParams = extractSearchParamsFromPrompt(prompt);
  console.log('📊 Extracted parameters:', extractedParams);
  
  // Validate that we have a specific brand in the title if it appears to be a brand-specific post
  const isBrandSpecificPost = /top\s+10\s+best\s+(\w+)\s+laptops/i.test(prompt);
  if (isBrandSpecificPost && !extractedParams.searchParams.brand) {
    // Try to extract brand directly from the prompt title pattern
    const brandMatch = prompt.match(/top\s+10\s+best\s+(\w+)\s+laptops/i);
    if (brandMatch && brandMatch[1]) {
      const brandFromTitle = brandMatch[1].trim();
      console.log(`🔍 Extracted brand "${brandFromTitle}" directly from title pattern`);
      extractedParams.searchParams.brand = brandFromTitle;
    }
  }
  
  // Pre-process the content to fetch Amazon products
  console.log('🛒 Fetching Amazon products before generating content...');
  try {
    const products = await fetchAmazonProducts(extractedParams);
    console.log(`📦 Fetched ${products?.length || 0} products from Amazon API`);
    
    if (!products || products.length === 0) {
      console.warn('⚠️ No products were fetched from Amazon API');
      toast({
        title: 'Product Fetching Warning',
        description: 'No products were found. Cannot proceed without product data.',
        variant: 'destructive',
      });
      throw new Error('No products found for the specified query');
    } else {
      // Verify products match the requested brand if it's a brand-specific post
      if (extractedParams.searchParams.brand) {
        const targetBrand = extractedParams.searchParams.brand.toLowerCase();
        const matchingBrandProducts = products.filter(p => 
          (p.brand && p.brand.toLowerCase().includes(targetBrand)) || 
          (p.title && p.title.toLowerCase().includes(targetBrand))
        );
        
        console.log(`🔍 Found ${matchingBrandProducts.length}/${products.length} products matching brand "${targetBrand}"`);
        
        // If we have too few matching products, show a warning
        if (matchingBrandProducts.length < 5 && matchingBrandProducts.length > 0) {
          console.warn(`⚠️ Only found ${matchingBrandProducts.length} products for brand "${targetBrand}"`);
          toast({
            title: 'Limited Brand Products',
            description: `Only found ${matchingBrandProducts.length} products for ${extractedParams.searchParams.brand}. Some non-brand products may be included.`,
            variant: 'default', // Changed from 'warning' to 'default' since warning isn't available
          });
        } else if (matchingBrandProducts.length === 0) {
          console.error(`❌ No products found for brand "${targetBrand}"`);
          toast({
            title: 'Brand Not Found',
            description: `No ${extractedParams.searchParams.brand} products found. Using general laptop products instead.`,
            variant: 'destructive',
          });
        }
      }
      
      // Store products in local storage for use after content generation
      console.log('💾 Storing fetched products in localStorage for later use');
      try {
        // Ensure products have correct position values for ranking
        const productsWithPositions = products.map((product, index) => ({
          ...product,
          position: index + 1 // First product is #1, last is #10
        }));
        
        localStorage.setItem('currentTop10Products', JSON.stringify(productsWithPositions));
        console.log('✅ Products successfully stored in localStorage');
        
        return productsWithPositions;
      } catch (storageError) {
        console.error('❌ Error storing products in localStorage:', storageError);
        console.log('💾 Will continue without localStorage backup');
        
        // Ensure products have correct position values for ranking even if storage fails
        return products.map((product, index) => ({
          ...product,
          position: index + 1 // First product is #1, last is #10
        }));
      }
    }
  } catch (error) {
    console.error('❌ Error fetching Amazon products:', error);
    toast({
      title: 'Product Fetching Error',
      description: 'Could not fetch product data. Cannot proceed with blog generation.',
      variant: 'destructive',
    });
    throw new Error('Failed to fetch product data: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
