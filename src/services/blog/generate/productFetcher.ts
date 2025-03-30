
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
      // Store products in local storage for use after content generation
      console.log('💾 Storing fetched products in localStorage for later use');
      try {
        localStorage.setItem('currentTop10Products', JSON.stringify(products));
        console.log('✅ Products successfully stored in localStorage');
      } catch (storageError) {
        console.error('❌ Error storing products in localStorage:', storageError);
        console.log('💾 Will continue without localStorage backup');
      }
    }
    
    return products;
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
