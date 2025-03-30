
/**
 * Functions for handling products in Top10 blog posts
 */
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Get products either from localStorage or by fetching them
 */
export async function getProducts(prompt: string): Promise<any[]> {
  console.log('🔍 Getting products for prompt:', prompt);
  
  // First, try to get products from localStorage
  try {
    const storedProducts = localStorage.getItem('currentTop10Products');
    if (storedProducts) {
      console.log('📦 Found stored products in localStorage');
      
      try {
        const products = JSON.parse(storedProducts);
        if (Array.isArray(products) && products.length > 0) {
          console.log(`✅ Successfully parsed ${products.length} products from localStorage`);
          
          // Ensure products have proper position values for correct ordering
          return products.map((product, index) => ({
            ...product,
            position: index + 1 // First product is #1, last is #10
          }));
        }
      } catch (parseError) {
        console.error('❌ Error parsing localStorage products:', parseError);
      }
    }
  } catch (error) {
    console.error('❌ Error accessing localStorage:', error);
  }
  
  console.log('📤 No valid products in localStorage, fetching from API...');
  
  // If we didn't find valid products in localStorage, we need to fetch them
  try {
    // Extract search parameters from the prompt
    const searchParams = extractSearchParamsFromPrompt(prompt);
    console.log('🔎 Extracted search parameters:', searchParams);
    
    // Call the edge function to fetch products
    const { data, error } = await supabase.functions.invoke('fetch-top10-products', {
      body: { searchParams, count: 10 },
    });
    
    if (error) {
      console.error('❌ Error fetching products from API:', error);
      toast({
        title: 'Error Fetching Products',
        description: 'Unable to fetch product data. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
    
    if (!data || !data.products || !Array.isArray(data.products)) {
      console.error('❌ Invalid response from API:', data);
      toast({
        title: 'Invalid Product Data',
        description: 'The API returned invalid product data. Please try again.',
        variant: 'destructive',
      });
      return [];
    }
    
    console.log(`✅ Fetched ${data.products.length} products from API`);
    
    // Ensure products have proper position values for correct ordering
    const productsWithPositions = data.products.map((product, index) => ({
      ...product,
      position: index + 1 // First product is #1, last is #10
    }));
    
    // Store the products in localStorage for future use
    try {
      localStorage.setItem('currentTop10Products', JSON.stringify(productsWithPositions));
      console.log('💾 Stored products in localStorage for later use');
    } catch (storageError) {
      console.error('❌ Error storing products in localStorage:', storageError);
    }
    
    return productsWithPositions;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    toast({
      title: 'Error Fetching Products',
      description: 'An unexpected error occurred. Please try again.',
      variant: 'destructive',
    });
    return [];
  }
}

/**
 * Extract search parameters from prompt
 * This is a simplified version, as the actual implementation would be in amazonProductService.ts
 */
function extractSearchParamsFromPrompt(prompt: string) {
  // Default parameters for demonstration
  // In a real implementation, this would parse the prompt to extract meaningful search terms
  return {
    searchParams: [
      { brand: 'Alienware', category: 'Laptops' }
    ]
  };
}
