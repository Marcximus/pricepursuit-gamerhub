
import { toast } from '@/components/ui/use-toast';
import { extractSearchParamsFromPrompt, fetchAmazonProducts } from './amazonProductService';

/**
 * Fetches and prepares product data for Top10 blog posts
 */
export async function prepareProductDataForTop10(prompt: string) {
  console.log('⭐ Detected Top10 post, extracting search parameters...');
  const extractedParams = extractSearchParamsFromPrompt(prompt);
  console.log('📊 Extracted parameters:', extractedParams);
  
  let products = [];
  
  // Pre-process the content to fetch Amazon products
  console.log('🛒 Fetching Amazon products before generating content...');
  try {
    products = await fetchAmazonProducts(extractedParams);
    console.log(`📦 Fetched ${products?.length || 0} products from Amazon API`);
    
    if (!products || products.length === 0) {
      console.warn('⚠️ No products were fetched from Amazon API');
      toast({
        title: 'Product Fetching Warning',
        description: 'No products were found. The blog post may be less specific without product data.',
        variant: 'default',
      });
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
  } catch (error) {
    console.error('❌ Error fetching Amazon products:', error);
    toast({
      title: 'Product Fetching Error',
      description: 'Could not fetch product data. The blog post will be generated with limited information.',
      variant: 'destructive',
    });
  }
  
  return products;
}

/**
 * Checks and warns if there's a category mismatch with the prompt
 */
export function checkCategoryMatch(prompt: string, category: string) {
  // Verify category matches content type
  // If the prompt seems like a Top10 list but category is different, show a warning
  if (prompt.toLowerCase().includes('top 10') && category !== 'Top10') {
    console.warn('⚠️ Prompt appears to be for a Top10 post, but selected category is:', category);
    toast({
      title: 'Category Mismatch Warning',
      description: 'Your prompt seems to be for a Top10 list. Consider changing the category to "Top10".',
      variant: 'default',
    });
  }
}
